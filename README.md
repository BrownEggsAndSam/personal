# Databricks Product Academy

A light-theme, interactive learning companion for a Collibra and data-governance practitioner becoming a Databricks product expert, with optional data-engineering practice.

**[Open the academy](https://browneggsandsam.github.io/personal/)**

## Inside

- 24 beginner, intermediate and advanced sessions, each with an explanation, experiment, workspace task and evidence prompt.
- 20 synthetic scenario models and an embedded field guide with detailed labs and official sources.
- Three team pilots: defensible inventory, repeatable quality evidence and metadata reconciliation.
- A quest board, milestone-based XP, six learning ranks, eight badges and three scenario boss battles.
- A recall station and a learning plan that keeps product understanding first while building engineering fluency.

All lessons remain open. XP and badges are motivational; they are not credentials or independent proof of expertise. Workspace evidence is self-attested. This is an independent learning companion, not an official Databricks course or exam simulator.

## Progress on multiple devices

The site is public. Notes and progress are stored in your browser's local storage; there is no account, backend or automatic cloud sync. Open **Travel kit** to export your portfolio JSON, move it using an approved location, and import it on another device. Import replaces the destination browser's portfolio, so export a backup first. Portfolios from the original Product Academy HTML are compatible.

Keep company data, sensitive identifiers and credentials in your approved workspace. Do not commit portfolio files or actual workspace evidence to this public repository. The committed guide contains synthetic examples only. Clearing browser data can remove local progress.

To use the guide offline, download `docs/index.html` and open it in a browser with JavaScript enabled. Some browsers restrict local-file storage or clipboard access; export progress as a backup.

## Develop

No package installation or external JavaScript libraries are required.

```sh
python3 academy/build.py
node academy/verify.cjs
```

Edit `academy/src/`, rebuild, and commit the resulting `docs/index.html` with your changes. The generated page embeds its styles, scripts, curriculum and field guide in one file. `academy/verify.cjs` checks lesson rendering, scenario calculations, evidence gates, XP rules, boss decisions, portfolio migration and recall scheduling using a DOM harness.

## Publishing

GitHub Pages serves the `main` branch's `/docs` directory. To configure it manually, open this repository's **Settings → Pages**, choose **Deploy from a branch**, then **main /docs**, and save. No custom domain, build service or secrets are needed.

The original product topics were checked on 11 October 2026. Product names, availability, permissions and certification requirements change; consult the official sources embedded in each lesson and verify behavior in your company's approved workspace.

Databricks and Collibra names identify the products discussed; this project is not affiliated with either vendor.
