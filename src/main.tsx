import ReactDOM from "react-dom/client";
import App from "./App";
import { SimulationProvider } from "./simulator/SimulationContext";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <SimulationProvider>
    <App />
  </SimulationProvider>
);
