import Scroll3DScene from "@/components/scroll-3d-scene";

const chapters = [
  {
    id: "phase-1",
    kicker: "01 / Orbit",
    title: "Scroll drives the scene",
    copy: "The canvas behind this text is a single WebGL render loop. GSAP ScrollTrigger converts your scroll position into one number — progress from 0 to 1 — and every property you see (camera angle, ring scale, particle speed) is a function of that number plus time.",
  },
  {
    id: "phase-2",
    kicker: "02 / Twist",
    title: "Objects respond in phases",
    copy: "Each slab of the monolith rotates on its own offset — a scroll-driven twist that spreads through the stack like a signal. The rings expand and brighten as their phase threshold passes. This is the core mechanic behind every award-winning scrollytelling product page.",
  },
  {
    id: "phase-3",
    kicker: "03 / Dive",
    title: "The camera is a character",
    copy: "Scroll doesn't just move objects — it moves you. The camera dollies in toward mid-scroll and arcs around the subject, ending low and close. Combined with fog and a drifting particle field, depth does the storytelling.",
  },
  {
    id: "phase-4",
    kicker: "04 / Build",
    title: "Yours to remix",
    copy: "Swap the slab stack for a product model (GLTF), remap the palette, and this becomes a launch page. The whole scene lives in one component — scroll-3d-scene.tsx — with no external 3D assets.",
  },
];

export const metadata = {
  title: "Scroll-Driven 3D Lab | The Creative Technician",
  description: "An interactive Three.js + GSAP ScrollTrigger scrollytelling experiment: a fixed WebGL scene behind the page, driven entirely by scroll.",
};

export default function Scroll3DLabPage() {
  return (
    <main className="scroll3d-page">
      <Scroll3DScene />

      <section className="scroll3d-intro">
        <div className="site-container">
          <div className="hero-kicker">
            <span className="status-dot" />
            <span>LAB · Three.js + GSAP ScrollTrigger</span>
          </div>
          <h1 className="scroll3d-title">
            <span>Scroll telling,</span> <span className="outline-type">in three dimensions.</span>
          </h1>
          <p className="scroll3d-lede">
            A fixed WebGL scene sits behind this page. Scrolling moves the camera, twists the
            structure and drives every phase of the animation. Keep going — the scene responds
            the whole way down.
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
          <p>Built with Three.js, GSAP ScrollTrigger and zero 3D model downloads.</p>
          <a className="button button-signal" href="/">
            Back to the work
          </a>
        </div>
      </section>
    </main>
  );
}
