"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// tiny helper: mesh with a preset scale
function MeshScaled(geo: THREE.BufferGeometry, mat: THREE.Material, scale: number) {
  const m = new THREE.Mesh(geo, mat);
  m.scale.setScalar(scale);
  return m;
}

/**
 * HeroNodeField — ambient n8n-style node graph for the homepage hero.
 * Sits absolutely inside .hero-section, behind the copy. A slow execution
 * loop pulses through the nodes continuously (no scroll coupling).
 * Pauses when the hero is off-screen; disabled for reduced-motion.
 */

export default function HeroNodeField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = canvas?.closest(".hero-section") as HTMLElement | null;
    if (!canvas || !section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(1.2, 0.9, 7.5);
    camera.lookAt(-0.5, 0, 0);

    const accentA = new THREE.Color("#5eead4");
    const accentB = new THREE.Color("#7ee8ef"); // hero cyan (matches --cyan)
    const dim = new THREE.Color("#15222a");

    // --- flow nodes, biased to the right side of the hero (copy is left) ---
    const N = 9;
    const nodeDefs = [] as { pos: THREE.Vector3; size: number; accent: boolean }[];
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      nodeDefs.push({
        pos: new THREE.Vector3(
          (t - 0.5) * 13 + 1.5, // shifted right so the left copy column stays clean
          Math.sin(t * Math.PI * 1.5 + 0.3) * 1.5,
          Math.cos(t * Math.PI * 1.1) * 1.8 - 1,
        ),
        size: i === 0 || i === N - 1 ? 0.34 : 0.2 + (i % 3) * 0.04,
        accent: i === 0 || i === N - 1,
      });
    }

    const coreGeo = new THREE.IcosahedronGeometry(1, 1);
    const shellGeo = new THREE.IcosahedronGeometry(1, 1);
    const coreMats: THREE.MeshBasicMaterial[] = [];
    const shellMats: THREE.MeshBasicMaterial[] = [];
    const groups: THREE.Group[] = [];
    const shells: THREE.Mesh[] = [];

    nodeDefs.forEach((def) => {
      const g = new THREE.Group();
      g.position.copy(def.pos);
      const cm = new THREE.MeshBasicMaterial({ color: dim.clone(), transparent: true, opacity: 0.9 });
      const core = new THREE.Mesh(coreGeo, cm);
      core.scale.setScalar(def.size);
      g.add(core);
      const sm = new THREE.MeshBasicMaterial({
        color: def.accent ? accentB : accentA,
        transparent: true,
        opacity: 0,
        wireframe: true,
      });
      const shell = MeshScaled(shellGeo, sm, def.size * 1.5);
      g.add(shell);
      shells.push(shell);
      scene.add(g);
      groups.push(g);
      coreMats.push(cm);
      shellMats.push(sm);
    });

    // wires
    const curves: THREE.QuadraticBezierCurve3[] = [];
    const wireMats: THREE.LineBasicMaterial[] = [];
    for (let i = 0; i < nodeDefs.length - 1; i++) {
      const a = nodeDefs[i].pos;
      const b = nodeDefs[i + 1].pos;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += 0.5;
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      curves.push(curve);
      const geo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(40));
      const mat = new THREE.LineBasicMaterial({ color: dim.clone(), transparent: true, opacity: 0.5 });
      scene.add(new THREE.Line(geo, mat));
      wireMats.push(mat);
    }
    const wiresArr = wireMats;

    // pulses
    const pulseGeo = new THREE.SphereGeometry(0.045, 8, 8);
    const pulseMats: THREE.MeshBasicMaterial[] = [];
    const pulses: { mesh: THREE.Mesh; wire: number; offset: number }[] = [];
    curves.forEach((_, wi) => {
      const mat = new THREE.MeshBasicMaterial({ color: wi % 2 ? accentA : accentB, transparent: true, opacity: 0 });
      const m = new THREE.Mesh(pulseGeo, mat);
      scene.add(m);
      pulseMats.push(mat);
      pulses.push({ mesh: m, wire: wi, offset: Math.random() });
    });

    // resize to hero section box
    const resize = () => {
      const w = section.clientWidth;
      const h = section.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(section);

    // pause when hero off-screen
    let visible = true;
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; }, { threshold: 0.02 });
    io.observe(section);

    // ambient execution loop: wavefront sweeps the flow, then rests and repeats
    let raf = 0;
    const clock = new THREE.Clock();
    const CYCLE = 14; // seconds per full sweep
    const render = () => {
      raf = requestAnimationFrame(render);
      if (!visible) return;
      const t = clock.getElapsedTime();
      const cycleT = (t % CYCLE) / CYCLE;
      // wavefront position 0..1.15 (with rest at the end of each cycle)
      const wave = Math.min(cycleT / 0.8, 1.15);

      camera.position.x = 1.2 + Math.sin(t * 0.09) * 0.35;
      camera.position.y = 0.9 + Math.sin(t * 0.13) * 0.22;
      camera.lookAt(-0.5, 0, 0);

      nodeDefs.forEach((def, i) => {
        const nPos = i / (nodeDefs.length - 1);
        const lit = THREE.MathUtils.smoothstep(wave, nPos, nPos + 0.18);
        const fade = THREE.MathUtils.smoothstep(1.08, 1.02, wave) * 0 + (wave > nPos + 0.7 ? THREE.MathUtils.clamp(1 - (wave - (nPos + 0.7)) * 3, 0, 1) : 1);
        const glow = lit * fade;
        const idle = 0.5 + 0.5 * Math.sin(t * 1.6 + i * 1.2);
        (coreMats[i].color as THREE.Color).copy(dim).lerp(def.accent ? accentB : accentA, Math.max(glow * 0.9, idle * 0.15));
        shellMats[i].opacity = glow * (0.3 + idle * 0.2);
        shells[i].rotation.y = t * 0.35 + i;
        groups[i].position.y = def.pos.y + Math.sin(t * 1.0 + i * 0.8) * 0.05;
      });

      wiresArr.forEach((_, wi) => {
        const wPos = wi / wiresArr.length;
        const lit = THREE.MathUtils.smoothstep(wave, wPos, wPos + 0.15);
        const fade = wave > wPos + 0.75 ? THREE.MathUtils.clamp(1 - (wave - (wPos + 0.75)) * 3, 0, 1) : 1;
        (wireMats[wi].color as THREE.Color).copy(dim).lerp(accentA, lit * fade);
        wireMats[wi].opacity = 0.3 + lit * fade * 0.4;
      });

      pulses.forEach((p, pi) => {
        const wPos = p.wire / wiresArr.length;
        const lit = THREE.MathUtils.smoothstep(wave, wPos, wPos + 0.15) * (wave > wPos + 0.75 ? THREE.MathUtils.clamp(1 - (wave - (wPos + 0.75)) * 3, 0, 1) : 1);
        const u = (p.offset + t * 0.22) % 1;
        p.mesh.position.copy(curves[p.wire].getPoint(u));
        pulseMats[pi].opacity = lit * 0.8;
      });

      renderer.render(scene, camera);
    };
    raf = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      renderer.dispose();
      coreGeo.dispose();
      shellGeo.dispose();
      pulseGeo.dispose();
      scene.traverse((obj) => {
        const o = obj as THREE.Mesh & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
        if (o.geometry && o.geometry !== coreGeo && o.geometry !== shellGeo && o.geometry !== pulseGeo) o.geometry.dispose?.();
      });
    };
  }, []);

  return <canvas ref={canvasRef} className="hero-node-field" aria-hidden="true" />;
}
