/*
 * capside-presence.js — Entidad ASCII Poliédrica / Cápside Viral Hexagonal
 * 13ghosts.io · Medusa (@agy) · Lempyra R&D LLC
 *
 * Inspiración: Cápside viral icosaédrica/hexagonal, respiración latente, destellos por aristas.
 * Paleta de K: Rojo ocre (#992615), rojo intenso/fuerte (#ff1a1a), escarlata (#d41111), rojo sangre (#5a0404).
 * Fondo: OLED negro absoluto (#000000).
 *
 * Características de rendimiento y accesibilidad:
 * - Atlas de glifos pre-renderizado en canvas auxiliar.
 * - Sin librerías externas ni dependencias.
 * - DPR limitado a max 1.5 para proteger GPU/CPU móvil.
 * - Pausa automática vía requestAnimationFrame cuando la pestaña está oculta (visibilitychange)
 *   o cuando el canvas no está visible en el viewport (IntersectionObserver).
 * - Soporte para 'prefers-reduced-motion': dibuja una cápside estática elegante sin animación.
 */
(() => {
  'use strict';

  const canvas = document.querySelector('.capside-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Paleta de K:
  // 0: Rojo sangre profundo (#5a0404)
  // 1: Rojo ocre / tierra (#992615)
  // 2: Rojo escarlata (#d41111)
  // 3: Rojo fuerte / intenso (#ff1a1a)
  // 4: Brasa viva / fósforo (#ff4433)
  const colors = ['#5a0404', '#992615', '#d41111', '#ff1a1a', '#ff4433'];

  // Caracteres ASCII esotéricos y técnicos
  const chars = '01{}<>[]/\\+=*#%@:.-†‡§ΔΞ';
  const cell = 36;
  const cols = 16;
  const atlas = document.createElement('canvas');
  atlas.width = cols * cell;
  atlas.height = Math.ceil(chars.length * colors.length / cols) * cell;

  const ink = atlas.getContext('2d');
  if (!ink) return;

  const buildAtlas = () => {
    ink.clearRect(0, 0, atlas.width, atlas.height);
    ink.font = '600 24px PresenceMono, "Orbitron", monospace';
    ink.textAlign = 'center';
    ink.textBaseline = 'middle';
    colors.forEach((color, c) => {
      ink.fillStyle = color;
      for (let g = 0; g < chars.length; g++) {
        const i = c * chars.length + g;
        ink.fillText(chars[g], (i % cols + 0.5) * cell, (Math.floor(i / cols) + 0.5) * cell);
      }
    });
  };

  // Construcción de la geometría de la cápside:
  // Vértices icosaédricos / poliedro truncado (inspiración artística, no modelo biológico)
  // 12 vértices primarios de icosaedro:
  const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio ~1.618
  const baseVertices = [
    [-1,  phi,  0], [ 1,  phi,  0], [-1, -phi,  0], [ 1, -phi,  0],
    [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
    [ phi,  0, -1], [ phi,  0,  1], [-phi,  0, -1], [-phi,  0,  1]
  ];

  // Normalizar vértices a esfera unitaria
  const normalize = (v) => {
    const len = Math.hypot(v[0], v[1], v[2]);
    return [v[0] / len, v[1] / len, v[2] / len];
  };

  const icosaVertices = baseVertices.map(normalize);

  // Caras triangulares del icosaedro (20 triángulos)
  const icosaFaces = [
    [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
    [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
    [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
    [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
  ];

  // Generamos una malla densa de hexágonos y pentágonos sobre la cápside:
  // En cada cara triangular, subdividimos en una celosía hexagonal/triangular
  const points = [];
  const edges = [];
  const triangles = [];
  const edgeSet = new Set();

  const addEdge = (p1, p2) => {
    const key = p1 < p2 ? `${p1}-${p2}` : `${p2}-${p1}`;
    if (!edgeSet.has(key)) {
      edgeSet.add(key);
      edges.push([p1, p2]);
    }
  };

  // Subdivisión de icosaedro con puntos en caras
  const N = 5; // Frecuencia de subdivisión para aspecto hexagonal denso
  let pointIndex = 0;
  const vertMap = new Map();

  const getOrAddPoint = (v, faceIdx) => {
    const norm = normalize(v);
    const key = `${norm[0].toFixed(3)},${norm[1].toFixed(3)},${norm[2].toFixed(3)}`;
    if (vertMap.has(key)) {
      return vertMap.get(key);
    }
    const idx = pointIndex++;
    vertMap.set(key, idx);

    // Asignar parámetros visuales a este vértice
    const theta = Math.atan2(norm[2], norm[0]);
    const pPhi = Math.acos(Math.max(-1, Math.min(1, norm[1])));
    points.push({
      x: norm[0],
      y: norm[1],
      z: norm[2],
      theta,
      phi: pPhi,
      glyph: (idx * 5 + faceIdx * 3) % chars.length,
      phase: idx * 0.41,
      color: (idx % 7 === 0) ? 3 : (idx % 3 === 0) ? 2 : (idx % 2 === 0) ? 1 : 0
    });
    return idx;
  };

  icosaFaces.forEach((face, fIdx) => {
    const [iA, iB, iC] = face;
    const vA = icosaVertices[iA];
    const vB = icosaVertices[iB];
    const vC = icosaVertices[iC];

    const grid = [];
    for (let i = 0; i <= N; i++) {
      grid[i] = [];
      for (let j = 0; j <= N - i; j++) {
        const k = N - i - j;
        const wA = i / N;
        const wB = j / N;
        const wC = k / N;
        const interp = [
          vA[0] * wA + vB[0] * wB + vC[0] * wC,
          vA[1] * wA + vB[1] * wB + vC[1] * wC,
          vA[2] * wA + vB[2] * wB + vC[2] * wC
        ];
        grid[i][j] = getOrAddPoint(interp, fIdx);
      }
    }

    // Capture the base faces so refinement can be spread evenly over the sphere.
    for (let i = 0; i < N; i++) {
      for (let j = 0; j < N - i; j++) {
        triangles.push([grid[i][j], grid[i + 1][j], grid[i][j + 1]]);
        if (j < N - i - 1) triangles.push([grid[i + 1][j], grid[i + 1][j + 1], grid[i][j + 1]]);
      }
    }

    // Aristas hexagonales/triangulares
    for (let i = 0; i <= N; i++) {
      for (let j = 0; j <= N - i; j++) {
        const curr = grid[i][j];
        if (i + 1 <= N && grid[i + 1][j] !== undefined) addEdge(curr, grid[i + 1][j]);
        if (j + 1 <= N - i && grid[i][j + 1] !== undefined) addEdge(curr, grid[i][j + 1]);
        if (i > 0 && j + 1 <= N - (i - 1) && grid[i - 1][j + 1] !== undefined) addEdge(curr, grid[i - 1][j + 1]);
      }
    }
  });

  // Add one centroid per selected face. Each adds one glyph and three links.
  // The N=5 sphere has 252 nodes / 750 links: +63 / +189 = +25% / +25.2%.
  const extraNodes = Math.round(points.length * 0.25);
  for (let k = 0; k < extraNodes; k++) {
    const faceIndex = Math.floor((k + 0.5) * triangles.length / extraNodes);
    const face = triangles[faceIndex];
    const center = [0, 0, 0];
    for (const index of face) {
      center[0] += points[index].x;
      center[1] += points[index].y;
      center[2] += points[index].z;
    }
    const index = getOrAddPoint(center, faceIndex);
    for (const corner of face) addEdge(index, corner);
  }

  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  let size = 0;
  let elapsed = 0;
  let previous = null;
  let last = -Infinity;
  let raf = 0;
  let visible = true;

  // Rotación suave del poliedro 3D
  const rotateY = (v, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0] * cos + v[2] * sin, v[1], -v[0] * sin + v[2] * cos];
  };

  const rotateX = (v, angle) => {
    const cos = Math.cos(angle);
    const sin = Math.sin(angle);
    return [v[0], v[1] * cos - v[2] * sin, v[1] * sin + v[2] * cos];
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, size, size);

    // Respiración latente rítmica (pulso sutil como organismo esperando)
    const breathRate = 0.7;
    const breath = 1.0 + 0.045 * Math.sin(t * breathRate);

    // Ángulos de rotación axial (inclinación de cápside geométrica)
    const rotY = t * 0.22;
    const rotX = 0.42 + 0.08 * Math.sin(t * 0.15);

    // Proyección de vértices
    const projected = [];
    const rad = size * 0.38 * breath;

    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      let v = [p.x, p.y, p.z];
      v = rotateX(v, rotX);
      v = rotateY(v, rotY);

      // Perspectiva suave
      const dist = 3.2;
      const fov = 2.4;
      const zNorm = v[2]; // -1..+1
      const scale = fov / (dist - zNorm);

      const px = size / 2 + v[0] * rad * scale;
      const py = size / 2 + v[1] * rad * scale;
      const front = (zNorm + 1.0) / 2.0; // 0 (detrás) a 1 (frente)

      projected.push({
        x: px,
        y: py,
        z: zNorm,
        front,
        glyph: p.glyph,
        phase: p.phase,
        baseColor: p.color
      });
    }

    // Dibujado de aristas poliédricas (esqueleto hexagonal de la cápside)
    ctx.lineWidth = 0.9;
    for (let i = 0; i < edges.length; i++) {
      const [i1, i2] = edges[i];
      const p1 = projected[i1];
      const p2 = projected[i2];

      const minZ = Math.min(p1.z, p2.z);
      if (minZ < -0.65) continue; // Ocultar aristas posteriores profundas para mantener claridad

      const avgFront = (p1.front + p2.front) / 2;

      // Destello que viaja por las aristas
      const flare = Math.sin((p1.x + p2.y) * 0.02 + t * 2.0);
      const isFlare = flare > 0.88;

      ctx.strokeStyle = isFlare ? colors[3] : colors[1];
      ctx.globalAlpha = isFlare
        ? Math.min(0.85, 0.3 + 0.6 * avgFront)
        : (0.04 + 0.22 * avgFront);

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.stroke();
    }

    // Dibujado de glifos ASCII en los nodos del poliedro
    // Ordenamos por Z para que los frontales se dibujen encima limpiamente
    const order = projected.map((p, idx) => idx).sort((a, b) => projected[a].z - projected[b].z);

    for (let k = 0; k < order.length; k++) {
      const idx = order[k];
      const p = projected[idx];
      const front = p.front;

      // Cálculo de luminosidad y coloración
      // Pulso por faceta y brillo angular
      const wave = Math.sin(t * 1.2 + p.phase);
      let colorIndex = p.baseColor;

      // Destellos en vértices frontales
      if (front > 0.72 && wave > 0.6) {
        colorIndex = 3; // Rojo fuerte / intenso
      } else if (front > 0.88 && wave > 0.85) {
        colorIndex = 4; // Fósforo vivo
      }

      const glyph = (p.glyph + Math.floor(t * 0.2 + p.phase)) % chars.length;
      const atlasIndex = colorIndex * chars.length + glyph;

      // Alpha y tamaño dependientes de profundidad (Z)
      ctx.globalAlpha = 0.12 + 0.84 * Math.pow(front, 1.8);
      const glyphSize = 0.75 * Math.max(9, Math.round(size * (0.022 + 0.016 * front)));

      ctx.drawImage(
        atlas,
        (atlasIndex % cols) * cell,
        Math.floor(atlasIndex / cols) * cell,
        cell,
        cell,
        Math.round(p.x - glyphSize / 2),
        Math.round(p.y - glyphSize / 2),
        glyphSize,
        glyphSize
      );
    }

    ctx.globalAlpha = 1.0;
  };

  const tick = (now) => {
    raf = 0;
    if (document.hidden || !visible || motion.matches) return;
    if (previous !== null) {
      elapsed += Math.min(now - previous, 100) / 1000;
    }
    previous = now;

    if (now - last >= 1000 / 60 - 1) {
      draw(elapsed);
      last = now;
    }
    raf = requestAnimationFrame(tick);
  };

  const sync = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    previous = null;
    if (motion.matches) {
      draw(0.5); // Renderizado estático en reposo para reduced motion
    } else if (visible && !document.hidden) {
      raf = requestAnimationFrame(tick);
    }
  };

  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    size = rect.width;
    if (!size) return;

    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.floor(size * dpr);
    canvas.height = Math.floor(size * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    draw(elapsed);
  };

  buildAtlas();
  resize();
  sync();

  new ResizeObserver(resize).observe(canvas);
  new IntersectionObserver((entries) => {
    visible = entries[0].isIntersecting;
    sync();
  }).observe(canvas);

  document.addEventListener('visibilitychange', sync);
  motion.addEventListener('change', sync);

  if (document.fonts) {
    document.fonts.ready.then(() => {
      buildAtlas();
      draw(elapsed);
    });
  }
})();
