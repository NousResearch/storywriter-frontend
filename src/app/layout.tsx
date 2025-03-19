import type {Metadata} from "next";
import '/public/normalize.css';
import '/public/global.css';
import StyledComponentsRegistry from "lib/styledcomponents";
import {Montserrat, Open_Sans, Roboto_Mono} from 'next/font/google';

const heading = Roboto_Mono({
	subsets: ['latin'],
	weight: ['100'],
	style: ['normal'],
	variable: '--font-heading',
});
const primary = Montserrat({
	subsets: ['latin'],
	weight: ['300'],
	style: ['normal'],
	variable: '--font-primary',
});

export const metadata: Metadata = {
	title: 'Nous Storywriter',
	// description: "",
	openGraph: {
		title: 'Nous Storywriter',
	}
};

export default function RootLayout({
	                                   children,
                                   }: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
			</head>
			<body className={`${primary.variable} ${heading.variable}`}>
				<StyledComponentsRegistry>
			        {children}
		        </StyledComponentsRegistry>
	        </body>
        </html>
	);
}
