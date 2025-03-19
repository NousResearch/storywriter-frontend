import {z} from "zod";
import React, {ChangeEvent, useEffect, useRef} from "react";
import styled from "styled-components";
import {Stack} from "lib/everylayout";
import {componentZod, inferComponentProps} from "lib/remotecomponents/componentregistry";

export const SelectActionZod = componentZod(
	z.object({
		actions: z.array(z.string()),
	}),
	z.object({
		action: z.string(),
	})
)

export default function SelectAction(props: inferComponentProps<typeof SelectActionZod>) {
	return (
		<ActionContainer>
			{props.actions.map(it => {
				return (
					<ButtonLink key={it} href="#" onClick={() => {
						props.setValue({action: it});
						props.onSubmit();
					}}>{it}</ButtonLink>
				)
			})}
		</ActionContainer>
	);
}

const ActionContainer = styled.div`
	display: inline-flex;
	flex-direction: column;
	gap: var(--s0);
	align-self: center;
`

const ButtonLink = styled.a`
	min-width: 15ch;
	padding: 0.6em 1.2em;
	border-radius: 0.5rem;
	background-color: #334d97;
	color: #f1f1f1;
	text-decoration: none;
	font-size: 1.8rem;
	font-weight: 500;
	transition: background-color 0.3s ease, transform 0.2s ease, box-shadow 0.3s ease;
	cursor: pointer;
	max-width: 30ch;

	&:hover {
		background-color: hsl(224, 50%, 55%);
	}

	&:focus {
		outline: none;
		box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
	}

	&:active {
		background-color: #141414;
		transform: translateY(1px);
	}

	&:disabled,
	&[disabled] {
		opacity: 0.6;
		pointer-events: none;
	}
`;