"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import * as THREE from "three";

/**
 * Scroll-3D Automation Lab: fixed WebGL canvas behind scrollable copy.
 * Scene: an n8n-style node graph — glowing nodes on curved connection
 * wires, with data pulses traveling between them. Scroll progress lights
 * nodes up in sequence (like a flow executing) and moves the camera
 * along the pipeline. All generated geometry — no external models.
 */

type FlowNode = {
  pos: THREE.Vector3;
  size: number;
  accent: boolean; // trigger/success nodes glow magenta/teal stronger
};

export default function Scroll3DNodeScene() {
  const holderRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const holder = holderRef.current;
    if (!canvas || !holder) return;

    gsap.registerPlugin(ScrollTrigger);

    // ---------- renderer / scene ----------
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x07090d, 0.045);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);

    const accentA = new THREE.Color("#5eead4"); // teal — active
    const accentB = new THREE.Color("#f0abfc"); // magenta — triggers/highlights
    const dim = new THREE.Color("#1c2a33");

    // ---------- build the flow: a winding pipeline of nodes ----------
    // Nodes zig-zag through space like an automation workflow left-to-right.
    const nodeDefs: FlowNode[] = [];
    const N = 11;
    for (let i = 0; i < N; i++) {
      const t = i / (N - 1);
      nodeDefs.push({
        pos: new THREE.Vector3(
          (t - 0.5) * 14,
          Math.sin(t * Math.PI * 1.6 + 0.4) * 1.6,
          Math.cos(t * Math.PI * 1.2) * 2.2 - t * 2,
        ),
        size: i === 0 || i === N - 1 ? 0.42 : 0.26 + (i % 3) * 0.05,
        accent: i === 0 || i === N - 1 || i % 4 === 2,
      });
    }

    const nodes: THREE.Group[] = [];
    const nodeCores: THREE.Mesh[] = [];
    const nodeShells: THREE.Mesh[] = [];
    const nodeMatOn: THREE.MeshBasicMaterial[] = [];
    const shellMats: THREE.MeshBasicMaterial[] = [];

    const coreGeo = new THREE.IcosahedronGeometry(1, 1);
    const shellGeo = new THREE.IcosahedronGeometry(1, 1);

    nodeDefs.forEach((def) => {
      const g = new THREE.Group();
      g.position.copy(def.pos);

      const coreMat = new THREE.MeshBasicMaterial({ color: dim.clone(), transparent: true, opacity: 0.95 });
      const core = new THREE.Mesh(coreGeo, coreMat);
      core.scale.setScalar(def.size);
      g.add(core);
      nodeCores.push(core);
      nodeMatOn.push(coreMat);

      const shellMat = new THREE.MeshBasicMaterial({
        color: def.accent ? accentB : accentA,
        transparent: true,
        opacity: 0.0,
        wireframe: true,
      });
      const shell = new THREE.Mesh(shellGeo, shellMat);
      shell.scale.setScalar(def.size * 1.55);
      g.add(shell);
      nodeShells.push(shell);
      shellMats.push(shellMat);

      scene.add(g);
      nodes.push(g);
    });

    // ---------- curved wires between consecutive nodes ----------
    const wires: THREE.Line[] = [];
    const wireMats: THREE.LineBasicMaterial[] = [];
    const curves: THREE.QuadraticBezierCurve3[] = [];
    for (let i = 0; i < nodeDefs.length - 1; i++) {
      const a = nodeDefs[i].pos;
      const b = nodeDefs[i + 1].pos;
      const mid = a.clone().add(b).multiplyScalar(0.5);
      mid.y += 0.55; // bow the wire upward like n8n connections
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      curves.push(curve);

      const pts = curve.getPoints(48);
      const geo = new THREE.BufferGeometry().setFromPoints(pts);
      const mat = new THREE.LineBasicMaterial({ color: dim.clone(), transparent: true, opacity: 0.7 });
      const line = new THREE.Line(geo, mat);
      scene.add(line);
      wires.push(line);
      wireMats.push(mat);
    }

    // ---------- data pulses traveling along wires ----------
    const pulsesPerWire = 2;
    const pulseGeo = new THREE.SphereGeometry(0.05, 10, 10);
    const pulseMats: THREE.MeshBasicMaterial[] = [];
    const pulseMeshes: THREE.Mesh[] = [];
    const pulseWire: number[] = [];
    const pulseOffset: number[] = [];
    wires.forEach((_, wi) => {
      for (let k = 0; k < pulsesPerWire; k++) {
        const mat = new THREE.MeshBasicMaterial({ color: wi % 2 ? accentA : accentB, transparent: true, opacity: 0 });
        const m = new THREE.Mesh(pulseGeo, mat);
        scene.add(m);
        pulseMeshes.push(m);
        pulseMats.push(mat);
        pulseWire.push(wi);
        pulseOffset.push(k / pulsesPerWire);
      }
    });

    // ---------- ambient particle field ----------
    const pCount = 500;
    const pPos = new Float32Array(pCount * 3);
    const pSeed = new Float32Array(pCount);
    for (let i = 0; i < pCount; i++) {
      pPos[i * 3] = (Math.random() - 0.5) * 20;
      pPos[i * 3 + 1] = (Math.random() - 0.5) * 12;
      pPos[i * 3 + 2] = (Math.random() - 0.5) * 14 - 3;
      pSeed[i] = Math.random();
    }
    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
    const points = new THREE.Points(
      pGeo,
      new THREE.PointsMaterial({ color: accentA, size: 0.03, transparent: true, opacity: 0.4, sizeAttenuation: true }),
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

      // camera travels along the pipeline, ending pulled back on the whole flow
      const camT = THREE.MathUtils.clamp(p, 0, 1);
      const camIdx = camT * (nodeDefs.length - 1);
      const i0 = Math.floor(camIdx);
      const i1 = Math.min(i0 + 1, nodeDefs.length - 1);
      const frac = camIdx - i0;
      const followA = nodeDefs[i0].pos;
      const followB = nodeDefs[i1].pos;
      const camTarget = followA.clone().lerp(followB, frac);

      // ease from "riding the flow" to "overview" in the last 25%
      const overview = THREE.MathUtils.smoothstep(p, 0.75, 1);
      const ridePos = new THREE.Vector3(
        camTarget.x + Math.sin(t * 0.1) * 0.4 + 1.2,
        camTarget.y + 1.4,
        camTarget.z + 4.2,
      );
      const overPos = new THREE.Vector3(0, 2.5, 11.5);
      camera.position.copy(ridePos.lerp(overPos, overview));
      const lookA = camTarget;
      const lookB = new THREE.Vector3(0, 0, 0);
      camera.lookAt(lookA.lerp(lookB, overview));

      // nodes light up in sequence with scroll — like a flow executing
      nodeDefs.forEach((def, i) => {
        const nThresh = (i / (nodeDefs.length - 1)) * 0.82;
        const lit = THREE.MathUtils.smoothstep(p, nThresh, nThresh + 0.12);
        const idleGlow = 0.5 + 0.5 * Math.sin(t * 2 + i * 1.3);
        (nodeMatOn[i].color as THREE.Color).copy(dim).lerp(def.accent ? accentB : accentA, Math.max(lit, idleGlow * 0.18));
        shellMats[i].opacity = lit * (0.35 + idleGlow * 0.25);
        nodeShells[i].rotation.y = t * 0.4 + i;
        nodeShells[i].rotation.x = t * 0.23;
        nodes[i].position.y = def.pos.y + Math.sin(t * 1.1 + i * 0.9) * 0.06;
      });

      // wires light up ahead of the wavefront
      wires.forEach((_, wi) => {
        const wLit = THREE.MathUtils.smoothstep(p, (wi / wires.length) * 0.82, (wi / wires.length) * 0.82 + 0.12);
        (wireMats[wi].color as THREE.Color).copy(dim).lerp(accentA, wLit);
        wireMats[wi].opacity = 0.35 + wLit * 0.45;
      });

      // pulses: only run on lit wires; speed up with progress
      pulseMeshes.forEach((m, pi) => {
        const wi = pulseWire[pi];
        const wLit = THREE.MathUtils.smoothstep(p, (wi / wires.length) * 0.82, (wi / wires.length) * 0.82 + 0.12);
        const speed = 0.18 + p * 0.35;
        const u = (pulseOffset[pi] + t * speed) % 1;
        const pt = curves[wi].getPoint(u);
        m.position.copy(pt);
        (pulseMats[pi].opacity) = wLit * (0.75 + 0.25 * Math.sin(t * 6 + pi));
      });

      // ambient drift
      const pos = pGeo.attributes.position as THREE.BufferAttribute;
      for (let i = 0; i < pCount; i++) {
        let y = pos.getY(i) + 0.0015 * (0.4 + pSeed[i]);
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
        if (Array.isArray(anyObj.material)) anyObj.material.forEach((mm) => mm.dispose());
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
