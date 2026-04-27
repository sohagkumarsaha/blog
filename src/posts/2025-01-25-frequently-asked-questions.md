---
layout: base.njk
title: "Frequently Asked Questions"
description: "A short FAQ post using an accordion component built with vanilla JavaScript."
date: 2025-01-25
category: teaching
tags:
  - accordion
---
{% from "macros.njk" import accordion %}

This FAQ demonstrates an accordion component for compact teaching notes and project documentation.

{% set faqItems = [
  {
    question: 'Can I edit posts from the browser?',
    answer: '<p>Yes. Decap CMS provides an admin interface at <code>/admin/</code>. After GitHub OAuth is configured, saved posts are committed to the repository.</p>'
  },
  {
    question: 'Do I need a database?',
    answer: '<p>No. Eleventy generates static HTML. Personal reading history is stored only in the visitor’s browser using <code>localStorage</code>.</p>'
  },
  {
    question: 'Can I add more shortcodes or macros?',
    answer: '<p>Yes. Add reusable Nunjucks macros in <code>src/_includes/macros.njk</code> and import them in Markdown posts.</p>'
  }
] %}

{{ accordion('blog-faq', faqItems) }}

Accordions are useful when the reader may not need every detail immediately.
