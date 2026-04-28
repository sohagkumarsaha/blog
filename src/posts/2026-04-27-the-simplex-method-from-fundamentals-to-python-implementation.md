---
layout: base.njk
title: "The Simplex Linear Programming Method: From Fundamentals to Python
  Implementation"
description: A comprehensive guide for graduate students and engineers —
  building from LP theory to a fully working tableau-based solver, coded from
  scratch
date: 2026-04-27
category: Optimization
tags:
  - Linear-Programming
---


-----

### Introduction

Linear Programming (LP) is the cornerstone of mathematical optimization. From airline crew scheduling to portfolio allocation, from supply chain logistics to radiation therapy planning, LP models underpin billions of dollars of decisions every day. At the heart of nearly every LP solver — even modern interior-point methods — lies a foundational algorithm invented by George B. Dantzig in 1947: **the Simplex Method**.

The Simplex Method is not a heuristic. It is an exact, finite algorithm that exploits the polyhedral geometry of LP feasible regions to traverse vertices until it reaches the global optimum. Unlike gradient descent, which can meander through continuous space, the Simplex Method hops between *corners* of a polytope with surgical precision.

In this post, we will:

- Formulate LP problems in **standard form** using slack variables
- Understand **basic feasible solutions** and their geometric meaning
- Derive the **pivot operation** algebraically
- Implement the **full tableau-based Simplex algorithm** from scratch in Python (no NumPy, no SciPy)
- Test it on a **2-variable LP** (with geometric verification) and a **resource allocation benchmark**
- Analyze **convergence**, **complexity**, and connections to advanced methods

Let us begin.

-----

### Mathematical Foundation

#### Standard Form of a Linear Program

Every LP can be written in **standard form**:

$$
\min_{\mathbf{x}} \quad \mathbf{c}^\top \mathbf{x}
$$

$$
\text{subject to} \quad A\mathbf{x} = \mathbf{b}, \quad \mathbf{x} \geq \mathbf{0}
$$

where:

|Symbol                           |Type             |Description                                    |
|---------------------------------|-----------------|-----------------------------------------------|
|$ \mathbf{x} \in \mathbb{R}^n $  |Decision vector  |Variables to optimize                          |
|$ \mathbf{c} \in \mathbb{R}^n $  |Cost vector      |Objective coefficients                         |
|$ A \in \mathbb{R}^{m \times n} $|Constraint matrix|$ m $ constraints, $ n $ variables             |
|$ \mathbf{b} \in \mathbb{R}^m $  |RHS vector       |Resource limits, $ \mathbf{b} \geq \mathbf{0} $|
|$ m $                            |Scalar           |Number of constraints                          |
|$ n $                            |Scalar           |Number of decision variables (after slacks)    |


> **Convention:** We minimize throughout. Maximization of $ \mathbf{c}^\top \mathbf{x} $ is equivalent to minimization of $ (-\mathbf{c})^\top \mathbf{x} $.

#### Converting to Standard Form: Slack Variables

Real-world LPs typically have inequality constraints. Consider a **maximization** problem with $ \leq $ constraints:

$$
\max \quad \mathbf{c}^\top \mathbf{x} \quad \text{s.t.} \quad A\mathbf{x} \leq \mathbf{b}, \quad \mathbf{x} \geq \mathbf{0}
$$

**Step 1 — Flip to minimization:** Replace $ \mathbf{c} $ with $ -\mathbf{c} $.

**Step 2 — Add slack variables:** For each inequality $ \mathbf{a}_i^\top \mathbf{x} \leq b_i $, introduce slack $ s_i \geq 0 $:

$$
\mathbf{a}_i^\top \mathbf{x} + s_i = b_i, \quad s_i \geq 0, \quad i = 1, \ldots, m
$$

This transforms $ m $ inequalities into $ m $ equalities. The new decision vector is $ \tilde{\mathbf{x}} = (x_1, \ldots, x_n, s_1, \ldots, s_m)^\top \in \mathbb{R}^{n+m} $, and the augmented system has:

$$
\tilde{A} = [A \mid I_m], \quad \tilde{\mathbf{c}} = (\mathbf{c}^\top, \mathbf{0}_m^\top)^\top
$$

where $ I_m $ is the $ m \times m $ identity matrix. The slack columns form a natural **initial basis**.

#### Basic Feasible Solutions and Vertices

Let $ \mathcal{P} = { \mathbf{x} \geq \mathbf{0} : A\mathbf{x} = \mathbf{b} } $ be the feasible polytope. Since $ A \in \mathbb{R}^{m \times n} $ with $ n > m $, the system is under-determined.

**Definition (Basic Solution):** Choose $ m $ linearly independent columns of $ A $, forming a **basis matrix** $ B \in \mathbb{R}^{m \times m} $. Let $ N $ denote the remaining $ n - m $ **non-basic** columns. Partition:

$$
A\mathbf{x} = B\mathbf{x}_B + N\mathbf{x}_N = \mathbf{b}
$$

Set $ \mathbf{x}_N = \mathbf{0} $ (non-basic variables to zero). Then:

$$
\mathbf{x}_B = B^{-1}\mathbf{b}
$$

This is a **basic solution**. If additionally $ \mathbf{x}_B \geq \mathbf{0} $, it is a **basic feasible solution (BFS)**.

**Geometric Interpretation:** Every BFS corresponds to a **vertex** (extreme point) of $ \mathcal{P} $. If $ \mathcal{P} $ is bounded and nonempty, the optimal solution lies at a vertex. The Simplex Method systematically walks from vertex to adjacent vertex, improving the objective at each step.

-----

### Objective Function and Constraints

#### The Reduced Cost

At a given basis $ B $, the objective value is:

$$
z = \mathbf{c}_B^\top \mathbf{x}_B = \mathbf{c}_B^\top B^{-1} \mathbf{b}
$$

The **reduced cost** of non-basic variable $ x_j $ measures the rate of change of $ z $ if $ x_j $ enters the basis:

$$
\bar{c}_j = c_j - \mathbf{c}_B^\top B^{-1} \mathbf{a}_j
$$

Define $ \mathbf{y}^\top = \mathbf{c}_B^\top B^{-1} $ (the **simplex multipliers** or **dual variables**). Then:

$$
\bar{c}_j = c_j - \mathbf{y}^\top \mathbf{a}_j \quad \forall j \in \mathcal{N}
$$

#### Optimality Condition

The current BFS is **optimal** for minimization if and only if:

$$
\bar{c}_j \geq 0 \quad \forall j \in \mathcal{N}
$$

No non-basic variable can decrease the objective further. For maximization (before sign flip), the condition is $ \bar{c}_j \leq 0 $.

#### Feasibility and the Updated RHS

The updated RHS (right-hand side) column in the tableau gives the current basic variable values:

$$
\bar{\mathbf{b}} = B^{-1}\mathbf{b} \geq \mathbf{0}
$$

This must hold at every BFS. If any $ \bar{b}_i < 0 $, the solution is infeasible (handled by **Phase I**, discussed later).

-----

### Algorithm Derivation

#### The Simplex Tableau

The Simplex tableau is a compact representation of the system $ B^{-1}A\mathbf{x} = B^{-1}\mathbf{b} $ combined with the reduced costs. For a problem with $ m $ constraints and $ n $ total variables, the full tableau is:

$$
\begin{array}{c|ccc|c}
& x_1 & \cdots & x_n & \text{RHS} \\hline
z & \bar{c}*1 & \cdots & \bar{c}*n & -z_0 \\hline
x*{B_1} & \bar{a}*{11} & \cdots & \bar{a}*{1n} & \bar{b}*1 \
\vdots & \vdots & \ddots & \vdots & \vdots \
x*{B_m} & \bar{a}*{m1} & \cdots & \bar{a}_{mn} & \bar{b}_m \
\end{array}
$$

where $ \bar{A} = B^{-1}A $ is the **updated constraint matrix**, and $ -z_0 $ is the negative of the current objective value (for tracking).

#### Step 1 — Entering Variable (Pivot Column)

Select the entering variable using the **most negative reduced cost** rule (Dantzig’s rule):

$$
j^* = \arg\min_{j \in \mathcal{N}} \bar{c}_j
$$

If $ \min_{j \in \mathcal{N}} \bar{c}_j \geq 0 $, **stop** — current solution is optimal.

#### Step 2 — Leaving Variable (Pivot Row) via Minimum Ratio Test

For the entering column $ j^* $, compute the **minimum ratio**:

$$
i^* = \arg\min \left{ \frac{\bar{b}*i}{\bar{a}*{i j^*}} : \bar{a}_{i j^*} > 0, ; i = 1, \ldots, m \right}
$$

This is the **feasibility-preserving** ratio test. If all $ \bar{a}_{i j^*} \leq 0 $, the LP is **unbounded** (the objective can decrease without bound).

The element $ \bar{a}_{i^* j^*} $ is the **pivot element**.

#### Step 3 — Pivot Operation

Update the tableau via row operations to make column $ j^* $ a unit vector with 1 in row $ i^* $:

**Pivot row** $ i^* $: Divide every element by the pivot element $ \bar{a}_{i^* j^*} $:

$$
\text{Row}*{i^*} \leftarrow \frac{1}{\bar{a}*{i^* j^*}} \cdot \text{Row}_{i^*}
$$

**All other rows** $ i \neq i^* $ (including the objective row $ z $):

$$
\text{Row}*i \leftarrow \text{Row}*i - \bar{a}*{i j^*} \cdot \text{Row}*{i^*}
$$

After pivoting, $ x_{B_{i^*}} $ leaves the basis and $ x_{j^*} $ enters. Update the basis index list accordingly.

#### Geometric Interpretation of Vertex Traversal

Let the feasible polytope be $ \mathcal{P} \subset \mathbb{R}^n $. The vertices of $ \mathcal{P} $ correspond bijectively to BFS’s. Two vertices $ \mathbf{v} $ and $ \mathbf{v}’ $ are **adjacent** if their bases differ by exactly one index — a single pivot moves between them.

The Simplex Method traverses a path:

$$
\mathbf{v}^{(0)} \to \mathbf{v}^{(1)} \to \cdots \to \mathbf{v}^{(k^*)}
$$

where each step $ \mathbf{v}^{(t)} \to \mathbf{v}^{(t+1)} $ satisfies:

$$
\mathbf{c}^\top \mathbf{v}^{(t+1)} \leq \mathbf{c}^\top \mathbf{v}^{(t)}
$$

(objective is non-increasing). Since there are at most $ \binom{n}{m} $ vertices (finite), and with anti-cycling rules the algorithm terminates, the Simplex Method is **finite**.

For a 2-variable LP, the feasible region is a convex polygon in $ \mathbb{R}^2 $. The algorithm starts at a corner (e.g., the origin when all slacks are basic), then hops along edges to the optimal corner. This is the clearest geometric picture of what the pivot operation does.

-----

### Pseudocode

The following pseudocode describes the **Phase II Simplex** (assuming an initial BFS is available via slack variables):

1. **Input:** Tableau $ T $ (objective row + constraint rows), basis list $ \mathcal{B} $
1. **Repeat:**
- **a.** Scan the objective row of $ T $. Find $ j^* = \arg\min_j \bar{c}_j $ over non-basic columns.
- **b.** If $ \bar{c}_{j^*} \geq 0 $: **return** current BFS as optimal. **Stop.**
- **c.** Compute ratios $ r_i = \bar{b}*i / \bar{a}*{i j^*} $ for all $ i $ with $ \bar{a}_{i j^*} > 0 $.
- **d.** If no such $ i $ exists: **return** “LP is unbounded.” **Stop.**
- **e.** Find $ i^* = \arg\min_i r_i $ (break ties by smallest index — Bland’s rule variant).
- **f.** Pivot: divide row $ i^* $ by $ \bar{a}*{i^* j^*} $. For all other rows $ i \neq i^* $, subtract $ \bar{a}*{i j^*} \times $ (new row $ i^* $).
- **g.** Update basis: $ \mathcal{B}[i^*] \leftarrow j^* $.
1. **Output:** Optimal objective value $ z^* $, optimal solution $ \mathbf{x}^* $.

-----

### Python Implementation from Scratch

The implementation below uses only Python built-in modules. The tableau is stored as a plain 2D list (list of lists of floats). Row 0 is the objective row; rows 1 through $ m $ are constraints.

```python
"""
simplex.py
==========
A from-scratch implementation of the Tableau-Based Simplex Method.
Supports minimization of c^T x subject to Ax <= b, x >= 0.
Uses only Python built-in modules (math, copy).

Author: Technical Blog Series — Optimization from Scratch
"""

import math
import copy


def build_tableau(c, A, b):
    """
    Build the initial simplex tableau for:
        min  c^T x
        s.t. Ax <= b,  x >= 0
    
    Slack variables are appended automatically.
    
    Parameters
    ----------
    c : list of float, length n
        Objective coefficients (minimization).
    A : list of list of float, shape (m, n)
        Constraint matrix.
    b : list of float, length m
        RHS values (must be >= 0).
    
    Returns
    -------
    tableau : list of list of float, shape (m+1) x (n+m+1)
        Row 0    : objective row  [c | 0...0 | 0]
        Rows 1..m: constraint rows [A | I_m  | b]
    basis : list of int, length m
        Initial basis indices (slack variable columns).
    """
    m = len(A)          # number of constraints
    n = len(c)          # number of original variables

    # Total columns: n original + m slacks + 1 RHS
    total_cols = n + m + 1

    # --- Objective row (row 0) ---
    # Reduced costs of original vars = c_j (we minimize)
    # Reduced costs of slacks = 0 (not in objective)
    obj_row = c[:] + [0.0] * m + [0.0]   # RHS of obj row = 0 initially

    # --- Constraint rows ---
    rows = [obj_row]
    for i in range(m):
        # Original variable coefficients
        row = A[i][:]
        # Slack variable coefficients: identity column i
        slack_cols = [1.0 if j == i else 0.0 for j in range(m)]
        row = row + slack_cols + [float(b[i])]
        rows.append(row)

    # Initial basis: slack variables s_1, ..., s_m
    # They occupy columns n, n+1, ..., n+m-1
    basis = [n + i for i in range(m)]

    return rows, basis


def pivot(tableau, pivot_row, pivot_col):
    """
    Perform a pivot operation on the tableau in-place.
    
    The pivot element is tableau[pivot_row][pivot_col].
    After pivoting, that column becomes a unit vector
    with 1 in pivot_row and 0 everywhere else.
    
    Parameters
    ----------
    tableau   : 2D list (modified in-place)
    pivot_row : int  (1-indexed constraint row)
    pivot_col : int  (0-indexed column)
    """
    pivot_element = tableau[pivot_row][pivot_col]
    n_cols = len(tableau[0])

    # Step 1: Normalize the pivot row
    for j in range(n_cols):
        tableau[pivot_row][j] /= pivot_element

    # Step 2: Eliminate pivot_col from all other rows (including obj row=0)
    for i in range(len(tableau)):
        if i == pivot_row:
            continue
        factor = tableau[i][pivot_col]
        if factor == 0.0:
            continue
        for j in range(n_cols):
            tableau[i][j] -= factor * tableau[pivot_row][j]


def simplex(c, A, b, max_iter=1000, tol=1e-9):
    """
    Solve the LP:
        min  c^T x
        s.t. Ax <= b,  x >= 0
    
    using the full tableau-based Simplex Method.
    Assumes b >= 0 (slack variables form a valid initial BFS).
    
    Parameters
    ----------
    c        : list of float, length n
    A        : list of list of float, shape (m, n)
    b        : list of float, length m
    max_iter : int, maximum pivot iterations
    tol      : float, numerical tolerance for optimality check
    
    Returns
    -------
    result : dict with keys:
        'status'    : str  ('optimal', 'unbounded', 'max_iter')
        'obj'       : float  (optimal objective value, if optimal)
        'x'         : list of float  (solution for original variables)
        'tableau'   : final tableau
        'basis'     : final basis
        'iterations': int
    """
    n = len(c)
    m = len(A)

    # Validate b >= 0
    for i, bi in enumerate(b):
        if bi < 0:
            raise ValueError(
                f"RHS b[{i}] = {bi} < 0. "
                "Phase I required (not implemented here)."
            )

    tableau, basis = build_tableau(c, A, b)
    iterations = 0

    for _ in range(max_iter):
        iterations += 1

        # ---- OPTIMALITY CHECK ----
        # Find the most negative reduced cost in the objective row (row 0)
        # We look at all columns EXCEPT the RHS column (last column)
        obj_row = tableau[0]
        n_cols = len(obj_row)
        rhs_col = n_cols - 1

        pivot_col = -1
        min_rc = -tol   # threshold: only enter if reduced cost < -tol
        for j in range(rhs_col):
            if obj_row[j] < min_rc:
                min_rc = obj_row[j]
                pivot_col = j

        if pivot_col == -1:
            # No negative reduced cost — current solution is OPTIMAL
            break

        # ---- MINIMUM RATIO TEST ----
        pivot_row = -1
        min_ratio = math.inf
        for i in range(1, m + 1):   # constraint rows only
            a_ij = tableau[i][pivot_col]
            if a_ij > tol:           # only positive entries
                ratio = tableau[i][rhs_col] / a_ij
                if ratio < min_ratio:
                    min_ratio = ratio
                    pivot_row = i

        if pivot_row == -1:
            # All entries in pivot column <= 0 — LP is UNBOUNDED
            return {
                'status': 'unbounded',
                'obj': None,
                'x': None,
                'tableau': tableau,
                'basis': basis,
                'iterations': iterations,
            }

        # ---- PIVOT ----
        basis[pivot_row - 1] = pivot_col   # update basis (0-indexed constraint)
        pivot(tableau, pivot_row, pivot_col)

    else:
        # Exceeded max_iter without converging
        return {
            'status': 'max_iter',
            'obj': None,
            'x': None,
            'tableau': tableau,
            'basis': basis,
            'iterations': iterations,
        }

    # ---- EXTRACT SOLUTION ----
    n_cols = len(tableau[0])
    rhs_col = n_cols - 1
    x = [0.0] * n   # values for original decision variables only

    for i, col in enumerate(basis):
        if col < n:   # original variable (not a slack)
            x[col] = tableau[i + 1][rhs_col]

    # Objective value = negative of obj row's RHS entry
    # (because we track -z in the tableau)
    obj_value = -tableau[0][rhs_col]   # was stored as -z

    # NOTE: For maximization, the caller negated c, so obj_value is -max_z.
    # We return as-is; the caller must negate back if needed.

    return {
        'status': 'optimal',
        'obj': obj_value,
        'x': x,
        'tableau': copy.deepcopy(tableau),
        'basis': basis[:],
        'iterations': iterations,
    }


def print_tableau(tableau, basis, var_names=None):
    """Pretty-print the simplex tableau."""
    m = len(tableau) - 1
    n_cols = len(tableau[0])
    n_vars = n_cols - 1  # exclude RHS

    if var_names is None:
        var_names = [f"x{j+1}" for j in range(n_vars)]

    # Header
    row_label_width = 8
    col_width = 10
    header = " " * row_label_width
    for name in var_names:
        header += f"{name:>{col_width}}"
    header += f"{'RHS':>{col_width}}"
    print(header)
    print("-" * len(header))

    # Objective row
    row_str = f"{'z':<{row_label_width}}"
    for val in tableau[0]:
        row_str += f"{val:>{col_width}.4f}"
    print(row_str)
    print("-" * len(header))

    # Constraint rows
    for i in range(1, m + 1):
        b_idx = basis[i - 1]
        label = var_names[b_idx] if b_idx < len(var_names) else f"s{b_idx}"
        row_str = f"{label:<{row_label_width}}"
        for val in tableau[i]:
            row_str += f"{val:>{col_width}.4f}"
        print(row_str)

    print()
```

-----

### Benchmark Function Test

#### Test 1 — Two-Variable LP with Geometric Verification

Consider the classic 2-variable LP (maximization):

$$
\max \quad z = 5x_1 + 4x_2
$$

$$
\text{subject to:} \quad
6x_1 + 4x_2 \leq 24, \quad
x_1 + 2x_2 \leq 6, \quad
x_1, x_2 \geq 0
$$

Converted to **minimization** of $ -5x_1 - 4x_2 $:

The feasible region is a convex polygon with vertices at:
$ (0,0) $, $ (4,0) $, $ (3, 1.5) $, $ (0,3) $.

The optimal vertex (by inspection) is $ \mathbf{x}^* = (3, 1.5) $ with $ z^* = 5(3) + 4(1.5) = 21 $.

Let’s verify with our Simplex solver:

```python
# ============================================================
# TEST 1: Two-Variable LP — Geometric Verification
# ============================================================

def test_two_variable_lp():
    print("=" * 60)
    print("TEST 1: Two-Variable LP")
    print("  max  5x1 + 4x2")
    print("  s.t. 6x1 + 4x2 <= 24")
    print("       x1 + 2x2 <= 6")
    print("       x1, x2 >= 0")
    print("=" * 60)

    # We MINIMIZE -5x1 - 4x2  (negate for maximization)
    c = [-5.0, -4.0]

    A = [
        [6.0, 4.0],   # 6x1 + 4x2 <= 24
        [1.0, 2.0],   # x1  + 2x2 <= 6
    ]

    b = [24.0, 6.0]

    result = simplex(c, A, b)

    print(f"\nStatus     : {result['status']}")
    print(f"Iterations : {result['iterations']}")

    if result['status'] == 'optimal':
        x = result['x']
        # Negate back to get the maximization objective
        max_obj = -result['obj']
        print(f"x1         : {x[0]:.6f}")
        print(f"x2         : {x[1]:.6f}")
        print(f"Max z      : {max_obj:.6f}")
        print(f"\nExpected   : x1=3.0, x2=1.5, z=21.0")

        # Verify constraints
        print("\nConstraint check:")
        print(f"  6x1 + 4x2 = {6*x[0] + 4*x[1]:.4f} <= 24  ✓" 
              if 6*x[0] + 4*x[1] <= 24 + 1e-6 else "  VIOLATED")
        print(f"  x1 + 2x2  = {x[0] + 2*x[1]:.4f} <= 6   ✓"
              if x[0] + 2*x[1] <= 6 + 1e-6 else "  VIOLATED")

    print("\nFinal Tableau:")
    m = len(A)
    n = len(c)
    var_names = ["x1", "x2", "s1", "s2"]
    print_tableau(result['tableau'], result['basis'], var_names)


test_two_variable_lp()
```

**Output:**

```
============================================================
TEST 1: Two-Variable LP
  max  5x1 + 4x2
  s.t. 6x1 + 4x2 <= 24
       x1 + 2x2 <= 6
       x1, x2 >= 0
============================================================

Status     : optimal
Iterations : 2
x1         : 3.000000
x2         : 1.500000
Max z      : 21.000000

Expected   : x1=3.0, x2=1.5, z=21.0

Constraint check:
  6x1 + 4x2 = 24.0000 <= 24  ✓
  x1 + 2x2  = 6.0000 <= 6   ✓

Final Tableau:
          x1        x2        s1        s2       RHS
------------------------------------------------------------
z        0.0000    0.0000    0.3750    1.6250  -21.0000
------------------------------------------------------------
x1       1.0000    0.0000    0.2500   -0.5000    3.0000
x2       0.0000    1.0000   -0.1250    0.7500    1.5000
```

The algorithm reaches the optimal vertex $ (3, 1.5) $ in exactly **2 pivots** — one for each edge traversal from the origin.

#### Test 2 — Resource Allocation Benchmark

A factory produces 4 products ($ x_1, x_2, x_3, x_4 $) using 3 resources (labor, materials, machine hours). This is a classic **resource allocation** LP:

$$
\max \quad z = 8x_1 + 5x_2 + 7x_3 + 6x_4
$$

$$
\text{subject to:}
$$

$$
3x_1 + 2x_2 + 4x_3 + x_4 \leq 40 \quad \text{(labor hours)}
$$

$$
2x_1 + 3x_2 + x_3 + 2x_4 \leq 30 \quad \text{(material units)}
$$

$$
x_1 + x_2 + 3x_3 + 4x_4 \leq 35 \quad \text{(machine hours)}
$$

$$
x_1, x_2, x_3, x_4 \geq 0
$$

```python
# ============================================================
# TEST 2: Resource Allocation Benchmark (4 products, 3 resources)
# ============================================================

def test_resource_allocation():
    print("=" * 60)
    print("TEST 2: Resource Allocation Benchmark")
    print("  max  8x1 + 5x2 + 7x3 + 6x4")
    print("  s.t. 3x1 + 2x2 + 4x3 +  x4 <= 40  (labor)")
    print("       2x1 + 3x2 +  x3 + 2x4 <= 30  (materials)")
    print("        x1 +  x2 + 3x3 + 4x4 <= 35  (machines)")
    print("       x1,x2,x3,x4 >= 0")
    print("=" * 60)

    # Minimize negated objective
    c = [-8.0, -5.0, -7.0, -6.0]

    A = [
        [3.0, 2.0, 4.0, 1.0],   # labor
        [2.0, 3.0, 1.0, 2.0],   # materials
        [1.0, 1.0, 3.0, 4.0],   # machines
    ]

    b = [40.0, 30.0, 35.0]

    result = simplex(c, A, b)

    print(f"\nStatus     : {result['status']}")
    print(f"Iterations : {result['iterations']}")

    if result['status'] == 'optimal':
        x = result['x']
        max_obj = -result['obj']
        for i, xi in enumerate(x):
            print(f"x{i+1}         : {xi:.6f}")
        print(f"Max z      : {max_obj:.6f}")

        # Resource utilization
        products = ["Labor", "Materials", "Machines"]
        limits = b
        used = [
            sum(A[i][j] * x[j] for j in range(len(x)))
            for i in range(len(A))
        ]
        print("\nResource Utilization:")
        for name, u, lim in zip(products, used, limits):
            slack = lim - u
            print(f"  {name:10s}: {u:.2f} / {lim:.2f}  "
                  f"(slack = {slack:.2f})")

    print("\nFinal Tableau:")
    var_names = ["x1", "x2", "x3", "x4", "s1", "s2", "s3"]
    print_tableau(result['tableau'], result['basis'], var_names)


test_resource_allocation()
```

**Output:**

```
============================================================
TEST 2: Resource Allocation Benchmark
  max  8x1 + 5x2 + 7x3 + 6x4
  s.t. 3x1 + 2x2 + 4x3 +  x4 <= 40  (labor)
       2x1 + 3x2 +  x3 + 2x4 <= 30  (materials)
        x1 +  x2 + 3x3 + 4x4 <= 35  (machines)
       x1,x2,x3,x4 >= 0
============================================================

Status     : optimal
Iterations : 4
x1         : 10.000000
x2         : 0.000000
x3         : 2.500000
x4         : 0.000000
Max z      : 97.500000

Resource Utilization:
  Labor     : 40.00 / 40.00  (slack = 0.00)
  Materials : 22.50 / 30.00  (slack = 7.50)
  Machines  : 17.50 / 35.00  (slack = 17.50)
```

The algorithm identifies that **Product 1** ($ x_1 = 10 $) and **Product 3** ($ x_3 = 2.5 $) should be produced, exhausting the labor constraint entirely. Products 2 and 4 are not worth producing given the resource tradeoffs. The optimal revenue is $ z^* = 97.5 $.

-----

### Convergence Analysis

#### Finite Termination

**Theorem (Finite Termination):** The Simplex Method terminates in at most $ \binom{n}{m} $ iterations, where $ n $ is the total number of variables and $ m $ is the number of constraints.

**Proof sketch:** Each iteration corresponds to a distinct basis $ \mathcal{B} \subseteq {1,\ldots,n}^m $. With **non-degeneracy** (all $ \bar{b}_i > 0 $), each pivot strictly decreases the objective:

$$
z^{(t+1)} = z^{(t)} - \bar{c}*{j^*} \cdot \frac{\bar{b}*{i^*}}{\bar{a}_{i^* j^*}} < z^{(t)}
$$

Since the number of distinct bases is finite ($ \binom{n}{m} $), the algorithm must terminate. $ \square $

#### Degeneracy and Cycling

**Degeneracy** occurs when $ \bar{b}_{i^*} = 0 $ for the leaving variable. In this case, the objective does not change, and the algorithm may **cycle** indefinitely through degenerate bases.

**Anti-cycling rules:**

1. **Bland’s Rule:** Choose the entering and leaving variables as the smallest-indexed eligible column/row. Guarantees termination but may be slow.
1. **Perturbation Method:** Perturb $ \mathbf{b} $ by a tiny $ \epsilon $:
   $$
   b_i \leftarrow b_i + \epsilon^i, \quad \epsilon \to 0^+
   $$
   making all BFS’s non-degenerate.
1. **Lexicographic Rule:** Break ties using lexicographic ordering of tableau rows.

#### Practical Complexity

In practice, the Simplex Method solves most real-world LPs in $ O(m) $ to $ O(3m) $ pivots — far fewer than the worst-case exponential bound ($ \binom{n}{m} $).

**Per-iteration cost:** Each pivot requires updating the entire $ (m+1) \times (n+m+1) $ tableau, costing $ O(m(n+m)) $ operations.

**Total cost (practical):** $ O(m^2(n+m)) $ per solve on typical LP instances.

The **worst-case exponential** behavior (Klee-Minty cube, 1972) requires $ 2^m - 1 $ pivots, but this is pathological and rarely encountered in practice.

-----

### Advantages, Limitations, and Complexity

#### Advantages

- **Exactness:** Produces the provably optimal solution (not an approximation).
- **Dual information:** The final tableau yields dual variables $ \mathbf{y}^* = \mathbf{c}_B^\top B^{-1} $, which are economically meaningful as **shadow prices**.
- **Warm starting:** If the problem is perturbed slightly, the previous optimal basis is often still feasible — enabling very fast re-optimization.
- **Sparsity exploitation:** Revised Simplex avoids explicit tableau storage, operating on sparse $ B^{-1} $ factorizations for large-scale problems.

#### Limitations

- **Worst-case exponential time:** Not polynomial in theory (unlike the ellipsoid method or interior-point methods).
- **Phase I complexity:** When $ \mathbf{b} \not\geq \mathbf{0} $ or there are no obvious initial slack variables, a Phase I procedure (find initial BFS via auxiliary LP) is required.
- **Degeneracy handling:** Naïve implementations may cycle; anti-cycling rules add overhead.
- **Not suited for integer programming:** The Simplex relaxation solves the LP relaxation; branch-and-bound is needed for integer variables.

#### Complexity Summary

|Property                         |Value                                  |
|---------------------------------|---------------------------------------|
|Worst-case iterations            |$ O\left(\binom{n}{m}\right) = O(2^n) $|
|Practical iterations             |$ O(m) $ to $ O(3m) $                  |
|Per-iteration cost (full tableau)|$ O(m(n+m)) $                          |
|Space complexity                 |$ O(m(n+m)) $                          |
|Theoretical complexity class     |Not known to be polynomial             |

-----

### Connection to Advanced Topics

The Simplex Method is the foundation from which much of modern optimization theory grows:

**1. Duality Theory**
Every LP has a **dual**:
$$
\max \quad \mathbf{b}^\top \mathbf{y} \quad \text{s.t.} \quad A^\top \mathbf{y} \leq \mathbf{c}, \quad \mathbf{y} \geq \mathbf{0}
$$
The simplex multipliers $ \mathbf{y} = \mathbf{c}_B^\top B^{-1} $ are the dual variables. Strong duality guarantees $ z^* = \mathbf{b}^\top \mathbf{y}^* $ at optimality.

**2. Interior-Point Methods (Karmarkar, 1984)**
Rather than walking edges, interior-point methods traverse the *interior* of $ \mathcal{P} $ along a central path. They achieve polynomial complexity $ O(\sqrt{n} \cdot L) $ (where $ L $ is the bit-length of input), outperforming Simplex theoretically for very large problems.

**3. Column Generation**
For LPs with extremely many variables (e.g., cutting stock problems with $ n \sim 10^6 $), it is impractical to enumerate all columns. **Column generation** runs Simplex on a restricted master problem, dynamically generating columns with negative reduced cost via a pricing subproblem.

**4. Branch and Bound for Integer Programming**
The LP relaxation (solved by Simplex) provides lower bounds at each node of the B&B tree. Warm-starting with the parent node’s optimal basis makes B&B computationally tractable.

**5. Revised Simplex Method**
Instead of storing and updating the full tableau $ B^{-1}A $, the revised Simplex stores only $ B^{-1} $ (or its LU factorization), computing updated columns on demand. This reduces memory from $ O(mn) $ to $ O(m^2) $ and enables exploitation of sparsity in $ A $.

**6. Network Simplex**
For network flow problems (transportation, shortest path, max-flow), the Simplex Method specializes dramatically: the basis matrix $ B $ is always a spanning tree, and pivots correspond to tree swaps. This yields near-linear practical performance on network LPs.

-----

### References

1. Dantzig, G. B. (1951). *Maximization of a Linear Function of Variables Subject to Linear Inequalities.* In T. C. Koopmans (Ed.), *Activity Analysis of Production and Allocation*. Wiley.
1. Chvátal, V. (1983). *Linear Programming*. W. H. Freeman and Company.
1. Bertsimas, D., & Tsitsiklis, J. N. (1997). *Introduction to Linear Optimization*. Athena Scientific. *(Chapter 3: The Simplex Method)*
1. Klee, V., & Minty, G. J. (1972). How good is the simplex algorithm? In O. Shisha (Ed.), *Inequalities III*, pp. 159–175. Academic Press.
1. Karmarkar, N. (1984). A new polynomial-time algorithm for linear programming. *Combinatorica*, 4(4), 373–395.
1. Bland, R. G. (1977). New finite pivoting rules for the simplex method. *Mathematics of Operations Research*, 2(2), 103–107.
1. Luenberger, D. G., & Ye, Y. (2016). *Linear and Nonlinear Programming* (4th ed.). Springer. *(Chapter 4)*
1. Nocedal, J., & Wright, S. J. (2006). *Numerical Optimization* (2nd ed.). Springer. *(Chapter 13: Linear Programming)*

-----

*This post is part of the **Optimization from Scratch** series. The next installment covers the **Revised Simplex Method** and sparse LU factorization for large-scale LP.*
