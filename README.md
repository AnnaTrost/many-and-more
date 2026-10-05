# Many, and more

A web game about sizes of infinity. Players start with a tribe that can only count to three, pair pots with lids, fill Hilbert's hotel, list every fraction, and finally prove with Cantor's diagonal that some infinities are bigger than others.

## Running it

You need Node.js 20.19 or newer.

```sh
npm install
npm run dev       # local server with live reload
npm run build     # production build into dist/
npm run preview   # serve the production build locally
npm test          # unit tests (Vitest)
npm run test:e2e  # browser smoke test (Playwright)
```

The browser test needs Chromium: run `npx playwright install chromium` once first. If you already have Chromium installed, point `PLAYWRIGHT_CHROMIUM_PATH` at it instead.

## Publishing

Every push to `main` runs the tests, builds the game and publishes it to GitHub Pages, through `.github/workflows/deploy.yml`. Pull requests run the tests and the build too, so a change that breaks either is caught before it's merged. Nothing is published if a test fails. The site appears at `https://<your-username>.github.io/many-and-more/`.

The build uses relative paths (`base: "./"` in `vite.config.js`), so the same `dist/` folder also works on any other static host or a custom domain.

## How the code is organised

| Path | What's in it |
| --- | --- |
| `src/main.jsx` | Entry point: mounts the app inside the crash screen |
| `src/App.jsx` | Holds the save and picks which screen to show |
| `src/registry.js` | Every chapter and bonus puzzle, in order |
| `src/ChapterMap.jsx` | The home screen |
| `src/chapters/ch1.jsx` … `ch6.jsx` | One file per chapter, including its step list |
| `src/bonuses/` | One file per bonus puzzle |
| `src/shared/` | Pieces used across chapters: drawings, UI bits, Hilbert's hotel, the `useDrag` hook |
| `src/save.js` | Saved progress: format, migration and validation |
| `src/ErrorBoundary.jsx` | Crash screen shown instead of a blank page |
| `src/styles.css` | All styles, with light and dark themes |
| `tests/unit/` | Vitest tests for saved progress, the chapter list, and the functions that check answers |
| `tests/e2e/` | Playwright test that opens every screen in Chromium and replays fixed bugs |
| `public/` | Files copied into the site unchanged: the tab icon (`favicon.svg`) and the phone home-screen icon (`apple-touch-icon.png`) |

### Adding a chapter

1. Create `src/chapters/ch7.jsx` exporting its step list (`CH7_STEPS`) and its view (`ChapterSeven`). Copy the shape of an existing chapter.
2. Add it to `CHAPTERS`, `CHAPTER_STEPS` and `CHAPTER_VIEWS` in `src/registry.js`.
3. Run `npm test` and `npm run test:e2e`. They check that every step has a unique id and that every step of the new chapter opens.

Give every step a unique `id` within its chapter. A step's `kind` is used as its id when it has none, so two steps of the same kind each need an explicit `id`. Saves remember steps by id, which means you can add, remove or reorder steps without sending returning players to the wrong place.

### Saved progress

Progress lives in the player's browser (`localStorage`). The format is documented at the top of `src/save.js`. If you change it, bump `SAVE_VERSION` and teach `normalizeSave` to read the old shape, so existing players keep their progress.

### Drag and drop

Everything draggable uses the `useDrag` hook in `src/shared/useDrag.js`. Its comment explains the contract. Always give a draggable thing a tap fallback too, as the existing ones do.
