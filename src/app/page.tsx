"use client";
import { LandingContainer } from 'lib/landing';
import React, {ChangeEvent, Fragment, ReactNode, RefObject, useEffect, useRef, useState} from 'react';
import {Stack} from "lib/everylayout";

import useWebSocket from "lib/remotecomponents/websocket";
import styled from "styled-components";

function getWebSocketUrl(remoteUrl: string): string {
	if (typeof window === "undefined")
		return "NEXTJS STOP PRERENDERING ME";

	return ["localhost", "127.0.0.1"].includes(window.location.hostname)
		? "ws://127.0.0.1:8080"
		: remoteUrl;
}

export default function IndexPage() {
	const state = useWebSocket(
		getWebSocketUrl("wss://production.api.intheory") + "/story"
	)

	let render: ReactNode = null;
	if(state === null) {
		render = <p>connecting...</p>;
	} else if (state.state === "error") {
		render = <p className={"error"}>{state.error}</p>
	} else if (state.state === "connected" || state.state === "progress") {
		render = (
			<CenteredStack>
				{state.components.map((component, i) => {
					const Component = component.component;
					return <Component key={i} {...component.props} />;
				})}
			</CenteredStack>
		)
	}

	return (
		<LandingContainer className={state !== null && state.state !== "error" ? "active" : "waiting"}>
			<div className={"top"}>
				<Stack className={"title"}>
					<div>nous research</div>
					<span>storywriter</span>
				</Stack>
			</div>
			<div className={"mid"}>
				{render}
			</div>
		</LandingContainer>
	);
}


const CenteredStack = styled(Stack)`
	align-items: center;
	margin: var(--s3) 0;
`