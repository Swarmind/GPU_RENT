import { createBrowserRouter } from "react-router";
import { HomePage } from "./pages/home-page";
import { TemplatesPage } from "./pages/templates-page";
import { Layout } from "./components/layout";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: HomePage },
      { path: "templates", Component: TemplatesPage },
    ],
  },
]);
