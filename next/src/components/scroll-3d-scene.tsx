"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

/**
 * Scroll-3D lab: a fixed Three.js canvas behind scrollable copy.
 * Scroll progress (GSAP ScrollTrigger) drives camera position and
 * object phases — monolith rotation, ring expansion, particle drift.
 */

type Phase = { at: number };

const PHASES: Phase[] = [{ at: 0 }, { at: 0.33 }, { at: 0.66 }, { at: 1 }];

export default function Scroll3DScene() {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canvas = canvasRef.current;
    const holder = holderRef.current;
    if (!canvas || !holder) return;

    gsap.registerPlugin(ScrollTrigger);

    // ---------- renderer / scene ----------
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090d, 0.055);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    // ---------- palette (matches site accents) ----------
    const accentA = new THREE.Color("#5eead4"); // teal signal
    const accentB = new THREE.Color("#f0abfc"); // magenta wire
    const dim = new THREE.Color("#22303a");

    // ---------- monolith: layered wireframe slab stack ----------
    const monolith = new THREE.Group();
    const slabCount = 9;
    const slabs: THREE.Mesh[] = [];
    const slabGeo = new THREE.BoxGeometry(2.4, 0.34, 1.5);
    for (let i = 0; i < slabCount; i++) {
      const edge = new THREE.EdgesGeometry(slabGeo);
      const mat = new THREE.LineBasicMaterial({
        color: i % 2 === 0 ? accentA : dim,
        transparent: true,
        opacity: 0.9,
      });
      const slab = new THREE.LineSegments(edge, mat);
      slab.position.y = (i - (slabCount - 1) / 2) * 0.62;
      monolith.add(slab);
      slabs.push(slab as unknown as THREE.Mesh);
    }
    monolith.position.set(0, 0, 0);
    scene.add(monolith);

    // ---------- orbit rings ----------
    const rings: THREE.Line[] = [];
    for (let i = 0; i < 3; i++) {
      const pts: THREE.Vector3[] = [];
      const seg = 128;
      for (let s = 0; s <= seg; s++) {
        const a = (s / seg) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * (2.4 + i * 0.8), 0, Math.sin(a) * (2.4 + i * 0.8)));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const ring = new THREE.Line(geo, new THREE.LineBasicMaterial({ color: accentB, transparent: true, opacity: 0.35 }));
      ring.rotation.x = Math.PI / 2 + i * 0.22;
      scene.add(ring);
      rings.push(ring);
    }

    // ---------- particle field ----------
    const pCount = 900;
    const pPos = new Float32Array(pCount * 3);
    const pSeed = new Float32Array(pCount);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 18;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 2;
      pSeed[i] = Math.random();
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const points = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: accentA, size: 0.035, transparent: true, opacity: 0.7, sizeAttenuation: true }),
    );
    scene.add(points);

    // ---------- scroll → progress ----------
    const st = ScrollTrigger.create({
      trigger: holder,
      start: "top top",
      end: "bottom bottom",
      scrub: true,
      onUpdate: (self) => {
        progressRef.current = self.progress;
      },
    });

    // ---------- resize ----------
    const resize = () => {
      const w = holder.clientWidth;
      const h = holder.clientHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    resize();
    window.addEventListener("resize", resize);

    // ---------- render loop ----------
    let raf = 0;
    const clock = new THREE.Clock();
    const render = () => {
      const t = clock.getElapsedTime();
      const p = progressRef.current;

      // camera: dolly + arc across scroll progress
      const theta = THREE.MathUtils.lerp(-0.5, 0.55, p) + Math.sin(t * 0.12) * 0.04;
      const radius = THREE.MathUtils.lerp(8.2, 5.2, Math.sin(p * Math.PI));
      camera.position.x = Math.sin(theta) * radius;
      camera.position.z = Math.cos(theta) * radius;
      camera.position.y = THREE.MathUtils.lerp(1.4, -0.6, p);
      camera.lookAt(0, THREE.MathUtils.lerp(0.2, -0.1, p), 0);

      // monolith: slow idle spin + scroll-driven twist per slab
      monolith.rotation.y = t * 0.12 + p * Math.PI * 1.5;
      slabs.forEach((slab, i) => {
        const k = i / slabs.length;
        slab.rotation.y = p * Math.PI * 2 * (k - 0.5);
        const scalePulse = 1 + Math.sin(t * 1.4 + k * 6) * 0.03;
        slab.scale.setScalar(scalePulse);
      });

      // rings expand + tilt as you scroll through phases
      rings.forEach((ring, i) => {
        const phaseMix = THREE.MathUtils.smoothstep(p, PHASES[i]?.at ?? 0, (PHASES[i]?.at ?? 0) + 0.4);
        ring.rotation.z = t * (0.06 + i * 0.03) * (1 - p);
        ring.scale.setScalar(1 + phaseMix * (0.25 + i * 0.15));
        (ring.material as THREE.LineBasicMaterial).opacity = 0.18 + phaseMix * 0.35;
      });

      // particles drift upward, faster later in the scroll
      const pos = pGeo.attributes.position as THREE.BufferAttribute;
      const drift = 0.002 + p * 0.006;
      for (let i = 0; i < pCount; i++) {
        let y = pos.getY(i) + drift * (0.4 + pSeed[i]);
        if (y > 6) y = -6;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);

    const cleanupFns: Array<() => void> = [];
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      st.kill();
      gsap.ticker.remove(ScrollTrigger.update);
      renderer.dispose();
      scene.traverse((obj) => {
        const anyObj = obj as THREE.Mesh & { geometry?: THREE.BufferGeometry; material?: THREE.Material | THREE.Material[] };
        anyObj.geometry?.dispose?.();
        if (Array.isArray(anyObj.material)) anyObj.material.forEach((m) => m.dispose());
        else anyObj.material?.dispose?.();
      });
      cleanupFns.forEach((fn) => fn());
      void reduceMotion;
    };
  }, [holderRef, canvasRef]);

  return (
    <div ref={holderRef} className="scroll3d-holder">
      <canvas ref={canvasRef} className="scroll3d-canvas" aria-hidden="true" />
    </div>
  );
}
