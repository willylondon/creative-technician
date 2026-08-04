import { TestimonialsSection } from "@/components/blocks/testimonials-with-marquee";

const testimonials = [
  {
    author: {
      name: "Emma Thompson",
      handle: "@emmaai",
      avatar:
        "/assets/images/unsplash-imports/photo-1494790108377-be9c29b29330.webp",
    },
    text: "Using this AI platform has transformed how we handle data analysis. The speed and accuracy are unprecedented.",
    href: "https://twitter.com/emmaai",
  },
  {
    author: {
      name: "David Park",
      handle: "@davidtech",
      avatar:
        "/assets/images/unsplash-imports/photo-1507003211169-0a1dd7228f2d.webp",
    },
    text: "The API integration is flawless. We've reduced our development time by 60% since implementing this solution.",
    href: "https://twitter.com/davidtech",
  },
  {
    author: {
      name: "Sofia Rodriguez",
      handle: "@sofiaml",
      avatar:
        "/assets/images/unsplash-imports/photo-1534528741775-53994a69daeb.webp",
    },
    text: "Finally, an AI tool that actually understands context! The accuracy in natural language processing is impressive.",
  },
];

export function TestimonialsSectionDemo() {
  return (
    <TestimonialsSection
      title="Trusted by developers worldwide"
      description="Join thousands of developers who are already building the future with our AI platform"
      testimonials={testimonials}
    />
  );
}
