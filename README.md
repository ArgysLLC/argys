# Argys website

A responsive, seven-page static website for Argys LLC. Original canvas and SVG motion, an interactive instrument concept, a research figure lightbox, keyboard-accessible tabs, mobile navigation, and direct email contact. No runtime dependencies, trackers, embedded video players, or external fonts.

## Local preview

Requires Node.js 22 or later. No package installation is needed.

```sh
npm run dev
```

Open http://127.0.0.1:4173. After editing, run `npm run build` and refresh the browser. The server serves only `dist/`.

```sh
npm run check
```

This builds the site and verifies local links, anchors, email actions, image alternative text, unique page IDs and deployment contents.

## Edit the content

- `site/*.html`: page content.
- `site/styles/main.css`: responsive layout and styling.
- `site/scripts/main.js`: navigation, tabs, lightbox and clipboard interactions.
- `site/scripts/signal-field.js`: original landing-page animation, including pause and reduced-motion support.
- `content/site.json`: public email addresses, company details and optional canonical site URL.
- `scripts/build.mjs`: shared navigation/footer and static build.

All product visuals are identified as concept renders. Independent research attribution appears beside the figure and on `sources.html`. Company-provided source documents and the private planning folder are excluded from the build.

## GitHub Pages

1. Create or select the intended repository, using `main` as its production branch.
2. Commit only `.github/`, `.gitignore`, `package.json`, `content/`, `scripts/`, `site/` and this README. Do not upload the asset-package folder, private deck or planning documents.
3. In repository **Settings → Pages → Build and deployment**, select **GitHub Actions**.
4. Push to `main`, or run **Build and deploy Argys** from the Actions tab.

The workflow deploys only `dist/`, and derives the canonical URL and sitemap from the Pages configuration. Relative asset/page links support both account sites and repository subpaths. Pull requests build and check without deploying. For an independent production build, set `SITE_URL` to the final public URL or set `siteUrl` in `content/site.json`.

For a custom domain, configure the domain and HTTPS in GitHub Pages settings and its DNS provider after the repository is chosen. No DNS or account changes are made by this project.

Official workflow reference: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Media and contact

The supplied logo, portraits and concept render remain Argys materials. The research figure retains its original attribution and CC BY 4.0 license; see `site/sources.html`. Contact links use `cbo@argys.net` and `ceo@argys.net`; the visitor's email application sends the message. There is no server-side submission or mailing list.

## Launch status

The local build is complete, and the target repository is [aayushvaswani/argys-website](https://github.com/aayushvaswani/argys-website). Upload and Pages deployment are pending: terminal authentication is not configured, and the browser extension needs local-file upload permission. The site is not publicly live yet.

The privacy page describes the current static implementation and should be updated if analytics, forms or third-party embeds are added.
