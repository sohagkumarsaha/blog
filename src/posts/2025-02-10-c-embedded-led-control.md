---
layout: base.njk
title: "C – Embedded LED Control"
description: "A small C example for toggling an LED in an embedded-style loop."
date: 2025-02-10
category: code
tags:
  - c
  - code
---

This C example uses register-style macros to show the structure of a simple embedded LED control loop.

```c
#include <stdint.h>

#define GPIO_PORTA_DIR   (*(volatile uint32_t *)0x40020000)
#define GPIO_PORTA_OUT   (*(volatile uint32_t *)0x40020014)
#define LED_PIN          (1U << 5)

static void delay_cycles(volatile uint32_t cycles) {
    while (cycles-- > 0U) {
        __asm__("nop");
    }
}

int main(void) {
    GPIO_PORTA_DIR |= LED_PIN;

    while (1) {
        GPIO_PORTA_OUT ^= LED_PIN;
        delay_cycles(500000U);
    }

    return 0;
}
```

The memory addresses are illustrative. For real hardware, use the register definitions from the microcontroller vendor header file.
