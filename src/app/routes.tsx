import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/home-page";
import { TemplatesPage } from "./pages/templates-page";
import { InstancesPage } from "./pages/instances-page";
import { MachinesPage } from "./pages/machines-page";
import { CampaignsPage } from "./pages/campaigns-page";
import { Layout } from "./components/layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "templates", Component: TemplatesPage },
      { path: "instances", Component: InstancesPage },
      { path: "machines", Component: MachinesPage },
      { path: "campaigns", Component: CampaignsPage },
    ],
  },
]);