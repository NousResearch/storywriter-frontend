import {ComponentZod, componentZod, inferComponentProps} from "lib/remotecomponents/componentregistry";
import {AnyZodObject, z} from "zod";
import {Stack} from "lib/everylayout";
import styled from "styled-components";
import React, {useRef, useState} from "react";
import {VignetteDisplayInner} from "lib/remotecomponents/display/vignettes";
import SelectAction, {SelectActionZod} from "lib/remotecomponents/inputs/actions";

export const ChooseVignetteZod = componentZod(
	z.object({
		prompt: z.string().nullish(),
		vignettes: z.array(z.string()),
		actions: z.array(z.string()),
	}),
	z.object({
		vignette_id: z.number(),
		action: z.string(),
	})
)

export default function ChooseVignette(props: inferComponentProps<typeof ChooseVignetteZod>) {
	const [index, setIndex] = useState(0);
	const actionRef = useRef<z.infer<typeof SelectActionZod["response"]> | null>(null);

	return (
		<Stack>
			<VignetteDisplayInner index={index} setIndex={setIndex} vignettes={props.vignettes}/>
			<ShowPrompt>{props.prompt}</ShowPrompt>
			<SelectAction
				actions={props.actions}
				value={actionRef.current}
				setValue={(value) => {
					actionRef.current = value;
				}}
				onSubmit={() => {
					// selectaction's implementation means this value has to exist when onsubmit is called
					props.setValue({vignette_id: index, action: actionRef.current!!.action});
					props.onSubmit()
				}}
			/>
		</Stack>
	);
}

const ShowPrompt = styled.p`
	font-size: 1.3rem;
	word-break: break-word;
	max-width: 30ch;
	align-self: center;
	text-align: center;
`

// interface ActionWrapProps<T extends AnyZodObject, CZ extends ComponentZod<T>> {
// 	displayComponent: React.FC<z.infer<CZ["props"]>>,
// 	displayProps: z.infer<CZ["props"]>,
// }
//
// export default function ActionWrap(
// 	props: ActionWrapProps
// ) {
// 	const [index, setIndex] = useState(0);
// 	const actionRef = useRef<z.infer<typeof SelectActionZod["response"]> | null>(null);
//
// 	return (
// 		<Stack>
// 			<VignetteDisplayInner index={index} setIndex={setIndex} vignettes={props.vignettes} />
// 			<SelectAction
// 				actions={props.actions}
// 				value={actionRef.current}
// 				setValue={(value) => {
// 					actionRef.current = value;
// 				}}
// 				onSubmit={() => {
// 					// selectaction's implementation means this value has to exist when onsubmit is called
// 					props.setValue({vignette_id: index, action: actionRef.current!!.action});
// 					props.onSubmit()
// 				}}
// 			/>
// 		</Stack>
// 	);
// }