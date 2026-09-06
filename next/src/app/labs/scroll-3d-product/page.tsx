import Scroll3DProductScene from "@/components/scroll-3d-product-scene";

const chapters = [
  {
    id: "p-phase-1",
    kicker: "01 / Stage",
    title: "A real product model",
    copy: "This is a GLTF model loaded at runtime — the same pipeline a brand would use with their own product scan or CAD export. Studio-style lighting wraps it: white key light, teal and magenta rims pulled from the site palette.",
  },
  {
    id: "p-phase-2",
    kicker: "02 / Orbit",
    title: "Scroll turns the stage",
    copy: "The camera arcs around the product while it spins through a full showcase rotation. Mid-scroll the orbit tightens — pushing in for the detail moment — then relaxes for the hero landing.",
  },
  {
    id: "p-phase-3",
    kicker: "03 / Hero",
    title: "End on the money shot",
    copy: "The final scroll phase tilts the product into a hero pose, scales it up 15%, and settles the camera low and close — exactly the 'can assembles itself' beat from high-end launch pages. The glowing platform ring anchors the composition.",
  },
  {
    id: "p-phase-4",
    kicker: "04 / Swap",
    title: "Make it yours",
    copy: "Replace /models/water-bottle.glb with your product's GLB, edit the chapter copy, done. One component (scroll-3d-product-scene.tsx), no build steps for assets — Vercel serves the model as a static file.",
  },
];

export const metadata = {
  title: "Scroll-Driven 3D Product Lab | The Creative Technician",
  description: "A scrollytelling product page experiment: real GLTF model, Three.js and GSAP ScrollTrigger, scroll-driven camera and hero pose.",
};

export default function Scroll3DProductPage() {
  return (
    <main className="scroll3d-page">
      <Scroll3DProductScene />

      <section className="scroll3d-intro">
        <div className="site-container">
          <div className="hero-kicker">
            <span className="status-dot" />
            <span>LAB 02 · GLTF Product + GSAP ScrollTrigger</span>
          </div>
          <h1 className="scroll3d-title">
            <span>The product page,</span> <span className="outline-type">rebuilt in 3D.</span>
          </h1>
          <p className="scroll3d-lede">
            A real GLTF model on a lit stage, behind this page. Scrolling orbits the camera,
            spins the product and lands the hero shot. This is the mechanics behind every
            scroll-telling launch page — with a swappable model.
          </p>
        </div>
      </section>

      <div className="scroll3d-track">
        {chapters.map((ch) => (
          <section key={ch.id} id={ch.id} className="scroll3d-chapter">
            <div className="scroll3d-card">
              <div className="scroll3d-kicker">{ch.kicker}</div>
              <h2>{ch.title}</h2>
              <p>{ch.copy}</p>
            </div>
          </section>
        ))}
      </div>

      <section className="scroll3d-outro">
        <div className="site-container">
          <p>Model: Khronos glTF sample (CC0). Swap in any product GLB to make it yours.</p>
          <a className="button button-signal" href="/">
            Back to the work
          </a>
        </div>
      </section>
    </main>
  );
}
