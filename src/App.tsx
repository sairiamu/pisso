import { COLORS } from "./CONSTANTS/colors";
import { CanvasShell } from "./canvas/CanvasShell";

function App() {
  return (
    <main style={{
      backgroundColor: COLORS.GRAPHITE_900,
      height: "100vh",
      width: "100vw",
      display: "flex",
      flexDirection: "column",
      padding: "20px",
      boxSizing: "border-box",
      margin: 0
    }}>
      <h1 style={{
        color: COLORS.WARM_WHITE,
        margin: "0 0 20px 0",
        fontFamily: "Inter, sans-serif"
      }}>
        Pissow Workbench
      </h1>

      <div style={{ flex: 1, width: "100%", minHeight: 0 }}>
        <CanvasShell />
      </div>
    </main>
  );
}

export default App;
