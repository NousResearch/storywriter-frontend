import {z} from "zod";
import {Stack} from "lib/everylayout";
import {useEffect, useState} from "react";
import styled from "styled-components";
import {componentZod, inferComponentProps} from "lib/remotecomponents/componentregistry";

export const VignetteDisplayZod = componentZod(
	z.object({
		vignettes: z.array(z.string()),
	})
)

function Vignette(props: {index: number, vignette: string}) {
	// TODO
	return (
		<VignetteContainer>
			<h3>Vignette #{props.index+1}</h3>
			<p>{props.vignette}</p>
		</VignetteContainer>
	)
}

export default function VignetteDisplay(props: inferComponentProps<typeof VignetteDisplayZod>) {
	const [index, setIndex] = useState(0);

	return <VignetteDisplayInner index={index} setIndex={setIndex} {...props} />
}

interface VignetteDisplayInnerProps {
	index: number;
	setIndex: (index: number) => void;
}

export function VignetteDisplayInner(props: VignetteDisplayInnerProps & inferComponentProps<typeof VignetteDisplayZod>) {
	const {index, setIndex} = props;

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "ArrowLeft" && index > 0)
				setIndex(index - 1);

			if (event.key === "ArrowRight" && index < props.vignettes.length - 1)
				setIndex(index + 1);
		};

		if(index >= props.vignettes.length)
			setIndex(0);

		window.addEventListener("keydown", handleKeyDown);

		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [index, setIndex, props.vignettes.length]);

	return (
		<Container>
			<button
				className={"left" + (index > 0 ? "" : " hidden")}
				onClick={() => setIndex(index - 1)}
			>{"🠄"}</button>
			<Vignette vignette={props.vignettes[index]} index={index}/>
			<button
				className={"right" + (index < props.vignettes.length - 1 ? "" : " hidden")}
				onClick={() => setIndex(index + 1)}
			>{"🠆"}</button>
		</Container>
	)
}

const Container = styled(Stack)`
	max-width: 40ch;
	flex-direction: row;
	gap: var(--s1);

	> button {
		max-width: 3ch;
		background: #000000;
		border: none;
		padding: var(--s-2) var(--s0);
		color: #e1e1e1;

		&:hover, &:active {
			background: #555;
		}
		
		&.hidden {
			visibility: hidden;
			pointer-events: none;
		}
	}
`

const VignetteContainer = styled(Stack)`
	p {
		padding: var(--s2);
		background: #000;
		color: #fff;
		font-size: 1.5rem;
		font-family: var(--font-primary), Arial, sans-serif;
		min-height: 20ex;
		
		display: flex;
		align-items: center;
	}
`;