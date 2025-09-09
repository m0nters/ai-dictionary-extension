import { createRoot } from "react-dom/client";
import "./config/i18n"; // Initialize i18n
import "./index.css";
import ThankYou from "./pages/ThankYou";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);
root.render(<ThankYou />);
