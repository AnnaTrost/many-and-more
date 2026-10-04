# Many, and more

A web game about sizes of infinity. Players start with a tribe that can only count to three, pair pots with lids, fill Hilbert's hotel, list every fraction, and finally prove with Cantor's diagonal that some infinities are bigger than others.

## Running it

You need Node.js 20.19 or newer.

```sh
npm install
npm run dev       # local server with live reload
npm run build     # production build into dist/
npm run preview   # serve the production build locally
```

## Publishing

Every push to `main` builds the game and publishes it to GitHub Pages, through `.github/workflows/deploy.yml`. Pull requests run the build too, so a change that breaks it is caught before it's merged. The site appears at `https://<your-username>.github.io/many-and-more/`.

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

### Adding a chapter

1. Create `src/chapters/ch7.jsx` exporting its step list (`CH7_STEPS`) and its view (`ChapterSeven`). Copy the shape of an existing chapter.
2. Add it to `CHAPTERS`, `CHAPTER_STEPS` and `CHAPTER_VIEWS` in `src/registry.js`.

Give every step a unique `id` within its chapter. A step's `kind` is used as its id when it has none, so two steps of the same kind each need an explicit `id`. Saves remember steps by id, which means you can add, remove or reorder steps without sending returning players to the wrong place.

### Saved progress

Progress lives in the player's browser (`localStorage`). The format is documented at the top of `src/save.js`. If you change it, bump `SAVE_VERSION` and teach `normalizeSave` to read the old shape, so existing players keep their progress.

### Drag and drop

Everything draggable uses the `useDrag` hook in `src/shared/useDrag.js`. Its comment explains the contract. Always give a draggable thing a tap fallback too, as the existing ones do.
