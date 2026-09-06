import Scroll3DNodeScene from "@/components/scroll-3d-node-scene";

const chapters = [
  {
    id: "n-phase-1",
    kicker: "01 / Trigger",
    title: "This is what an automation looks like",
    copy: "Eleven nodes on curved wires — an n8n-style flow rendered in 3D. No stock model: every node, wire and pulse is generated geometry, the same way a workflow is generated from config.",
  },
  {
    id: "n-phase-2",
    kicker: "02 / Execute",
    title: "Scroll runs the flow",
    copy: "Scroll position is the execution wavefront. As you move down the page, nodes light up in sequence, their wireframe shells spinning awake, and data pulses start traveling the wires — left to right, trigger to output.",
  },
  {
    id: "n-phase-3",
    kicker: "03 / Follow",
    title: "The camera rides the pipeline",
    copy: "You don't watch the flow from outside — the camera travels alongside it, node by node, like tracing an execution log. Speed picks up as the workflow ramps.",
  },
  {
    id: "n-phase-4",
    kicker: "04 / Overview",
    title: "Pull back and see the whole system",
    copy: "In the final stretch the camera lifts out to frame the entire pipeline — the moment every automation builder knows: the whole flow, lit end to end, doing its job without you.",
  },
];

export const metadata = {
  title: "Scroll-Driven Automation Lab | The Creative Technician",
  description: "An n8n-style node graph in 3D: scroll executes the workflow, lights nodes in sequence and sends data pulses down the wires.",
};

export default function Scroll3DNodePage() {
  return (
    <main className="scroll3d-page">
      <Scroll3DNodeScene />

      <section className="scroll3d-intro">
        <div className="site-container">
          <div className="hero-kicker">
            <span className="status-dot" />
            <span>LAB 03 · Node Graph + GSAP ScrollTrigger</span>
          </div>
          <h1 className="scroll3d-title">
            <span>The workflow,</span> <span className="outline-type">running in 3D.</span>
          </h1>
          <p className="scroll3d-lede">
            An automation flow, rebuilt as a WebGL scene. Scroll is the trigger — nodes
            execute in sequence, pulses cross the wires, and the camera rides the pipeline
            from first node to final output.
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
          <p>Eleven nodes, ten wires, zero stock models — all generated geometry.</p>
          <a className="button button-signal" href="/">
            Back to the work
          </a>
        </div>
      </section>
    </main>
  );
}
