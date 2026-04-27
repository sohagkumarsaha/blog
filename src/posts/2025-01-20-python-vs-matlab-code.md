---
layout: base.njk
title: "Python vs MATLAB Code"
description: "A tabbed comparison of Python and MATLAB code snippets with syntax highlighting."
date: 2025-01-20
category: code
tags:
  - tabs
  - code
---
{% from "macros.njk" import tabs %}

Many research workflows can be written in either Python or MATLAB. Tabs are helpful when comparing equivalent implementations without forcing the reader to scroll through both versions.

{% set tabItems = [
  {
    label: 'Python',
    content: '<pre><code class="language-python">import numpy as np\n\ntime = np.linspace(0, 1, 500)\nsignal = np.sin(2 * np.pi * 20 * time)\nenergy = np.trapz(signal ** 2, time)\n\nprint(f"Signal energy: {energy:.4f}")</code></pre>'
  },
  {
    label: 'MATLAB',
    content: '<pre><code class="language-matlab">time = linspace(0, 1, 500);\nsignal = sin(2*pi*20*time);\nenergy = trapz(time, signal.^2);\n\nfprintf("Signal energy: %.4f\\n", energy);</code></pre>'
  }
] %}

{{ tabs('python-matlab-tabs', tabItems) }}

The same mathematical operation appears in both languages: define a time vector, compute a sinusoid, integrate squared amplitude, and print the result.
