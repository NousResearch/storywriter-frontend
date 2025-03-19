import {componentZod, inferComponentProps} from "lib/remotecomponents/componentregistry";
import {z} from "zod";
import React, {useRef} from "react";
import SelectAction, {SelectActionZod} from "lib/remotecomponents/inputs/actions";
import {Stack} from "lib/everylayout";
import LargeText from "lib/remotecomponents/display/large_text";

export const ChapterZod = componentZod(
	z.object({
		chapter: z.string(),
		actions: z.array(z.string()),
	}),
	z.object({
		action: z.string(),
	})
)

export default function Chapter(props: inferComponentProps<typeof ChapterZod>) {
	const actionRef = useRef<z.infer<typeof SelectActionZod["response"]> | null>(null);

	return (
		<Stack>
			<LargeText text={props.chapter} />
			<SelectAction
				actions={props.actions}
				value={actionRef.current}
				setValue={(value) => {
					actionRef.current = value;
				}}
				onSubmit={() => {
					// selectaction's implementation means this value has to exist when onsubmit is called
					props.setValue({action: actionRef.current!!.action});
					props.onSubmit()
				}}
			/>
		</Stack>
	);
}