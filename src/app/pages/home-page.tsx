import { Hero } from "../components/hero";
import { GpuCatalog } from "../components/gpu-catalog";
import { Features } from "../components/features";

export function HomePage() {
  return (
    <>
      <Hero />
      <GpuCatalog />
      <Features />
    </>
  );
}
