import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { BackgroundShell } from "./components/background-shell.tsx";

createRoot(document.getElementById("root")!).render(
  <BackgroundShell contentClassName="relative z-10 min-h-svh">
    <App />
  </BackgroundShell>,
);
