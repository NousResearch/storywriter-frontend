'use client'

import React, { useState } from 'react'
import { useServerInsertedHTML } from 'next/navigation'
import { ServerStyleSheet, StyleSheetManager } from 'styled-components'

interface StyledComponentsRegistryParams {
	children: React.ReactNode
}

export default function StyledComponentsRegistry(props: StyledComponentsRegistryParams) {
	// Only create stylesheet once with lazy initial state
	// x-ref: https://reactjs.org/docs/hooks-reference.html#lazy-initial-state
	const [styledComponentsStyleSheet] = useState(() => new ServerStyleSheet())

	useServerInsertedHTML(() => {
		const styles = styledComponentsStyleSheet.getStyleElement()
		styledComponentsStyleSheet.instance.clearTag()
		return <>{styles}</>
	})

	if (typeof window !== 'undefined') return <>{props.children}</>

	return (
		<StyleSheetManager sheet={styledComponentsStyleSheet.instance}>
			{props.children}
		</StyleSheetManager>
	)
}