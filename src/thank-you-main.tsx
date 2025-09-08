import { createRoot } from "react-dom/client";
import { I18nProvider } from "./i18n/I18nContext";
import "./index.css";
import ThankYou from "./pages/ThankYou";

const container = document.getElementById("root");
if (!container) throw new Error("Failed to find the root element");

const root = createRoot(container);
root.render(
  <I18nProvider>
    <ThankYou />
  </I18nProvider>,
);
