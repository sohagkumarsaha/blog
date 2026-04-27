---
layout: base.njk
title: "Code Walk-through: Quicksort"
description: "A C quicksort implementation followed by a styled line-by-line explanation."
date: 2025-02-15
category: code
tags:
  - explanation
---

Quicksort is a classic divide-and-conquer sorting algorithm. It chooses a pivot, partitions values around the pivot, and recursively sorts the two partitions.

```c
#include <stdio.h>

void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}

int partition(int values[], int low, int high) {
    int pivot = values[high];
    int i = low - 1;

    for (int j = low; j < high; j++) {
        if (values[j] <= pivot) {
            i++;
            swap(&values[i], &values[j]);
        }
    }

    swap(&values[i + 1], &values[high]);
    return i + 1;
}

void quicksort(int values[], int low, int high) {
    if (low < high) {
        int pivotIndex = partition(values, low, high);
        quicksort(values, low, pivotIndex - 1);
        quicksort(values, pivotIndex + 1, high);
    }
}

int main(void) {
    int values[] = {9, 4, 7, 3, 10, 5};
    int n = sizeof(values) / sizeof(values[0]);

    quicksort(values, 0, n - 1);

    for (int i = 0; i < n; i++) {
        printf("%d ", values[i]);
    }

    return 0;
}
```

<div class="code-explanation">
  <h3>Line-by-line explanation</h3>
  <ol>
    <li><strong><code>swap</code></strong> exchanges two integer values using pointers.</li>
    <li><strong><code>partition</code></strong> selects the final element as the pivot.</li>
    <li>The variable <strong><code>i</code></strong> tracks the boundary of values less than or equal to the pivot.</li>
    <li>The loop compares each candidate value with the pivot and moves smaller values left.</li>
    <li>After the loop, the pivot is placed in its final sorted position.</li>
    <li><strong><code>quicksort</code></strong> recursively sorts the left and right partitions.</li>
    <li>The base case <strong><code>low &lt; high</code></strong> stops recursion when a partition has zero or one element.</li>
  </ol>
</div>

For teaching, this example is useful because it shows pointers, arrays, recursion, and algorithmic partitioning in one compact program.
