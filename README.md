# jacksonbateman.com

Jackson Bateman's personal site — an Economics & Business Analytics student
in the Honors College at the University of Houston, with a background in
musical theatre. Live at **[jacksonbateman.com](https://jacksonbateman.com)**.

This repo also doubles as a worked example for Jackson of how a small site
actually gets built and shipped: prompting an AI coding assistant
([Claude Code](https://claude.com/claude-code)) through real design and
content decisions, working on branches, opening pull requests, and
diagnosing an actual production deployment failure. The commit history and
the closed pull requests are as much a part of that lesson as the code
itself — worth reading through, not just the final result.

## Tech stack

Plain **HTML, CSS, and JavaScript.** No framework, no npm packages, no build
step. One CSS file (`assets/css/style.css`) and one JS file
(`assets/js/main.js`) are shared by every page via a plain `<link>`/
`<script>` tag; nine standalone `.html` files make up the rest.

### Why no framework? {#why-no-framework}

For a site this size — nine pages, updated occasionally, by one or two
people — a framework (React, Next.js, a static-site generator) would add a
build step, a `node_modules` folder, and a layer of tooling between "I
changed the text" and "the text is different" for very little payback. Plain
HTML/CSS/JS means:

- **Zero setup.** Clone the repo, open a file, see the change. No `npm
  install`, no build command, no version-compatibility issues years later.
- **Nothing to go stale.** No dependencies to update, no framework major
  version to eventually migrate off of.
- **The tradeoff, honestly:** the nav and footer markup is duplicated on
  every page instead of living in one shared layout file, so changing them
  means editing nine files by hand. That's a real cost — see
  [CONTRIBUTING.md](CONTRIBUTING.md#the-nav-and-footer-are-duplicated-on-every-page--read-this-before-editing-them)
  for how to do it safely, and the open GitHub issue weighing whether it's
  worth introducing a build step to fix it. Small sites can reasonably go
  either way; this one currently chooses simplicity over that convenience.

## Site map

| Page | Purpose |
|---|---|
| `index.html` | Homepage — hero, quick facts, and teasers into the other pages |
| `about.html` | Biography and a timeline of the path from high school through AMDA to the University of Houston |
| `resume.html` | The primary résumé: education, work experience, academic honors, skills |
| `performing-arts.html` | The secondary "performing arts" wing: theatre/film/concert credits, training, special skills — links out to the three pages below |
| `headshots.html` | Headshot photo grid (sub-page of Performing Arts) |
| `gallery.html` | Filterable production-photo gallery (sub-page of Performing Arts) |
| `music.html` | Original music player (sub-page of Performing Arts) |
| `contact.html` | Contact form and direct contact methods |
| `404.html` | Not-found page (currently unreachable in production — see the open issue) |

## Design system

Every color, font, spacing value, radius, and shadow is defined once as a
CSS custom property in the `:root` block at the top of
`assets/css/style.css`, then referenced everywhere else as `var(--name)`.
Change a value there and it updates across all nine pages. Read the comment
block at the top of that file for the full explanation, including a naming
quirk worth knowing about (`--brass` is currently a shade of red, not
brass — a leftover from an earlier palette that got restyled without a
rename).

## Local development

No install required — see [CONTRIBUTING.md](CONTRIBUTING.md#local-setup)
for the two-line version, or just open any `.html` file directly in a
browser.

## Making updates

See [CONTRIBUTING.md](CONTRIBUTING.md) for the full workflow: branching,
where specific kinds of changes live, how to safely edit the
duplicated nav/footer, and how a merge reaches the live site.

## Deployment {#deployment}

```
GitHub (this repo, branch "main")
        │  every push/merge triggers a webhook
        ▼
AWS Amplify Hosting (app "jacksonbateman", connected to this repo)
        │  runs the build spec, publishes the output
        ▼
CloudFront (Amplify's CDN, fronting the built site)
        │  jacksonbateman.com's DNS points here
        ▼
Live at jacksonbateman.com / www.jacksonbateman.com
```

Merging to `main` deploys automatically — there's no manual "publish" step,
and no GitHub Actions workflow in this repo doing it either. AWS Amplify
Hosting is watching the `main` branch directly (via a webhook it registered
with GitHub when it was set up) and rebuilds on every push. `main` **is**
production; that's exactly why changes go through a branch and a PR first
rather than being edited directly.

The Amplify app's build configuration (its "build spec," and its domain/
rewrite rules) lives in the **AWS Amplify console**, not as a file committed
to this repo — that's a real gap worth knowing about, and there's an open
issue about bringing it under version control with an `amplify.yml` file
instead.

### A real incident, worth learning from

In September 2026, three deploys in a row failed silently, and the live
site stayed frozen on a months-old version while `main` had moved on. The
cause: the Amplify app's build spec was still configured for the site's
original Jekyll scaffold (`jekyll b`, output expected in a `_site/`
folder), left over from before the site was rebuilt as plain static HTML.
With no Jekyll build step producing that folder, every deploy failed at the
`BUILD` step with nothing to publish — and because nothing alerted anyone,
this went unnoticed for a couple of weeks.

The fix was a one-line change to the build spec (publish the repo root
directly, no build command needed) — but finding it meant checking, in
order: was GitHub Pages enabled (no — `has_pages: false`); did the domain's
DNS even point at GitHub (no — it pointed at a CloudFront distribution);
was there an Amplify app connected to this repo (yes); was its most recent
deploy healthy (no — `FAILED`); what did the build log actually say. The
lesson: "the code is on GitHub" and "the code is live" are two different
claims, and a broken deploy pipeline can fail *quietly* — check the actual
deployment status, not just that a merge went through.

## License & content rights

The **code** in this repo (HTML/CSS/JS) is [MIT-licensed](LICENSE) — reuse
it freely. The **content** it displays (photos, résumé, biographical text,
original music) is not, and trademark references (schools, employers,
productions) belong to their respective owners. See
[NOTICE.md](NOTICE.md) for the full breakdown — it's a useful example of
why "the code is open source" and "everything in the repo is free to reuse"
are not the same statement.

## Reporting a concern

Factual error, broken link, or a concern about how something is referenced?
Open a [GitHub Issue](../../issues), or email
`jacksondbateman@gmail.com` directly.
