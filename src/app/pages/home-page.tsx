import { Hero } from "../components/hero";
import { PlatformOverview } from "../components/platform-overview";
import { GpuCatalog } from "../components/gpu-catalog";
import { Features } from "../components/features";

export function HomePage() {
  return (
    <>
      <Hero />
      <PlatformOverview />
      <GpuCatalog />
      <Features />
    </>
  );
}