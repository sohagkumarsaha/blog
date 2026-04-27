---
layout: base.njk
title: "Conference Trip Gallery"
description: "A responsive gallery rendered through a Nunjucks macro."
date: 2025-01-10
category: travel
tags:
  - gallery
  - travel
---
{% from "macros.njk" import gallery %}

A conference trip is more than a set of talks. It is also a chance to discover new collaborators, revisit research questions, and return with new energy for ongoing projects.

{% set images = [
  { src: '/assets/images/demo-1.svg' | url, alt: 'Conference hall illustration', caption: 'Opening keynote and research themes' },
  { src: '/assets/images/demo-2.svg' | url, alt: 'Poster session illustration', caption: 'Poster session discussions' },
  { src: '/assets/images/demo-3.svg' | url, alt: 'Campus walkway illustration', caption: 'Walking between sessions' },
  { src: '/assets/images/demo-4.svg' | url, alt: 'Workshop illustration', caption: 'Hands-on workshop notes' },
  { src: '/assets/images/demo-5.svg' | url, alt: 'City evening illustration', caption: 'Evening reflection after talks' },
  { src: '/assets/images/demo-6.svg' | url, alt: 'Notebook illustration', caption: 'Ideas for future collaboration' }
] %}

{{ gallery(images) }}

The gallery macro keeps the Markdown post simple while producing responsive HTML that works well on desktop and mobile screens.
