import React, {useState, useEffect, useRef, FC} from "react";
import {z} from "zod";
import WaitingForNext, {StatusUpdate, StatusUpdateZod} from "lib/remotecomponents/waiting";
import OneOf from "lib/remotecomponents/meta/oneof";
import AllOf from "lib/remotecomponents/meta/allof";
import {getComponentForKey, isRequestComponent} from "lib/remotecomponents/componentregistry";

interface ParsedMessage {
	type: string;
	payload: string;
}

/**
 * splits str by delimiter until limit splits, after which return the remainder
 *
 * (stdlib string.split truncates instead...)
 */
function splitLimit(str: string, delimiter: string, limit: number): string[] {
	const result: string[] = [];
	let remaining = str;

	for (let i = 0; i < limit - 1; i++) {
		const idx = remaining.indexOf(delimiter);
		if (idx === -1) {
			result.push(remaining);
			return result;
		}
		result.push(remaining.slice(0, idx));
		remaining = remaining.slice(idx + delimiter.length);
	}

	result.push(remaining);
	return result;
}

function parseMessage(message: string): ParsedMessage {
	const parts = splitLimit(message, "|", 2);
	if (parts.length < 2)
		throw new Error("Invalid message format (expected \"TYPE|...\"): " + message);

	const [type, payload] = parts;
	return {type, payload};
}

// interface InputRequestData {
// 	display_type: string;
// 	input_type: string;
// 	payload: string;
// }

const WrappedWithID = z.object({
	id: z.string(),
	data: z.object({
		type: z.string(),
	}).passthrough(),
})
const WrappedArray = z.array(WrappedWithID);

function parseComponentPayload(payload: string): z.infer<typeof WrappedArray> {
	return WrappedArray.parse(JSON.parse(payload));
}

const decoders = {
	"ONE_OF": parseComponentPayload,
	"ALL_OF": parseComponentPayload,
	"UPDATESTATUS": (payload: string) => StatusUpdateZod.parse(JSON.parse(payload)),
	"ERROR": (payload: string) => payload,
} as const;

interface WrappedState {
	id: string,
	data: any,
}

export interface RemoteComponent {
	component: React.FC<any>,
	props: any,
	value: null | {
		// this lets the parent wrap values with their id and validate zod types without passing them down
		// when onSubmit(value) => void is ultimately called it will include only wrapped values!
		// but unwrapped values are what gets passed to the components
		wrap: (value: any | null) => WrappedState | null,
		unwrap: (value: WrappedState | null) => any | null,
	},
}

interface WebSocketState {
	state: "connected" | "progress",
	components: Array<RemoteComponent>,
}

interface WebsocketFailed {
	state: "error",
	error: string,
}

export default function useWebSocket(remoteUrl: string): WebSocketState | WebsocketFailed | null {
	const currentRef = useRef<WebSocketState | WebsocketFailed | null>(null);
	const [current, _setCurrent] = useState<WebSocketState | WebsocketFailed | null>(null);
	const socketRef = useRef<WebSocket | null>(null);

	const sendMessage = function (message: string) {
		const socket = socketRef.current;

		if (socket && socket.readyState === WebSocket.OPEN) {
			socket.send(message);
		} else {
			console.error("WebSocket is not open. Cannot send message:", message);
		}
	};

	function setCurrent(value: WebSocketState | WebsocketFailed | null) {
		currentRef.current = value;
		_setCurrent(value);
	}

	useEffect(() => {
		const socket = new WebSocket(remoteUrl);
		socketRef.current = socket;

		const onOpen = () => {
			console.log("websocket connected to", remoteUrl);
		};

		const onMessage = (event: MessageEvent<string>) => {
			if(event.data == "PING") {
				sendMessage("PONG");
				return;
			}

			const parsedMessage = parseMessage(event.data);

			if (!parsedMessage) {
				console.error(`failed to parse websocket message:`, event.data);
				return;
			}

			const { type, payload } = parsedMessage;

			if (!(type in decoders)) {
				console.warn("no decoder for message type: ", type);
				return;
			}

			const key = type as keyof typeof decoders;

			if(key == "UPDATESTATUS") {
				const check = currentRef.current;

				if (check == null || check.state !== "progress")
					return

				const decoder = decoders[key];
				const data = decoder(payload);

				setCurrent({
					state: "progress",
					components: [
						{
							component: StatusUpdate,
							props: {update: data},
							value: null
						},
					]
				});
			} else if(key == "ERROR") {
				const decoder = decoders[key];
				const data = decoder(payload);
				setCurrent({state: "error", error: data});
			} else if(key == "ONE_OF" || key == "ALL_OF") {
				const decoder = decoders[key];
				const data = decoder(payload);
				const ret: WebSocketState["components"] = []

				for(const creq of data) {
					const { type, ...rawProps } = creq.data;
					const cdef = getComponentForKey(type);
					// TODO: ideally we'd type this better but alas
					const Component = cdef.component as FC<any>;
					const props = cdef.propsZod.parse(rawProps);

					if(isRequestComponent(cdef)) {
						ret.push({
							component: Component,
							props: props,
							value: {
								wrap: function(value): WrappedState | null {
									if(value === null)
										return null

									return {
										id: creq.id,
										data: cdef.responseZod.parse(value),
									}
								},
								unwrap: function(value) {
									if(value === null)
										return value

									return value.data
								}
							}
						})
					} else {
						ret.push({
							component: Component,
							props: props,
							value: null,
						})
					}
				}

				if(key === "ONE_OF") {
					setCurrent({
						state: "connected",
						components: [
							{
								component: OneOf,
								props: {
									components: ret,
									onSubmit: (value: any) => {
										sendMessage(key + "_RESPONSE|" + JSON.stringify([value]));
										setCurrent({state: "progress", components: [{component: WaitingForNext, props: {}, value: null}]})
									},
								},
								value: null,
							}
						]
					});
				} else if(key === "ALL_OF") {
					setCurrent({
						state: "connected",
						components: [
							{
								component: AllOf,
								props: {
									components: ret,
									onSubmit: (value: any) => {
										sendMessage(key + "_RESPONSE|" + JSON.stringify(value));
										setCurrent({state: "progress", components: [{component: WaitingForNext, props: {}, value: null}]})
									},
								},
								value: null,
							}
						]
					});
				} else {
					throw new Error("invalid/unhandled component key: " + key)
				}
			} else {
				console.error(`unhandled WS message:`, parsedMessage);
			}
		};

		function failure() {
			const check = currentRef.current;

			if(check === null || check.state !== "error")
				setCurrent({state: "error", error: "websocket connection failure"})
		}

		const onClose = () => {
			console.log("websocket connection closed");
			failure();
		};

		const onError = (error: Event) => {
			console.log("websocket error:", error);
			failure();
		};

		socket.addEventListener("open", onOpen);
		socket.addEventListener("message", onMessage);
		socket.addEventListener("close", onClose);
		socket.addEventListener("error", onError);

		return () => {
			socket.removeEventListener("open", onOpen);
			socket.removeEventListener("message", onMessage);
			socket.removeEventListener("close", onClose);
			socket.removeEventListener("error", onError);
			socket.close();
		};
	}, [remoteUrl]);

	return current;
}