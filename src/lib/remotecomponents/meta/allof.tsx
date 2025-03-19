import React, {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {RemoteComponent} from "lib/remotecomponents/websocket";

interface AllOfProps {
	components: Array<RemoteComponent>,
	onSubmit: (value: Array<any>) => void;
}

export default function AllOf(props: AllOfProps) {
	const final = useRef<Array<any | null>>([])

	const components = useMemo(() => {
		final.current = props.components
			.filter(it => it.value !== null)
			.map(() => null);

		let index = -1;

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
				index += 1;
				// we have to wrap here so we can use useState
				return function WrappedComponent() {
					// we duplicate the reference here because if onSubmit is memoized to [value]
					// then calling onSubmit at the same time you call setValue will cause a submit with a stale value
					const valueref = useRef<any>(null);
					const [value, setValue] = useState<any>(null)
					const onSubmit = useMemo(() => {
						return () => {
							final.current[index] = valueref.current;

							if(final.current.every(it => it.value !== null)) {
								props.onSubmit(final.current);
							}
						}
					}, []);

					return (
						<Component
							value={wrapper.unwrap(value)}
							setValue={(value: any) => {
								const wrapped = wrapper.wrap(value);
								valueref.current = wrapped;
								setValue(wrapped)
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