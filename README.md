# Folio Local

A deliberately narrow, single-user portfolio builder. Edit four structured sections, preview desktop and mobile layouts, and publish a static website. The design is one editorial portfolio style with no visual canvas, template library, collaboration, analytics, accounts, or external API.

## Setup

Requires Node.js 22 or newer and npm. From this folder:

```sh
npm run install:app
cp .env.example .env
npm run dev
```

Open `http://127.0.0.1:3000`. `npm run dev` and `npm run start` bind to the local computer only. The first opening creates a clearly labelled sample site. Replace its content or remove sample projects before publishing.

## Use

Choose a section on the left. Edit fields, check the live preview, then **Save draft**. **Publish static site** saves the current data and writes `published/index.html` and `published/style.css`. Open `index.html` directly or upload both files to any static host. **Download HTML** produces a single self-contained file from the current editor content. **Export data** makes a JSON backup. **Import data** loads a JSON file for review; save it to keep it.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run install:app` | Install dependencies and create the lockfile |
| `npm run dev` | Local development server |
| `npm test` | Focused model and workflow tests |
| `npm run test:e2e` | Browser smoke test (run `npx playwright install chromium` once if needed) |
| `npm run build` | Production build |
| `npm run start` | Production-style local server after build |

## Data, permissions, backup

The app writes a SQLite file at `data/site.sqlite` and static output in `published/`. Set `DATABASE_PATH` and `PUBLISH_DIR` in `.env` to change these local paths. Both directories must be writable by the running user. The app reads an imported JSON file only after you select it. It makes no network requests except between your browser and the local Next.js server; there are no external credentials. Back up `data/site.sqlite`, or use **Export data** for a portable copy. The `.gitignore` excludes local data, output, and `.env`.

This is a private local workspace by default, with no sign-in system. Do not bind the server to a public interface without adding your own access control. Publishing writes files locally; it does not upload them to a host.

## Architecture and limits

Next.js 15 App Router serves the editor and two local API routes. Next.js telemetry is disabled in all run scripts. TypeScript/Zod validates JSON before persistence. Node's built-in SQLite driver stores one site record. A shared renderer produces the sandboxed live preview and the static HTML/CSS output. No optional external API is used, so offline editing and publishing retain all core features.

The editor supports one site, four fixed sections, and up to 12 projects with color covers. It does not include media uploads, arbitrary HTML/CSS, multiple templates, a general-purpose visual editor, collaboration, or client handoff. The requested GitHub reference could not be retrieved in the build environment, so the included design is an original, restrained editorial interpretation rather than a verified reproduction.


## GitHub and GitHub Pages

The public GitHub repository stores this Next.js editor source and the generated portfolio in `site/`. GitHub Pages hosts only `site/`; it cannot run the editor or SQLite. Run the editor on your computer using the setup instructions above.

To update the public portfolio:

1. Edit the portfolio locally, then click **Publish static site**.
2. Run `npm run prepare:pages` to copy the generated HTML and CSS into `site/`.
3. Review the files that will be public, then commit and push them:

```sh
git add site/index.html site/style.css site/.nojekyll
git commit -m "Update portfolio"
git push
```

The **Verify and deploy portfolio** GitHub Actions workflow tests the data model and deployment packaging, builds the editor to check it, validates the static files, and deploys only `site/`. It runs on pushes to `codex/github-pages` and can be started manually. A successful run updates the public website. If validation fails, the previously deployed version remains live.

No deployment token is needed in `.env`: GitHub supplies short-lived workflow credentials. Personal CLI authentication is held by GitHub CLI's secure credential storage. The local database, `.env` files, installed dependencies, and the separate private hosting checkout are excluded from Git.

An earlier owner-private Sites preview is managed separately through the local `hosting/` checkout. Its identity and source are excluded from this public repository. `npm run prepare:hosting` stages updates for that existing preview; it does not deploy them or affect GitHub Pages.
