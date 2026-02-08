import { RouterProvider } from "react-router";
import { router } from "./routes";
import { Web3Provider } from "./hooks/useWeb3";

export default function App() {
  return (
    <Web3Provider>
      <RouterProvider router={router} />
    </Web3Provider>
  );
}