import {z} from "zod";
import {componentZod, inferComponentProps} from "lib/remotecomponents/componentregistry";

export const TextPromptZod = componentZod(
	z.object({
		text: z.string(),
	})
)

export default function TextPrompt(props: inferComponentProps<typeof TextPromptZod>) {
	return (
		<p>{props.text}</p>
	)
}