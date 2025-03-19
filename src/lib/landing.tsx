'use client';

import styled from "styled-components";

export const LandingContainer = styled.div`
	background: #222222;
	min-height: 100%;
	width: 100%;

	font-family: var(--font-primary), Arial, sans-serif;
	color: #777;
	font-size: 2.5rem;

	display: flex;
	flex-direction: column;
	position: relative;
	justify-content: center;
	align-items: center;

	.error {
		color: hsl(0, 40%, 49%);
		white-space: pre-wrap;
		word-break: break-word;
		max-width: 45ch;
	}

	&.active {
		.top {
			opacity: 50%;
		}

		.prompt {
			color: #fff;
		}
	}

	.title {
		/*noinspection CssUnresolvedCustomProperty*/
		font-family: var(--font-heading), Arial, sans-serif;
		font-weight: 100;
		color: #fff;
		font-size: 4rem;
		margin: 0;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;

		> span {
			display: block;
			font-size: 2rem;
			letter-spacing: 0.1ch;
			color: hsl(33, 57%, 55%);
		}
	}

	.prompt {
		/*noinspection CssUnresolvedCustomProperty*/
		font-family: var(--font-primary), Arial, sans-serif;
		color: #777;
		font-size: 3rem;
		transition: 1s;

		max-width: 25ch;
		justify-content: center;
		align-items: center;
		text-align: center;
		white-space: pre-wrap;
		word-wrap: break-word;
	}

	.top {
		position: absolute;
		margin: var(--s0) var(--s-2) var(--s-1) var(--s-2);
		top: 10vh;
		transition: 4s;
		 z-index: -1;
	}

	.mid {

	}
`