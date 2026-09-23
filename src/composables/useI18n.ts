import { type ComputedRef, computed, ref } from "vue";
import { en } from "../constants/en.ts";
import { zh } from "../constants/zh.ts";

export type LocaleName = "zh" | "en";
export type LocaleMessages = typeof zh;

const messages: Record<LocaleName, LocaleMessages> = {
  zh,
  en,
};

export const locale = ref<LocaleName>("zh");

export const t: ComputedRef<LocaleMessages> = computed(
  () => messages[locale.value],
);

export function setLocale(name: LocaleName) {
  locale.value = name;
}

export function toggleLocale() {
  setLocale(locale.value === "zh" ? "en" : "zh");
}

export { en, zh };
