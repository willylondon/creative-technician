"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

/**
 * Scroll-3D Product Lab: fixed WebGL canvas behind scrollable copy.
 * A real GLTF product model replaces generated geometry. Scroll drives
 * camera arc, product spin/unbox phases, ring pulses and particle drift.
 * Model: Khronos sample "WaterBottle" (CC0), served from /models/.
 */

export default function Scroll3DProductScene() {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const loadStateRef = useRef<{ model: THREE.Group | null; ready: boolean }>({
    model: null,
    ready: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const holder = holderRef.current;
    if (!canvas || !holder) return;

    gsap.registerPlugin(ScrollTrigger);

    // ---------- renderer / scene ----------
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090d, 0.05);

    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.set(0, 0, 7);

    // ---------- lights (studio-ish) ----------
    scene.add(new THREE.AmbientLight(0xffffff, 0.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 5);
    scene.add(key);
    const rimA = new THREE.DirectionalLight(0x5eead4, 1.6); // teal rim
    rimA.position.set(-6, 2, -4);
    scene.add(rimA);
    const rimB = new THREE.DirectionalLight(0xf0abfc, 1.2); // magenta rim
    rimB.position.set(6, -2, -5);
    scene.add(rimB);

    const accentA = new THREE.Color("#5eead4");
    const accentB = new THREE.Color("#f0abfc");

    // ---------- load GLTF product ----------
    const loader = new GLTFLoader();
    loader.load(
      "/models/water-bottle.glb",
      (gltf) => {
        const model = gltf.scene;
        // normalize scale + center
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());
        const target = 3.2; // world units tall
        const s = target / Math.max(size.x, size.y, size.z);
        model.scale.setScalar(s);
        model.position.sub(center.multiplyScalar(s));
        // gentle float pivot
        const pivot = new THREE.Group();
        pivot.add(model);
        scene.add(pivot);
        loadStateRef.current = { model: pivot, ready: true };
      },
      undefined,
      (err) => console.error("GLTF load failed", err),
    );

    // ---------- platform disc under product ----------
    const disc = new THREE.Mesh(
      new THREE.CylinderGeometry(2.1, 2.3, 0.12, 64),
      new THREE.MeshStandardMaterial({ color: 0x0d141a, roughness: 0.4, metalness: 0.6 }),
    );
    disc.position.y = -1.9;
    scene.add(disc);
    const discEdge = new THREE.Mesh(
      new THREE.TorusGeometry(2.2, 0.02, 12, 96),
      new THREE.MeshBasicMaterial({ color: accentA, transparent: true, opacity: 0.8 }),
    );
    discEdge.rotation.x = Math.PI / 2;
    discEdge.position.y = -1.83;
    scene.add(discEdge);

    // ---------- halo rings ----------
    const rings: THREE.Line[] = [];
    for (let i = 0; i < 3; i++) {
      const pts: THREE.Vector3[] = [];
      const seg = 128;
      for (let s = 0; s <= seg; s++) {
        const a = (s / seg) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * (2.8 + i * 0.9), 0, Math.sin(a) * (2.8 + i * 0.9)));
      }
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const ring = new THREE.Line(
        geo,
        new THREE.LineBasicMaterial({ color: i === 1 ? accentB : accentA, transparent: true, opacity: 0.3 }),
      );
      ring.rotation.x = Math.PI / 2 + i * 0.18;
      scene.add(ring);
      rings.push(ring);
    }

    // ---------- particle field ----------
    const pCount = 700;
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
      new THREE.PointsMaterial({ color: accentA, size: 0.03, transparent: true, opacity: 0.55, sizeAttenuation: true }),
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
      const { model } = loadStateRef.current;

      // camera: slow arc + push-in toward the product, ends low/hero
      const theta = THREE.MathUtils.lerp(-0.45, 0.6, p) + Math.sin(t * 0.1) * 0.03;
      const radius = THREE.MathUtils.lerp(8.5, 5.6, Math.sin(p * Math.PI));
      camera.position.x = Math.sin(theta) * radius;
      camera.position.z = Math.cos(theta) * radius;
      camera.position.y = THREE.MathUtils.lerp(1.2, -0.4, p);
      camera.lookAt(0, THREE.MathUtils.lerp(0, -0.3, p), 0);

      if (model) {
        // phase 0→0.5: showcase spin; 0.5→1: tilt into hero pose + float
        model.rotation.y = t * 0.25 + p * Math.PI * 2.2;
        model.rotation.z = Math.sin(p * Math.PI) * 0.18;
        model.position.y = Math.sin(t * 1.1) * 0.08 * (0.4 + p);
        const heroScale = 1 + p * 0.15;
        model.scale.setScalar(heroScale);
      }

      rings.forEach((ring, i) => {
        ring.rotation.z = t * (0.05 + i * 0.025) * (1 - p * 0.6);
        (ring.material as THREE.LineBasicMaterial).opacity = 0.14 + Math.sin(p * Math.PI) * 0.3;
      });
      discEdge.rotation.z = t * 0.2 + p * Math.PI;

      const pos = pGeo.attributes.position as THREE.BufferAttribute;
      const drift = 0.002 + p * 0.005;
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
    };
  }, [holderRef, canvasRef]);

  return (
    <div ref={holderRef} className="scroll3d-holder">
      <canvas ref={canvasRef} className="scroll3d-canvas" aria-hidden="true" />
    </div>
  );
}
