This is the NextJS frontend for Nous Research's [Storywriter experiment](https://github.com/NousResearch/storywriter).

To run: `npm run dev`

This project will connect to Storywriter's [Kaida](https://github.com/NousResearch/kaida) backend via websocket to `ws://127.0.0.1:8080` during local development, or the production URL defined in `src/app/page.tsx` as decided by the page address in the browser.