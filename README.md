# Personal Academic Blog

A complete static academic blog built with Eleventy, Nunjucks, Decap CMS, Prism.js, vanilla JavaScript, and GitHub Pages.

## Features

- Eleventy static site generation with clean URLs.
- Nunjucks templates and reusable macros for gallery, slider, tabs, and accordion components.
- Decap CMS admin panel at `/admin/`.
- GitHub OAuth through Netlify's auth proxy for browser-based editing.
- GitHub Actions deployment to the `gh-pages` branch.
- Medium-inspired two-column academic blog design.
- Automatically generated homepage with the 10 most recent posts.
- Automatically generated category filters from post front matter.
- Prism.js syntax highlighting for Python, MATLAB, and C.
- Copy-to-clipboard button added to every code block.
- Visitor-specific reading history and recommendations stored in `localStorage`.

## Project structure

```text
blog/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── admin/
│   ├── config.yml
│   └── index.html
├── src/
│   ├── _data/
│   │   └── site.json
│   ├── _includes/
│   │   ├── base.njk
│   │   ├── header.njk
│   │   ├── footer.njk
│   │   ├── sidebar.njk
│   │   ├── post-card.njk
│   │   └── macros.njk
│   ├── assets/
│   │   ├── css/
│   │   │   └── style.css
│   │   ├── js/
│   │   │   ├── main.js
│   │   │   ├── slider.js
│   │   │   ├── tabs.js
│   │   │   └── accordion.js
│   │   └── images/
│   │       ├── avatar.svg
│   │       ├── og-image.svg
│   │       ├── demo-1.svg
│   │       ├── demo-2.svg
│   │       ├── demo-3.svg
│   │       ├── demo-4.svg
│   │       ├── demo-5.svg
│   │       ├── demo-6.svg
│   │       └── uploads/
│   ├── pages/
│   │   ├── academic-profile.md
│   │   ├── research-projects.md
│   │   ├── publications.md
│   │   ├── teaching.md
│   │   └── cv.md
│   ├── posts/
│   │   ├── 2025-01-01-hello-world.md
│   │   ├── 2025-01-05-research-notes-ai-trends.md
│   │   ├── 2025-01-10-conference-trip-gallery.md
│   │   ├── 2025-01-15-project-demo-slider.md
│   │   ├── 2025-01-20-python-vs-matlab-code.md
│   │   ├── 2025-01-25-frequently-asked-questions.md
│   │   ├── 2025-02-01-python-signal-processing.md
│   │   ├── 2025-02-05-matlab-finite-element-solver.md
│   │   ├── 2025-02-10-c-embedded-led-control.md
│   │   └── 2025-02-15-code-walkthrough-quicksort.md
│   └── index.njk
├── .eleventy.js
├── package.json
└── README.md
```

## Prerequisites

Install these before starting:

- Node.js 20 or newer.
- npm.
- Git.
- A GitHub account.
- A Netlify account for the GitHub OAuth proxy used by Decap CMS.

## Local setup

1. Clone your repository:

```bash
git clone https://github.com/sohagkumarsaha/blog.git
cd blog
```

2. Install dependencies:

```bash
npm install
```

3. Run the local development server:

```bash
npm start
```

Because this project is configured for GitHub Pages under the `/blog/` path prefix, the local URL will usually be similar to:

```text
http://localhost:8080/blog/
```

4. Build the production site:

```bash
npm run build
```

The generated static site appears in `_site/`.

## Configure site identity

Edit `src/_data/site.json`:

```json
{
  "title": "Sohag Kumar Saha | Academic Blog",
  "description": "Research notes, engineering projects, code examples, teaching materials, and academic reflections by Sohag Kumar Saha.",
  "url": "https://sohagkumarsaha.github.io/blog",
  "author": "Sohag Kumar Saha",
  "bio": "Researcher and educator writing about power systems, energy management systems, smart grid, ML and AI in energy systems, engineering systems, scientific computing, and academic life.",
  "avatar": "/assets/images/avatar.svg",
  "ogImage": "https://sohagkumarsaha.github.io/blog/assets/images/og-image.svg"
}
```

If your GitHub username or repository name is different, update:

- `site.url`
- `site.ogImage`
- `.eleventy.js` `pathPrefix`
- `.github/workflows/deploy.yml` `--pathprefix`
- `admin/config.yml` `repo`, `site_url`, `display_url`, and `logo_url`

For a user site named `username.github.io`, use `/` instead of `/blog/` as the path prefix.

## Configure Decap CMS with GitHub OAuth

Decap CMS uses GitHub as the backend and Netlify's OAuth proxy for authentication.

### 1. Create a GitHub OAuth App

In GitHub:

1. Go to **Settings**.
2. Open **Developer settings**.
3. Open **OAuth Apps**.
4. Click **New OAuth App**.
5. Set **Application name** to `Academic Blog CMS`.
6. Set **Homepage URL** to:

```text
https://sohagkumarsaha.github.io/blog
```

7. Set **Authorization callback URL** to:

```text
https://api.netlify.com/auth/done
```

8. Save the app and copy the **Client ID** and **Client Secret**.

### 2. Configure Netlify OAuth provider

In Netlify:

1. Open **User settings**.
2. Go to **Applications** or **OAuth applications**.
3. Add a new GitHub OAuth provider using the GitHub Client ID and Client Secret.
4. Netlify will serve as the auth proxy at `https://api.netlify.com/auth`.

### 3. Confirm Decap backend settings

The file `admin/config.yml` already contains:

```yaml
backend:
  name: github
  repo: sohagkumarsaha/blog
  branch: main
  base_url: https://api.netlify.com
  auth_endpoint: auth
```

If your repository is under a different GitHub username or organization, change `repo` to:

```yaml
repo: your-username/your-repository-name
```

## Deploy to GitHub Pages

1. Create a GitHub repository named `blog`.
2. Push the project to the `main` branch:

```bash
git init
git add .
git commit -m "Initial academic blog"
git branch -M main
git remote add origin https://github.com/sohagkumarsaha/blog.git
git push -u origin main
```

3. Open the repository on GitHub.
4. Go to **Settings > Pages**.
5. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
6. Choose the `gh-pages` branch and `/ (root)` folder.
7. Save.

The workflow in `.github/workflows/deploy.yml` runs automatically when you push to `main`. It installs dependencies, runs Eleventy, and publishes `_site/` to the `gh-pages` branch.

## Use the admin panel

After deployment and OAuth setup, open:

```text
https://sohagkumarsaha.github.io/blog/admin/
```

From the admin panel you can:

- Create new blog posts.
- Edit existing posts.
- Create and edit static pages.
- Upload images to `src/assets/images/uploads`.

When you save a post, Decap CMS commits a Markdown file to `src/posts/` on the `main` branch. That commit triggers GitHub Actions, rebuilds the site, and deploys the result to `gh-pages`.

## Add a new post manually

Create a Markdown file in `src/posts/`:

```markdown
---
layout: base.njk
title: "My New Research Note"
description: "A short description for SEO and post previews."
date: 2025-03-01
category: research
tags:
  - notes
  - research
---

Write the post content here.
```

Eleventy automatically adds it to:

- the latest posts collection,
- category filtering,
- `window.__POSTS__`,
- sidebar recommendation logic.

## Add a new page manually

Create a Markdown file in `src/pages/`:

```markdown
---
layout: base.njk
title: New Page
description: A static academic page.
permalink: /pages/new-page/
---

Page content goes here.
```

Then add a link to `src/_includes/header.njk` or `src/_includes/sidebar.njk` if you want it in the navigation.

## Use the macros

Import macros at the top of any Markdown post:

```njk
{% from "macros.njk" import gallery, slider, tabs, accordion %}
```

Then call a macro with data.

### Gallery

```njk
{% set images = [
  { src: '/assets/images/demo-1.svg' | url, alt: 'Demo image', caption: 'Caption' }
] %}

{{ gallery(images) }}
```

### Slider

```njk
{% set slides = [
  { src: '/assets/images/demo-1.svg' | url, alt: 'Slide', caption: 'Slide caption' }
] %}

{{ slider('my-slider', slides) }}
```

### Tabs

```njk
{% set items = [
  { label: 'Python', content: '<pre><code class="language-python">print("Hello")</code></pre>' }
] %}

{{ tabs('my-tabs', items) }}
```

### Accordion

```njk
{% set items = [
  { question: 'Question?', answer: '<p>Answer.</p>' }
] %}

{{ accordion('my-accordion', items) }}
```

## Personalization behavior

The sidebar uses `window.__POSTS__`, injected in `base.njk`, and visitor data stored in `localStorage`.

- `Most popular (for you)` shows the five posts the current visitor has opened most often.
- `You might also like` recommends unread posts that share tags or categories with the visitor's reading history.
- No server database is required.
- Data stays in the visitor's browser.

## File count summary

This project contains 40 files:

- 1 GitHub Actions workflow
- 2 Decap CMS admin files
- 1 site data file
- 6 Nunjucks include/template files
- 1 CSS file
- 4 JavaScript files
- 8 SVG/image files
- 5 static Markdown pages
- 10 Markdown sample posts
- 1 Eleventy config file
- 1 package file
- 1 README file
