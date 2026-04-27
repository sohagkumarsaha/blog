---
layout: base.njk
title: "Python Signal Processing"
description: "A complete Python example for generating, filtering, and analyzing a noisy signal."
date: 2025-02-01
category: code
tags:
  - python
  - code
---

The following Python example generates a noisy signal, applies a moving-average filter, and reports a simple signal-to-noise estimate.

```python
import numpy as np


def moving_average(signal, window_size):
    """Return a centered moving-average approximation."""
    if window_size < 1:
        raise ValueError("window_size must be positive")
    kernel = np.ones(window_size) / window_size
    return np.convolve(signal, kernel, mode="same")


def estimate_snr(clean, noisy):
    """Estimate SNR in decibels using clean and noisy signals."""
    noise = noisy - clean
    signal_power = np.mean(clean ** 2)
    noise_power = np.mean(noise ** 2)
    return 10 * np.log10(signal_power / noise_power)


fs = 1000
seconds = 1.0
time = np.linspace(0, seconds, int(fs * seconds), endpoint=False)

clean_signal = np.sin(2 * np.pi * 40 * time)
noise = 0.35 * np.random.default_rng(42).standard_normal(time.shape)
noisy_signal = clean_signal + noise
filtered_signal = moving_average(noisy_signal, window_size=15)

print(f"Input SNR: {estimate_snr(clean_signal, noisy_signal):.2f} dB")
print(f"Filtered mean amplitude: {np.mean(np.abs(filtered_signal)):.3f}")
```

This is a deliberately compact example. In a research notebook, the next step would be to plot the raw and filtered signals and compare filter choices.
