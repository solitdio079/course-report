import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { HydratedRouter } from "react-router/dom";

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});

if (typeof window !== "undefined") {
  const init = () => {
    try {
      window.HSStaticMethods?.autoInit?.();
      window.HSDropdown?.autoInit?.();
      window.HSCollapse?.autoInit?.();
    } catch (e) {
      console.warn("FlyonUI init error", e);
    }
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
}
