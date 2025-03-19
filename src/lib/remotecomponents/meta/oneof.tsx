import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {RemoteComponent} from "lib/remotecomponents/websocket";

interface OneOfProps {
	components: Array<RemoteComponent>,
	onSubmit: (value: any) => void;
}

export default function OneOf(props: OneOfProps) {
	const components = useMemo(() => {
		return props.components.map(rc => {
			const Component = rc.component
			const wrapper = rc.value

			if(wrapper === null) {
				return function WrappedComponent() {
					return (
						<Component {...rc.props} />
					)
				}
			} else {
				// we have to wrap here so we can use useState
				return function WrappedComponent() {
					// we duplicate the reference here because if onSubmit is memoized to [value]
					// then calling onSubmit at the same time you call setValue will cause a submit with a stale value
					const valueref = useRef<any>(null);
					const [value, setValue] = useState<any>(null)
					const onSubmit = useMemo(() => {
						return () => {
							props.onSubmit(valueref.current);
						}
					}, []);

					return (
						<Component
							value={wrapper.unwrap(value)}
							setValue={(value: any) => {
								const wrapped = wrapper.wrap(value);
								valueref.current = wrapped;
								setValue(wrapped);
							}}
							onSubmit={onSubmit}
							{...rc.props}
						/>
					)
				}
			}
		})
	}, [props.components]);

	return (
		<React.Fragment>
			{components.map((WrappedComponent, i) =>
				<WrappedComponent key={i} />
			)}
		</React.Fragment>
	)
}