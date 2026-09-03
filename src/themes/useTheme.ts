/**
 * Composable for runtime theme control.
 *
 * jsonschema-editor uses Element Plus (CSS-variable based theming), so the
 * theme API here is intentionally minimal: it toggles dark mode and keeps
 * the state reactive. There is no "preset" concept — Element Plus has no
 * runtime preset switching like PrimeVue did.
 */
import { ref, watch } from "vue";

const darkMode = ref(false);

/**
 * Apply dark mode:
 * 1. Toggle .dark on <html> — Element Plus dark CSS vars + Tailwind dark:
 *    variant both key off this selector.
 * 2. Toggle .dark on all .jscb containers (for scoped Tailwind utilities).
 * 3. Also apply to the overlay container used for any custom overlays.
 * 4. Switch Monaco editor theme (lazy — only loaded if Monaco is available).
 */
const applyDarkMode = (isDark: boolean) => {
  // Element Plus dark mode: toggle .dark on <html> so dark CSS variables act
  document.documentElement.classList.toggle("dark", isDark);

  // Also toggle .dark on .jscb containers for any Tailwind dark: utilities
  const els = document.querySelectorAll<HTMLElement>(".jscb");
  for (const el of els) {
    el.classList.toggle("dark", isDark);
  }

  // Also apply to the overlay container
  const overlayContainers = document.querySelectorAll<HTMLElement>(
    "[data-jscb-overlay-container]",
  );
  for (const el of overlayContainers) {
    el.classList.toggle("dark", isDark);
  }

  // Switch Monaco editor theme (dynamic import — no-op if Monaco is not installed)
  import("monaco-editor")
    .then((m) => m.editor.setTheme(isDark ? "vs-dark" : "vs"))
    .catch(() => {
      // Monaco is not available — ignore
    });
};

// Sync dark mode on mount
watch(
  darkMode,
  (isDark) => {
    applyDarkMode(isDark);
  },
  { immediate: true },
);

/**
 * Composable to control dark mode at runtime.
 */
export function useTheme() {
  /** Toggle dark mode */
  const toggleDarkMode = (value?: boolean) => {
    darkMode.value = value ?? !darkMode.value;
  };

  return {
    /** Reactive ref to dark mode state */
    darkMode,
    /** Toggle or set dark mode */
    toggleDarkMode,
  };
}