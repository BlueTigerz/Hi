# Minecraft Tetris

A Minecraft-themed Tetris game built with React + Vite. The global leaderboard is served by Azure Functions backed by Azure Table Storage, and the whole app is hosted on Azure Static Web Apps.

## Project layout

```
src/                 React app
  game/              Pure game logic (tetris.js) and hooks
  components/        Board, GameOver, Leaderboard, BackgroundMusic
  assets/            Block textures
public/              Static files (music, staticwebapp.config.json)
api/                 Azure Functions (managed by Static Web Apps)
  src/functions/     HTTP endpoints
  src/store.js       Table Storage access
docs/                Azure setup and deployment guides
.github/workflows/   CI/CD to Azure Static Web Apps
```

## Local development

Prerequisites:

- Node.js 22+
- *(Optional, for the leaderboard API)* [Azure Functions Core Tools v4](https://learn.microsoft.com/azure/azure-functions/functions-run-local).
  On Windows: `winget install Microsoft.Azure.FunctionsCoreTools`, then open a new terminal so `func` is on your PATH.

```sh
npm run setup   # installs root + api dependencies
npm run dev
```

If `func` is installed, `npm run dev` starts three processes (and creates `api/local.settings.json` from the example on first run):

| Process | URL | Purpose |
| --- | --- | --- |
| Vite | http://localhost:5173 | React app. Open this one. |
| Functions host | http://localhost:7071/api | API. Vite proxies `/api` here. |
| Azurite | 127.0.0.1:10002 | Local Table Storage emulator (data in `.azurite/`) |

If `func` isn't installed, only Vite starts. The game is fully playable either way (see below). Use `npm run dev:web` to run just the frontend on purpose.

## Offline behavior

The game never depends on the backend. On load, the frontend checks `/api/leaderboard` (5 s timeout):

- **API reachable:** the leaderboard is shown and the game-over screen offers "Submit score".
- **API down or erroring:** the leaderboard is hidden, the game-over screen says the online leaderboard is unavailable, and the local high score (browser storage) still works. The app retries every 30 s, when the browser comes back online, and at each game over, and switches the leaderboard on as soon as the API responds.

## API

| Method | Path | Body | Description |
| --- | --- | --- | --- |
| GET | `/api/leaderboard` | – | Top 20 scores |
| POST | `/api/scores` | `{ "username": string, "score": number }` | Save a score |

## Deployment

- [docs/azure-setup.md](docs/azure-setup.md): one-time manual Azure Portal setup
- [docs/github-actions.md](docs/github-actions.md): how the CI/CD workflow deploys the frontend and API
