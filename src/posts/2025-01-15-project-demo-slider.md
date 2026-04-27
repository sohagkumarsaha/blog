---
layout: base.njk
title: "Project Demo Slider"
description: "An image slider created with a reusable Nunjucks macro and vanilla JavaScript."
date: 2025-01-15
category: engineering
tags:
  - slider
---
{% from "macros.njk" import slider %}

This project demo uses a small slider component to present stages of an engineering workflow. The slider is rendered statically by Eleventy and activated by vanilla JavaScript in the browser.

{% set slides = [
  { src: '/assets/images/demo-1.svg' | url, alt: 'Concept sketch', caption: 'Step 1: Concept sketch and design assumptions' },
  { src: '/assets/images/demo-2.svg' | url, alt: 'Simulation stage', caption: 'Step 2: Simulation and sensitivity checks' },
  { src: '/assets/images/demo-3.svg' | url, alt: 'Prototype stage', caption: 'Step 3: Prototype validation and notes' }
] %}

{{ slider('project-demo-slider', slides) }}

Because the component is data-driven, new slides can be added by editing the array in the post.
