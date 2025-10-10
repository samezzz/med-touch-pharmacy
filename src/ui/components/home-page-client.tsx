"use client";

import dynamic from "next/dynamic";

const LightRays = dynamic(() => import("@/ui/components/light-rays"), {
  ssr: false,
  loading: () => null,
});

const TestimonialsSection = dynamic(
  () =>
    import("@/ui/components/testimonials/testimonials-with-marquee").then(
      (m) => m.TestimonialsSection,
    ),
  { ssr: false, loading: () => null },
);

export { LightRays, TestimonialsSection };
