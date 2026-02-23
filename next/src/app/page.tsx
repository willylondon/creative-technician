import AnimatedTextCycle from "@/components/ui/animated-text-cycle";
import { GlowingEffectDemo } from "@/components/ui/demo";
import { TestimonialsSection } from "@/components/ui/testimonials-with-marquee";

const testimonials = [
  {
    author: {
      name: "Emma Thompson",
      handle: "@emmaai",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face",
    },
    text: "Using this AI platform has transformed how we handle data analysis. The speed and accuracy are unprecedented.",
    href: "https://twitter.com/emmaai",
  },
  {
    author: {
      name: "David Park",
      handle: "@davidtech",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    text: "The API integration is flawless. We've reduced our development time by 60% since implementing this solution.",
    href: "https://twitter.com/davidtech",
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiaml",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    text: "Finally, an AI tool that actually understands context! The accuracy in natural language processing is impressive.",
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <section className="px-6 py-20 sm:py-28">
        <div className="mx-auto max-w-5xl">
          <p className="mb-4 text-xs uppercase tracking-[0.25em] text-muted-foreground">
            Creative Technician
          </p>
          <h1 className="text-4xl leading-tight font-semibold tracking-tight sm:text-6xl">
            Your{" "}
            <AnimatedTextCycle
              words={[
                "business",
                "team",
                "workflow",
                "productivity",
                "projects",
                "analytics",
                "dashboard",
                "platform",
              ]}
              interval={3000}
              className="text-foreground"
            />{" "}
            deserves better tools
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
            New React migration target with shadcn components. This page now
            runs your animated text cycle, glowing cards, and marquee
            testimonials.
          </p>
        </div>
      </section>

      <section className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <GlowingEffectDemo />
        </div>
      </section>

      <TestimonialsSection
        title="Trusted by developers worldwide"
        description="Join thousands of developers already building faster with practical AI systems."
        testimonials={testimonials}
      />
    </main>
  );
}
