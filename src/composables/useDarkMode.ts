import { ref } from "vue";

function getInitialDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export const isDark = ref<boolean>(getInitialDark());

function syncHtmlClass(dark: boolean) {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("dark", dark);
}

export function setDark(value: boolean) {
  isDark.value = value;
  syncHtmlClass(value);
}

export function toggleDark() {
  setDark(!isDark.value);
}

syncHtmlClass(isDark.value);

if (typeof window !== "undefined") {
  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (event) => {
      setDark(event.matches);
    });
}
