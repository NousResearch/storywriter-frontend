import {z} from "zod";
import styled from "styled-components";

export const StatusUpdateZod = z.object({
	step: z.number(),
	totalSteps: z.number(),
	tokens: z.number(),
	failures: z.number().nullish(),
})

export interface WaitingForNextProps {
	message?: string;
}

export default function WaitingForNext(props: WaitingForNextProps) {
	return (
		<p>{props.message ?? "waiting for response..."}</p>
	)
}

export interface StatusUpdateProps {
	update: z.infer<typeof StatusUpdateZod>,
}

export function StatusUpdate(props: StatusUpdateProps) {
	return (
		<StatusUpdateContainer>
			<h1>({props.update.step}/{props.update.totalSteps})</h1>
			{props.update.failures && props.update.failures > 0 &&
				<p>(attempt #{props.update.failures+1})</p>}
			{props.update.tokens === 0 ?
				(
					<p>waiting...</p>
				)
				:
				(
					<p>{props.update.tokens}</p>
				)
			}
		</StatusUpdateContainer>
	)
}

const StatusUpdateContainer = styled.div`
	display: flex;
	flex-direction: column;
	gap: 0.25ex;
	font-family: var(--font-primary), Arial, sans-serif;
	justify-content: center;
	align-items: center;
	
	> * {
		margin: 0;
	}
	
	> h1 {
		color: #aaa;
		font-size: 2rem;
	}
	
	> p {
		color: #777;
		font-size: 1.5rem;
	}
`