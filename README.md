# LM Studio Lab Wiki

A student reference for running language models in LM Studio on our lab computers, from the first download to the capstone chatbot. It matches LM Studio 0.4.28.

The site is plain HTML, CSS, and JavaScript. GitHub Pages serves it as-is, with no build step.

## What's in this folder

| Path | What it is |
| --- | --- |
| `index.html` | Every wiki page and the sidebar |
| `assets/css/wiki.css` | Colors, fonts, and layout, including light and dark themes |
| `assets/js/wiki.js` | Page switching, search, the "On this page" outline, and the theme button |
| `images/` | The annotated LM Studio screenshots |
| `favicon.svg` | The browser tab icon |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

## Publish it on GitHub Pages

1. Sign in to GitHub and click **New repository** (the **+** menu at the top right).
2. Name it, for example `lmstudio-lab-wiki`. Choose **Public**, then click **Create repository**.
3. On the new repository's page, click **uploading an existing file**.
4. Open this folder on your computer, select everything in it, and drag it into the upload area. Keep the `assets` and `images` folders as folders.
5. Click **Commit changes**.
6. Open **Settings › Pages**. Under **Build and deployment**, set **Source** to **Deploy from a branch**. Set the branch to **main** and the folder to **/ (root)**, then click **Save**.
7. Wait a minute or two, then refresh the Pages settings. The address appears at the top, for example `https://your-username.github.io/lmstudio-lab-wiki/`.

**Hidden file:** `.nojekyll` starts with a dot, so Windows and macOS may hide it, and it may not get uploaded. The site works without it.

**Public site:** anyone with the link can see a GitHub Pages site, so keep student names and other private information out of the wiki.

## Link to one page

Every page has its own address. Add a `#` and the page's ID to the site address:

- `https://your-username.github.io/lmstudio-lab-wiki/#load-model`
- `https://your-username.github.io/lmstudio-lab-wiki/#troubleshooting`

The ID is the part after `#` in the page's sidebar link in `index.html`.

## Put it in Google Sites

Use **Insert › Embed › By URL** and paste the GitHub Pages address. Don't use **Embed code**. A web address loads the wiki as a normal page, so page links work. Drag the embed box to full width and make it tall.

## Edit a page

You can edit right on GitHub: open `index.html`, click the pencil icon, make your change, and click **Commit changes**. The live site updates within a minute or two.

- **Each page** is one `<article class="page" id="...">` block. Inside it are the group label, the title (`<h1>`), the summary (`<p class="lead">`), the assignment tags, and the content.
- **Section headings** inside a page are `<h2 class="sec" id="...">`. The "On this page" outline is built from them automatically.
- **The sidebar** is the `<nav class="sb-nav">` block. The Previous and Next buttons follow the sidebar's order.
- **Search** reads the page text automatically, so new pages are searchable with no extra steps.

To add a page:

1. Copy an existing `<article class="page" ...>` block, then change its `id` and its content. IDs use lowercase letters, numbers, and hyphens.
2. Add a link in the sidebar: `<a class="nav-link" href="#your-new-id">Your Page Title</a>`.

To add a screenshot, upload the image to `images/` and add this inside a page:

```html
<figure class="shot">
  <div class="scroll"><img src="images/your-image.png" alt="Describe what the image shows" loading="lazy"></div>
  <figcaption>One or two sentences telling students what to look at.</figcaption>
</figure>
```

Callout boxes come in three colors: `<div class="callout">` (note), `<div class="callout warn">` (caution), and `<div class="callout stop">` (don't do this).

## Sources

The content comes from the course handouts (Assignments 1 to 5 and the Capstone) and the official LM Studio docs at https://lmstudio.ai/docs. The full list is on the wiki's Sources page.
