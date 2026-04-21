import React from "react";
import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/home-page";
import { TemplatesPage } from "./pages/templates-page";
import { InstancesPage } from "./pages/instances-page";
import { DeploymentsPage } from "./pages/deployments-page";
import { MachinesPage } from "./pages/machines-page";
import { CampaignsPage } from "./pages/campaigns-page";
import { LoginPage } from "./pages/login-page";
import { RegisterPage } from "./pages/register-page";
import { WalletPageRoute } from "./pages/wallet-page";
import { ProfilePageRoute } from "./pages/profile-page";
import { Layout } from "./components/layout";
import { RootLayout } from "./components/root-layout";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { index: true, Component: HomePage },
          { path: "templates", Component: TemplatesPage },
          { path: "marketplace", Component: InstancesPage },
          { path: "deployments", Component: DeploymentsPage },
          { path: "machines", Component: MachinesPage },
          { path: "campaigns", Component: CampaignsPage },
          { path: "wallet", Component: WalletPageRoute },
          { path: "profile", Component: ProfilePageRoute },
        ],
      },
      {
        path: "/login",
        Component: LoginPage,
      },
      {
        path: "/register",
        Component: RegisterPage,
      },
    ],
  },
]);