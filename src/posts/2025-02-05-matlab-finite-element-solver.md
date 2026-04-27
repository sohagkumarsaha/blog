---
layout: base.njk
title: "MATLAB Finite Element Solver"
description: "A minimal MATLAB finite element solver for a one-dimensional bar problem."
date: 2025-02-05
category: code
tags:
  - matlab
  - code
---

This MATLAB example solves a simple one-dimensional axial bar using linear finite elements.

```matlab
% One-dimensional finite element solver for an axial bar
clear; clc;

E = 210e9;        % Young's modulus (Pa)
A = 0.01;         % Cross-sectional area (m^2)
L = 2.0;          % Bar length (m)
numElements = 4;
numNodes = numElements + 1;

nodeX = linspace(0, L, numNodes);
K = zeros(numNodes, numNodes);
F = zeros(numNodes, 1);

for e = 1:numElements
    x1 = nodeX(e);
    x2 = nodeX(e + 1);
    le = x2 - x1;
    ke = (E * A / le) * [1 -1; -1 1];
    indices = [e, e + 1];
    K(indices, indices) = K(indices, indices) + ke;
end

F(end) = 1000;        % Applied end load (N)
fixedDof = 1;         % Left end fixed
freeDofs = setdiff(1:numNodes, fixedDof);

displacement = zeros(numNodes, 1);
displacement(freeDofs) = K(freeDofs, freeDofs) \ F(freeDofs);

reaction = K * displacement - F;

disp('Nodal displacement:');
disp(displacement);
fprintf('Reaction at fixed end: %.2f N\n', reaction(fixedDof));
```

The global stiffness matrix is assembled element by element, boundary conditions are applied, and unknown displacements are solved from the reduced linear system.
