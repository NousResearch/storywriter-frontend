import {ZodTypeAny, z, AnyZodObject} from "zod";
import React from "react";
import GlobalInput, {
	GlobalInputZod,
	GlobalNumericInput,
	GlobalNumericInputZod
} from "lib/remotecomponents/inputs/globalinput";
import VignetteDisplay, {VignetteDisplayZod} from "lib/remotecomponents/display/vignettes";
import SelectAction, {SelectActionZod} from "lib/remotecomponents/inputs/actions";
import LargeText, {LargeTextZod} from "lib/remotecomponents/display/large_text";
import ChooseVignette, {ChooseVignetteZod} from "lib/remotecomponents/inputs/actionwrap";
import Chapter, {ChapterZod} from "lib/remotecomponents/inputs/chapter";
import TextPrompt, {TextPromptZod} from "lib/remotecomponents/display/textprompt";

export type RequestComponentProps<TResponse extends AnyZodObject> = {
	value: z.infer<TResponse> | null;
	setValue: (value: z.infer<TResponse> | null) => void;
	onSubmit: () => void;
};

interface ComponentDefinition<T extends AnyZodObject, extraProps> {
	// this zod object tells us the shape of the props we will receive from the remote server for this component
	propsZod: T;
	// this is the actual React component
	component: React.FC<z.infer<T> & extraProps>;
}

interface RequestComponentDefinition<TProps extends AnyZodObject, TResponse extends AnyZodObject>
	extends ComponentDefinition<TProps, RequestComponentProps<TResponse>> {
	responseZod: TResponse,
}

function request<TProps extends AnyZodObject, TResponse extends AnyZodObject>(
	component: RequestComponentDefinition<TProps, TResponse>["component"],
	propsZod: TProps,
	responseZod: TResponse,
): RequestComponentDefinition<TProps, TResponse> {
	return {propsZod, responseZod, component};
}

function display<TProps extends AnyZodObject>(
	component: ComponentDefinition<TProps, null>["component"],
	propsZod: TProps,
): ComponentDefinition<TProps, null> {
	return {propsZod, component};
}

export interface ComponentZod<TProps extends AnyZodObject> {
	props: TProps,
}

export interface ResponseComponentZod<TProps extends AnyZodObject, TResponse extends AnyZodObject> extends ComponentZod<TProps> {
	props: TProps,
	response: TResponse,
}

export function componentZod<TProps extends AnyZodObject>(
	props: TProps,
): ComponentZod<TProps>
export function componentZod<TProps extends AnyZodObject, TResponse extends AnyZodObject>(
	props: TProps,
	response: TResponse
): ResponseComponentZod<TProps, TResponse>

export function componentZod<TProps extends AnyZodObject, TResponse extends AnyZodObject>(
	props: TProps,
	response?: TResponse
): ComponentZod<TProps> | ResponseComponentZod<TProps, TResponse> {
	if (response)
		return { props, response } as ResponseComponentZod<TProps, TResponse>
	else
		return { props } as ComponentZod<TProps>
}

export type inferComponentProps<T extends ComponentZod<any>> =
	T extends ResponseComponentZod<infer P, infer R>
		? z.infer<P> & RequestComponentProps<R>
		: z.infer<T["props"]>;

function ic<TProps extends AnyZodObject>(
	component: React.FC<z.infer<TProps>>,
	zod: ComponentZod<TProps>
): ReturnType<typeof display>;

function ic<TProps extends AnyZodObject, TResponse extends AnyZodObject>(
	component: React.FC<z.infer<TProps> & RequestComponentProps<TResponse>>,
	zod: ResponseComponentZod<TProps, TResponse>
): ReturnType<typeof request>;

// infer component type
function ic(
	component: React.FC<any>,
	zod: ComponentZod<any> | ResponseComponentZod<any, any>,
) {
	if ("response" in zod) {
		return request(component, zod.props, zod.response);
	} else {
		return display(component, zod.props);
	}
}

const components = {
	"ShowVignettes": ic(VignetteDisplay,  VignetteDisplayZod),
	// "SingleText": display(TextPromptDisplay, TextPrompt),
	"SelectAction": ic(SelectAction, SelectActionZod),
	"GlobalInput": ic(GlobalInput, GlobalInputZod),
	"GlobalNumericInput": ic(GlobalNumericInput, GlobalNumericInputZod),
	"LargeText": ic(LargeText, LargeTextZod),
	"ChooseVignette": ic(ChooseVignette, ChooseVignetteZod),
	"Chapter": ic(Chapter, ChapterZod),
	"TextPrompt": ic(TextPrompt, TextPromptZod),
} as const;

export function isRequestComponent<TProps extends AnyZodObject, TResponse extends AnyZodObject>(
	def: ComponentDefinition<TProps, any> | RequestComponentDefinition<TProps, TResponse>
): def is RequestComponentDefinition<TProps, TResponse> {
	return "responseZod" in def;
}

export function getComponentForKey<TProps extends AnyZodObject, TResponse extends AnyZodObject>(type: string): ComponentDefinition<TProps, null> | RequestComponentDefinition<TProps, TResponse> {
	if (!(type in components))
		throw new Error(`invalid/unregistered component type: ${type}`)

	const key = type as keyof typeof components;
	return components[key] as unknown as any;
}