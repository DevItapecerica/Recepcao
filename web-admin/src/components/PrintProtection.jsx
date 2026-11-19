
import { useEffect } from "react";

export default function PrintProtection() {
  useEffect(() => {
    const blockPrint = (event) => {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "p"
      ) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    };

    window.addEventListener("keydown", blockPrint, true);

    const style = document.createElement("style");
    style.textContent = `
      @media print {
        html, body, body * {
          visibility: hidden !important;
        }
      }
    `;

    document.head.appendChild(style);

    return () => {
      window.removeEventListener("keydown", blockPrint, true);
      style.remove();
    };
  }, []);

  return null;
}
