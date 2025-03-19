import React, {ChangeEvent, RefObject, useEffect, useRef, useState} from "react";
import styled from "styled-components";
import {AnyZodObject, z, ZodTypeAny} from "zod";
import {componentZod, inferComponentProps} from "lib/remotecomponents/componentregistry";

// TODO: use a normal input on mobile, tablets, etc (detect virtual keyboard maybe?)
function useGlobalFocus(ref: RefObject<HTMLTextAreaElement | null>): void {
	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent): void => {
			if (!ref.current) return;

			// if we're already focused, do nothing
			if (document.activeElement === ref.current)
				return;

			const target = event.target as HTMLElement;

			// let inputs, etc handle their own events if focused
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable))
				return;

			// don't block copypaste
			if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() !== 'v')
				return;

			// allow arrow keys to pass through
			if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key))
				return;

			// focus if they've pressed a key that adds to the input, or removes from the input
			if (event.key.length > 0 || event.key === "Backspace" || event.key === "Delete")
				ref.current.focus();

			// TODO: handle ctrl+a? ctrl+x? hm.
		};

		const handlePaste = (event: ClipboardEvent): void => {
			if (!ref.current) return;
			if (document.activeElement === ref.current) return;

			const target = event.target as HTMLElement;
			if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable))
				return;

			ref.current.focus();
		};

		document.addEventListener('keydown', handleKeyDown);
		document.addEventListener('paste', handlePaste);

		return () => {
			document.removeEventListener('keydown', handleKeyDown);
			document.removeEventListener('paste', handlePaste);
		};
	}, [ref]);
}

export const GlobalInputZod = componentZod(
	z.object({
		placeholder: z.string().nullish(),
	}),
	z.object({
		text: z.string(),
	})
)

export default function GlobalInput(props: inferComponentProps<typeof GlobalInputZod>) {
	const inputRef = useRef<HTMLTextAreaElement | null>(null);


	useEffect(() => {
		inputRef.current?.focus();

		inputRef.current?.addEventListener("input", function() {
			this.style.height = "auto";
			this.style.height = "calc(2ex + " + this.scrollHeight + "px" + ")";
		});
	}, []);

	useGlobalFocus(inputRef);

	const handleChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
		props.setValue({text: e.target.value.replace("\n","")});
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter") {
			e.preventDefault();
			const trimmedValue = (props.value?.text ?? "").trim();

			if (trimmedValue.length > 0)
				props.onSubmit();
		}
	};

	return (
		<TransparentInput
			className={"prompt"}
			ref={inputRef}
			value={props.value?.text ?? ""}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			aria-label="Text input"
			placeholder={props.placeholder ?? "start typing..."}
		/>
	);
}

export const GlobalNumericInputZod = componentZod(
	GlobalInputZod.props.extend({
		min: z.number(),
		max: z.number(),
	}),
	z.object({
		value: z.number(),
	})
)

export function GlobalNumericInput(props: inferComponentProps<typeof GlobalNumericInputZod>) {
	return (
		<GlobalInput
			value={props.value === null ? null : {text: props.value.value.toString()}}
			setValue={(value) => {
				const conv = parseInt(value?.text.replace(/\D/g, '') ?? "0");
				if(conv < props.min || conv > props.max)
					return

				if(isNaN(conv)) {
					props.setValue(null)
				} else {
					props.setValue({value: conv})
				}
			}}
			onSubmit={props.onSubmit}
			placeholder={props.placeholder ?? "enter a number..."}
		/>
	)
}

const TransparentInput = styled.textarea`
	background: transparent;
	border: none;
	font-family: var(--font-primary), Arial, sans-serif;
	color: #777;
	font-size: 3rem;
	transition: 1s;
	
	resize: none;

	max-width: 25ch;
	width: 10000vw;
	justify-content: center;
	align-items: center;
	text-align: center;
	white-space: pre-wrap;
	word-wrap: break-word;
	
	overflow: hidden;
	outline: none;
`;