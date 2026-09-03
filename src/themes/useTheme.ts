/**
 * Composable for runtime theme control.
 *
 * jsonschema-editor uses Element Plus (CSS-variable based theming), so the
 * theme API here toggles dark mode AND switches brand-color presets by
 * overriding Element Plus `--el-color-primary*` variables on the `.jscb`
 * scope (so the brand color never leaks out of the editor components).
 */

import { ref, watch } from "vue";

/** Brand-color preset names shipped with the library. */
export type ThemePreset = "blue" | "green" | "violet" | "rose" | "amber";

/**
 * Each preset overrides the Element Plus primary palette. Values are the
 * `--el-color-primary` and its light shades — the same shape Element Plus
 * defines on `:root`. When `primary` is set, the light/dark shades are
 * derived from it by Element Plus' own mix helpers, so we only need to
 * provide the surface colors the components actually consume.
 */
export interface ThemePresetDefinition {
  label: string;
  /** Main brand color. */
  primary: string;
  /** Slightly darkened brand color (active/pressed states). */
  primaryDark: string;
  /** Light tint — used for soft backgrounds, borders, hover fills. */
  primaryLight3: string;
  primaryLight5: string;
  primaryLight7: string;
  primaryLight8: string;
  primaryLight9: string;
}

/** Built-in brand-color presets. */
export const THEME_PRESETS: Record<ThemePreset, ThemePresetDefinition> = {
  blue: {
    label: "Blue",
    primary: "#409eff",
    primaryDark: "#337ecc",
    primaryLight3: "#79bbff",
    primaryLight5: "#a0cfff",
    primaryLight7: "#c6e2ff",
    primaryLight8: "#d9ecff",
    primaryLight9: "#ecf5ff",
  },
  green: {
    label: "Green",
    primary: "#67c23a",
    primaryDark: "#529b2e",
    primaryLight3: "#95d475",
    primaryLight5: "#b3e19d",
    primaryLight7: "#d1edc4",
    primaryLight8: "#e1f3d8",
    primaryLight9: "#f0f9eb",
  },
  violet: {
    label: "Violet",
    primary: "#722ed1",
    primaryDark: "#5b21b6",
    primaryLight3: "#a855f7",
    primaryLight5: "#c084fc",
    primaryLight7: "#d8b4fe",
    primaryLight8: "#e9d5ff",
    primaryLight9: "#f5f3ff",
  },
  rose: {
    label: "Rose",
    primary: "#f43f5e",
    primaryDark: "#be123c",
    primaryLight3: "#fb7185",
    primaryLight5: "#fda4af",
    primaryLight7: "#fecdd3",
    primaryLight8: "#ffe4e6",
    primaryLight9: "#fff1f2",
  },
  amber: {
    label: "Amber",
    primary: "#f59e0b",
    primaryDark: "#b45309",
    primaryLight3: "#fbbf24",
    primaryLight5: "#fcd34d",
    primaryLight7: "#fde68a",
    primaryLight8: "#fef3c7",
    primaryLight9: "#fffbeb",
  },
};

/** Ordered list of preset keys (for rendering preset pickers). */
export const THEME_PRESET_KEYS: ThemePreset[] = Object.keys(
  THEME_PRESETS,
) as ThemePreset[];

const darkMode = ref(false);
const preset = ref<ThemePreset>("blue");

// ── Shared <style> node that scopes the primary palette to .jscb ──────────
// Reuses the same DOM-injection technique as useOverlayContainer so the brand
// color only affects library component scopes, never the host page.
let paletteStyle: HTMLStyleElement | null = null;

const buildPaletteCss = (p: ThemePresetDefinition): string => {
  return [
    ".jscb {",
    `  --el-color-primary: ${p.primary};`,
    `  --el-color-primary-dark-2: ${p.primaryDark};`,
    `  --el-color-primary-light-3: ${p.primaryLight3};`,
    `  --el-color-primary-light-5: ${p.primaryLight5};`,
    `  --el-color-primary-light-7: ${p.primaryLight7};`,
    `  --el-color-primary-light-8: ${p.primaryLight8};`,
    `  --el-color-primary-light-9: ${p.primaryLight9};`,
    "}",
  ].join("\n");
};

const ensurePaletteStyle = (): HTMLStyleElement => {
  if (!paletteStyle) {
    paletteStyle = document.createElement("style");
    paletteStyle.setAttribute("data-jscb-palette", "");
    document.head.appendChild(paletteStyle);
  }
  return paletteStyle;
};

const applyPreset = (p: ThemePreset) => {
  const def = THEME_PRESETS[p];
  if (!def) return;
  ensurePaletteStyle().textContent = buildPaletteCss(def);
};

/** Keeps deep-mode toggling + Element Plus dark vars in sync. */
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
};

// Sync dark mode + preset on mount
watch(
  darkMode,
  (isDark) => {
    applyDarkMode(isDark);
  },
  { immediate: true },
);

watch(
  preset,
  (p) => {
    applyPreset(p);
  },
  { immediate: true },
);

/**
 * Composable to control theme at runtime.
 */
export function useTheme() {
  /** Toggle or set dark mode */
  const toggleDarkMode = (value?: boolean) => {
    darkMode.value = value ?? !darkMode.value;
  };

  /** Switch to a built-in brand-color preset */
  const setPreset = (p: ThemePreset) => {
    preset.value = p;
  };

  /** Name of the current brand-color preset */
  const presetName = () => preset.value;

  return {
    /** Reactive ref to dark mode state */
    darkMode,
    /** Reactive ref to the active brand-color preset */
    preset,
    /** Toggle or set dark mode */
    toggleDarkMode,
    /** Switch to a built-in brand-color preset */
    setPreset,
    /** Current preset key */
    presetName,
  };
}
