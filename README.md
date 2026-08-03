# nopenworld — Wild Breath

Silhouette survival-action open world built with React Three Fiber.

Gather wood, fight stalkers, survive the night. Deployed at [app10.nextaura.fit](https://app10.nextaura.fit).

## Play locally

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Controls

| Key | Action |
|-----|--------|
| WASD | Move |
| Mouse | Look |
| Space | Jump |
| Shift | Sprint |
| F | Chop / gather |
| E | Melee attack |

## Build & deploy

```bash
npm run build
```

Copy `dist/` to your static host, or use the Cloudflare Worker setup:

```powershell
npm run build
Copy-Item -Recurse dist\* ..\public\app10\
npx wrangler deploy -c workers/wrangler-app10.toml
```

Or run `deploy/wire_app10.ps1` from the parent monorepo layout.

## Stack

- Vite + React 19
- React Three Fiber + drei + postprocessing
- Tailwind CSS 4
- Cloudflare Workers (optional static hosting)
