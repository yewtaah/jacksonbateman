# Contributing / Making Updates

This is a small personal site, so "contributing" mostly means "Jackson or
Scott editing it" — but the process below is worth following even for a
one-person project, because it's the same process used on real software
teams: work on a branch, open a pull request, get eyes on it before it goes
live.

## Local setup

There's no build step and no dependencies to install for the site itself —
it's plain HTML, CSS, and JavaScript, opened straight in a browser. The only
reason to run a local server instead of just double-clicking an `.html`
file is that a few things (fetching `assets/css/style.css`, the `/`-rooted
links in the nav) behave more like production when served over `http://`
rather than `file://`.

```bash
# from the repo root, pick whichever you have installed
python -m http.server 8000
# or
npx serve .
```

Then open `http://localhost:8000/index.html`.

## Making a change

1. **Create a branch.** `git checkout -b your-change-name` — never commit
   straight to `main`, even for a small fix. `main` is what deploys to the
   live site (see [README.md's Deployment section](README.md#deployment)),
   so a bad commit there is a bad commit on the live site.
2. **Edit the files.** See "Where things live" below.
3. **Check it in a browser.** Load the page(s) you touched locally, and at
   minimum: click through the nav, resize the window down to a phone width
   and check the mobile menu, and open the browser console and confirm
   there are no red errors.
4. **Commit and push, then open a pull request.** `git push -u origin
   your-change-name`, then open a PR against `main` on GitHub.
5. **Get a review.** Changes to personal/biographical content (résumé
   details, work history, academic info) should be reviewed and approved by
   Jackson before merging — that content represents him, so he gets final
   say, same as anyone would want final say over their own bio.
6. **Merge.** Once merged, AWS Amplify picks up the new commit on `main`
   automatically and deploys it — usually live within a couple of minutes.
   See [README.md's Deployment section](README.md#deployment) for how that
   pipeline works and what to check if a deploy doesn't show up.

## Where things live

| I want to... | Edit... |
|---|---|
| Change any page's text/content | that page's `.html` file directly |
| Change a color, font, spacing, or any shared visual style | `assets/css/style.css` |
| Change scroll-reveal, the mobile menu, the lightbox, the gallery filters, or any other interactive behavior | `assets/js/main.js` |
| Add or change a photo | drop it in `assets/img/` with a descriptive filename (see the comment at the top of `scripts/optimize_images.py`), then reference it from the relevant page's `<img>` tag |
| Change the résumé PDF or music file | replace the file in `assets/pdf/` or `assets/audio/`, keeping the same filename so existing links keep working (or update every link that points to the old filename) |

### The nav and footer are duplicated on every page — read this before editing them

This site has no shared "layout" file — no framework, no templating, no
build step. That's a deliberate choice (see
[README.md](README.md#why-no-framework)), but it means the `<header
class="site-header">` nav block and the `<footer class="site-footer">`
block are copy-pasted, verbatim, at the top and bottom of **every single
`.html` file**. If you add a nav link, rename a page, or change the footer
copy, you have to make that same edit in all nine pages by hand:

```
404.html  about.html  contact.html  gallery.html  headshots.html
index.html  music.html  performing-arts.html  resume.html
```

A quick way to find every place a piece of text appears, so you don't miss
one:

```bash
grep -rl "Get in Touch" --include="*.html" .
```

This duplication is exactly the kind of pain that frameworks and static-site
generators (Jekyll, Eleventy, Astro, etc.) exist to solve with a shared
"layout" or "partial." There's an open issue tracking whether it's worth
introducing one here — see GitHub Issues.

## Reporting a concern

Something factually wrong, a broken link, a photo that shouldn't be there,
or a concern about how a name/trademark is referenced (see
[NOTICE.md](NOTICE.md))? Open a [GitHub Issue](../../issues) describing it,
or email `jacksondbateman@gmail.com` directly.
