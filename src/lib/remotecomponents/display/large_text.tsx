import {z} from "zod";
import {Stack} from "lib/everylayout";
import styled from "styled-components";
import {componentZod, inferComponentProps} from "lib/remotecomponents/componentregistry";
import Markdown from "react-markdown";

export const LargeTextZod = componentZod(
	z.object({
		text: z.string(),
	})
)

export default function LargeText(props: inferComponentProps<typeof LargeTextZod>) {
	return (
		<Container>
			<Markdown>{props.text}</Markdown>
		</Container>
	)
}

const Container = styled(Stack)`
	max-width: 55ch;

	font-size: 1.4rem;
	padding: var(--s2);
	background: #000;
	color: #fff;
	//font-size: 1.5rem;
	font-family: var(--font-primary), Arial, sans-serif;
	//min-height: 20ex;

	display: flex;
	//align-items: center;
`