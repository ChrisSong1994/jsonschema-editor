<script setup lang="ts">
import {
  ChevronDown,
  ChevronRight,
  Code2,
  Globe,
  Layers,
  Menu,
  Moon,
  Package,
  Palette,
  Sparkles,
  Sun,
  Zap,
} from "lucide-vue-next";
import { computed, nextTick, ref } from "vue";
import JsonValidator from "../../src/components/features/JsonValidator.vue";
import SchemaInferencer from "../../src/components/features/SchemaInferencer.vue";
import JsonSchemaEditor from "../../src/components/SchemaEditor/JsonSchemaEditor.vue";
import { en } from "../../src/i18n/locales/en.ts";
import { provideTranslation } from "../../src/i18n/translation-context.ts";
import type { Translation } from "../../src/i18n/translation-keys.ts";
import {
  THEME_PRESET_KEYS,
  THEME_PRESETS,
  type ThemePreset,
  useTheme,
} from "../../src/themes/useTheme.ts";
import type { JSONSchema } from "../../src/types/jsonSchema.ts";
import DemoBlock from "../components/DemoBlock.vue";
import {
  type DemoLocale,
  type DemoText,
  demoLang,
  setDemoLang,
  demoText as t,
} from "../utils/demoI18n.ts";
import { exampleSchema } from "../utils/schemaExample.ts";

// ── Reactive translation ──
const translation = ref<Translation>(en);
provideTranslation(translation);

// ── Theme ──
const { darkMode, toggleDarkMode, preset, setPreset } = useTheme();
const presetMenuOpen = ref(false);

// ── State ──
const schema = ref<JSONSchema>(exampleSchema);
const inferPopupSchema = ref<JSONSchema>({ type: "object", properties: {} });
const inferInlineSchema = ref<JSONSchema>({ type: "object", properties: {} });
const inferDialogOpen = ref(false);
const validatorDialogOpen = ref(false);
const schemaText = computed(() => JSON.stringify(schema.value, null, 2));

// ── Sidebar ──
type NavItem = {
  id: string;
  label: string;
  // biome-ignore lint/suspicious/noExplicitAny: accepts various icon components
  icon?: any;
  children?: { id: string; label: string }[];
};
const nav = computed<NavItem[]>(() => [
  {
    id: "editor",
    label: "JsonSchemaEditor",
    icon: Layers,
    children: [
      { id: "editor-basic", label: t.value.basic },
      { id: "editor-visual", label: t.value.visualOnly },
      { id: "editor-readonly", label: t.value.readOnly },
      { id: "editor-nofs", label: t.value.noFullscreen },
      { id: "editor-sync", label: t.value.sync },
    ],
  },
  {
    id: "infer",
    label: "SchemaInferencer",
    icon: Sparkles,
    children: [
      { id: "infer-popup", label: t.value.popup },
      { id: "infer-inline", label: t.value.inline },
      { id: "infer-util", label: t.value.utility },
    ],
  },
  {
    id: "validator",
    label: "JsonValidator",
    icon: Zap,
    children: [
      { id: "validator-popup", label: t.value.popup },
      { id: "validator-inline", label: t.value.inline },
      { id: "validator-util", label: t.value.utility },
    ],
  },
  { id: "i18n", label: t.value.localization, icon: Globe },
  { id: "theming", label: t.value.theming, icon: Palette },
]);

const active = ref("editor");
const expanded = ref<Record<string, boolean>>({
  editor: true,
  infer: true,
  validator: true,
});
const mobileNav = ref(false);

const go = (id: string) => {
  active.value = id;
  mobileNav.value = false;
  nextTick(() => {
    document
      .getElementById(`section-${id}`)
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
};
const toggle = (id: string) => {
  expanded.value[id] = !expanded.value[id];
};

// ── i18n ──
const langs = [
  { value: "en", label: "English" },
  { value: "zh", label: "中文" },
];
const currentLang = ref<string>(demoLang.value);
const switchLang = (val: string) => {
  currentLang.value = val;
  setDemoLang(val as DemoLocale);
  import(`../../src/i18n/locales/${val}.ts`).then((m) => {
    translation.value = m[val];
  });
};

// ── Utility demos ──
const utilInput = ref(
  '{\n  "name": "Alice",\n  "age": 25,\n  "active": true\n}',
);
const utilOutput = ref("");
const runInfer = () => {
  try {
    const obj = JSON.parse(utilInput.value);
    import("../../src/lib/schema-inference.ts").then((m) => {
      utilOutput.value = JSON.stringify(m.createSchemaFromJson(obj), null, 2);
    });
  } catch (e) {
    utilOutput.value = `Error: ${(e as Error).message}`;
  }
};

const validUtilInput = ref('{ "name": "Bob", "age": "not a number" }');
const validUtilSchema: JSONSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" },
  },
};
const validUtilOutput = ref("");
const runValidate = () => {
  import("../../src/utils/jsonValidator.ts").then((m) => {
    const result = m.validateJson(validUtilInput.value, validUtilSchema);
    validUtilOutput.value = result.valid
      ? t.value.valid
      : result.errors?.map((e) => `✗ ${e.path}: ${e.message}`).join("\n");
  });
};

// ── Props & Events ──
type P = { name: string; type: string; def: string; desc: string };
type E = { name: string; payload: string; desc: string };

const editorProps = computed<P[]>(() => [
  {
    name: "schema",
    type: "JSONSchema",
    def: "{ type: 'object' }",
    desc: t.value.editorPropSchema,
  },
  {
    name: "readOnly",
    type: "boolean",
    def: "false",
    desc: t.value.editorPropReadOnly,
  },
  {
    name: "showJsonEditor",
    type: "boolean",
    def: "true",
    desc: t.value.editorPropShowJson,
  },
  {
    name: "showFullscreen",
    type: "boolean",
    def: "true",
    desc: t.value.editorPropShowFullscreen,
  },
]);
const editorEvents = computed<E[]>(() => [
  {
    name: "update:schema",
    payload: "JSONSchema",
    desc: t.value.editorEventUpdateSchema,
  },
]);
const inferProps = computed<P[]>(() => [
  {
    name: "visible",
    type: "boolean | undefined",
    def: "undefined",
    desc: t.value.inferPropVisible,
  },
]);
const inferEvents = computed<E[]>(() => [
  {
    name: "update:visible",
    payload: "boolean",
    desc: t.value.inferEventUpdateVisible,
  },
  {
    name: "schemaInferred",
    payload: "JSONSchema",
    desc: t.value.inferEventSchemaInferred,
  },
]);
const validatorProps = computed<P[]>(() => [
  {
    name: "schema",
    type: "JSONSchema",
    def: "—",
    desc: t.value.validatorPropSchema,
  },
  {
    name: "visible",
    type: "boolean | undefined",
    def: "undefined",
    desc: t.value.validatorPropVisible,
  },
]);
const validatorEvents = computed<E[]>(() => [
  {
    name: "update:visible",
    payload: "boolean",
    desc: t.value.validatorEventUpdateVisible,
  },
]);

// ── Complete SFC Code Snippets ──
import { codeSnippets as code } from "../utils/codeSnippets.ts";
</script>

<template>
  <div class="min-h-screen bg-background jscb font-sans">

    <!-- ───────── Hero ───────── -->
    <header class="relative overflow-hidden border-b border-border/30">
      <div class="absolute inset-0 pointer-events-none"
           style="background: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(64,158,255,.08), transparent)" />
      <div class="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div class="flex items-center gap-3 mb-4">
          <div class="h-10 w-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <Code2 :size="20" class="text-white" />
          </div>
          <div>
            <h1 class="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">jsonschema-editor</h1>
            <p class="text-sm text-muted-foreground mt-0.5">{{ t.heroSubtitle }}</p>
          </div>
        </div>
        <div class="flex items-center gap-3 flex-wrap">
          <a href="https://www.npmjs.com/package/@fett/jsonschema-editor" target="_blank" rel="nofollow noopener noreferrer"
             class="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-lg border border-border bg-card hover:bg-muted transition-colors shadow-sm">
            <Package :size="14" /> npm
          </a>
          <span class="inline-flex items-center px-2.5 py-1 text-xs font-mono rounded-full bg-primary-50 text-primary-700 border border-primary-100">
            npm i @fett/jsonschema-editor
          </span>
          <div class="flex items-center gap-0.5 rounded-lg border border-border bg-card p-0.5 shadow-sm">
            <button v-for="lang in langs" :key="lang.value" type="button" @click="switchLang(lang.value)"
              :class="[
                'px-2.5 py-1 rounded-md text-xs font-medium transition-colors',
                currentLang === lang.value
                  ? 'bg-primary-500 text-white shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              ]">
              {{ lang.label }}
            </button>
          </div>
          <!-- Global theme switcher (dark mode + brand-color preset) -->
          <div class="flex items-center gap-2 rounded-lg border border-border bg-card p-0.5 shadow-sm">
            <button type="button" @click="toggleDarkMode()"
              :title="t.darkMode"
              :aria-label="t.darkMode"
              :class="[
                'flex items-center justify-center h-7 w-7 rounded-md transition-colors',
                darkMode
                  ? 'text-yellow-300 hover:bg-muted'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              ]">
              <Sun v-if="!darkMode" :size="15" />
              <Moon v-else :size="15" />
            </button>
            <div class="relative">
              <button type="button" @click="presetMenuOpen = !presetMenuOpen"
                :title="t.colorPreset"
                :aria-label="t.colorPreset"
                :style="{ background: THEME_PRESETS[preset].primary }"
                class="flex items-center gap-1.5 h-7 pl-2 pr-1.5 rounded-md text-white transition-opacity hover:opacity-90">
                <span :style="{ background: THEME_PRESETS[preset].primary }"
                  class="inline-block h-3 w-3 rounded-full border border-white/40" />
                <ChevronDown :size="13" />
              </button>
              <div v-if="presetMenuOpen"
                class="absolute right-0 top-full mt-2 z-40 w-40 rounded-lg border border-border bg-popover shadow-xl p-1.5">
                <p class="px-2 py-1 text-[11px] text-muted-foreground uppercase tracking-wider font-medium">{{ t.colorPreset }}</p>
                <button v-for="key in THEME_PRESET_KEYS" :key="key" type="button"
                  @click="setPreset(key as ThemePreset); presetMenuOpen = false"
                  :class="[
                    'flex w-full items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                    preset === key ? 'bg-primary-50 text-primary-700' : 'text-foreground hover:bg-muted'
                  ]">
                  <span class="inline-block h-3.5 w-3.5 rounded-full"
                    :style="{ background: THEME_PRESETS[key as ThemePreset].primary }" />
                  {{ t[key as keyof DemoText] }}
                  <span v-if="preset === key" class="ml-auto text-primary-600">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <div class="flex max-w-[1800px] mx-auto">

      <!-- ───────── Sidebar ───────── -->
      <button type="button" class="fixed bottom-4 right-4 z-30 lg:hidden p-3 rounded-full bg-gray-900 text-white shadow-xl" @click="mobileNav = !mobileNav">
        <Menu :size="20" />
      </button>
      <div v-if="mobileNav" class="fixed inset-0 z-20 bg-black/30 lg:hidden" @click="mobileNav = false" />

      <aside :class="[
        'shrink-0 bg-card/60 backdrop-blur-md border-r border-border/30 overflow-y-auto',
        'fixed inset-y-0 left-0 z-20 w-64 pt-4 transition-transform lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:w-64',
        mobileNav ? 'translate-x-0' : '-translate-x-full'
      ]">
        <nav class="px-3 pb-6 space-y-1 text-[13px]">
          <div v-for="item in nav" :key="item.id" class="mb-1">
            <!-- Group header -->
            <button type="button" @click="item.children ? (expanded[item.id] = true, go(item.id)) : go(item.id)"
              :class="[
                'w-full flex items-center gap-2 px-2.5 py-2 rounded-lg font-semibold transition-colors',
                active === item.id || active.startsWith(item.id + '-')
                  ? 'text-primary-700 bg-primary-50/80' : 'text-foreground/80 hover:bg-muted/70'
              ]">
              <component v-if="item.icon" :is="item.icon" :size="15" class="opacity-60" />
              <span class="grow text-left">{{ item.label }}</span>
              <span v-if="item.children" class="p-0.5 rounded hover:bg-muted/80" @click.stop="toggle(item.id)">
                <ChevronDown v-if="expanded[item.id]" :size="14" class="opacity-40" />
                <ChevronRight v-else :size="14" class="opacity-40" />
              </span>
            </button>
            <!-- Children -->
            <div v-if="item.children && expanded[item.id]" class="ml-6 mt-0.5 space-y-0.5 border-l border-border pl-2.5">
              <button v-for="child in item.children" :key="child.id" type="button" @click="go(child.id)"
                :class="[
                  'w-full text-left px-2 py-1.5 rounded-md transition-colors',
                  active === child.id ? 'text-primary-700 bg-primary-50/60 font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                ]">
                {{ child.label }}
              </button>
            </div>
          </div>
        </nav>
      </aside>

      <!-- ───────── Content ───────── -->
      <main class="grow min-w-0 overflow-y-auto">
        <div class="w-full px-6 sm:px-10 lg:px-14 py-8 space-y-16">

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║     JsonSchemaEditor          ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <section id="section-editor">
            <div class="flex items-center gap-3 mb-2">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center">
                <Layers :size="16" class="text-white" />
              </div>
              <h2 class="text-xl font-bold text-foreground">JsonSchemaEditor</h2>
            </div>
            <p class="text-muted-foreground mb-6 leading-relaxed">
              {{ t.editorDesc }}
            </p>

            <!-- API Tables -->
            <div class="grid gap-5 mb-10">
              <div>
                <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">{{ t.props }}</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-muted text-left text-xs text-muted-foreground uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">{{ t.name }}</th><th class="px-4 py-2.5 font-medium">{{ t.type }}</th>
                      <th class="px-4 py-2.5 font-medium">{{ t.default }}</th><th class="px-4 py-2.5 font-medium">{{ t.description }}</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="p in editorProps" :key="p.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-primary-600 font-medium">{{ p.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{{ p.type }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground/70">{{ p.def }}</td>
                        <td class="px-4 py-2.5 text-muted-foreground">{{ p.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">{{ t.events }}</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-muted text-left text-xs text-muted-foreground uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">{{ t.name }}</th><th class="px-4 py-2.5 font-medium">{{ t.payload }}</th>
                      <th class="px-4 py-2.5 font-medium">{{ t.description }}</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="e in editorEvents" :key="e.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-primary-600 font-medium">{{ e.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{{ e.payload }}</td>
                        <td class="px-4 py-2.5 text-muted-foreground">{{ e.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Basic -->
            <div id="section-editor-basic" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.basicTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.basicDesc }}</p>
              <DemoBlock :code="code['editor-basic']">
                <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" class="h-full" />
              </DemoBlock>
            </div>

            <!-- Visual Only -->
            <div id="section-editor-visual" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.visualOnlyTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.visualOnlyDesc }}</p>
              <DemoBlock :code="code['editor-visual']">
                <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" :show-json-editor="false" class="h-full" />
              </DemoBlock>
            </div>

            <!-- Read-Only -->
            <div id="section-editor-readonly" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.readOnlyTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.readOnlyDesc }}</p>
              <DemoBlock :code="code['editor-readonly']">
                <JsonSchemaEditor :schema="schema" :read-only="true" class="h-full" />
              </DemoBlock>
            </div>

            <!-- No Fullscreen -->
            <div id="section-editor-nofs" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.noFullscreenTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.noFullscreenDesc }}</p>
              <DemoBlock :code="code['editor-nofs']">
                <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" :show-fullscreen="false" class="h-full" />
              </DemoBlock>
            </div>

            <!-- Textbox Sync -->
            <div id="section-editor-sync" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.syncTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.syncDescA }} <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">update:schema</code> {{ t.syncDescB }}</p>
              <DemoBlock :code="code['editor-sync']">
                <div class="grid lg:grid-cols-2 gap-4 p-4 h-full">
                  <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" :show-json-editor="false" :show-fullscreen="false" class="h-full" />
                  <textarea :value="schemaText" readonly
                    class="rounded-xl border border-border/60 bg-card p-4 text-xs font-mono text-muted-foreground resize-none shadow-xs focus:outline-none h-full" />
                </div>
              </DemoBlock>
            </div>
          </section>

          <hr class="border-border/30" />

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║     SchemaInferencer          ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <section id="section-infer">
            <div class="flex items-center gap-3 mb-2">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center">
                <Sparkles :size="16" class="text-white" />
              </div>
              <h2 class="text-xl font-bold text-foreground">SchemaInferencer</h2>
            </div>
            <p class="text-muted-foreground mb-6 leading-relaxed">
              {{ t.inferDesc }}
            </p>

            <div class="grid gap-5 mb-10">
              <div>
                <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">{{ t.props }}</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-muted text-left text-xs text-muted-foreground uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">{{ t.name }}</th><th class="px-4 py-2.5 font-medium">{{ t.type }}</th>
                      <th class="px-4 py-2.5 font-medium">{{ t.default }}</th><th class="px-4 py-2.5 font-medium">{{ t.description }}</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="p in inferProps" :key="p.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-amber-600 font-medium">{{ p.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{{ p.type }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground/70">{{ p.def }}</td>
                        <td class="px-4 py-2.5 text-muted-foreground">{{ p.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">{{ t.events }}</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-muted text-left text-xs text-muted-foreground uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">{{ t.name }}</th><th class="px-4 py-2.5 font-medium">{{ t.payload }}</th>
                      <th class="px-4 py-2.5 font-medium">{{ t.description }}</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="e in inferEvents" :key="e.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-amber-600 font-medium">{{ e.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{{ e.payload }}</td>
                        <td class="px-4 py-2.5 text-muted-foreground">{{ e.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Popup -->
            <div id="section-infer-popup" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.popupTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.inferPopupDesc }}</p>
              <DemoBlock :code="code['infer-popup']">
                <div class="p-4">
                  <button type="button" @click="inferDialogOpen = true"
                    class="px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:shadow-md hover:shadow-amber-500/20 transition-all mb-3">
                    {{ t.openInferencer }}
                  </button>
                  <div v-if="Object.keys((inferPopupSchema as any).properties || {}).length"
                    class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card" style="height:380px">
                    <JsonSchemaEditor :schema="inferPopupSchema" :read-only="true" class="h-full" />
                  </div>
                  <p v-else class="text-sm text-muted-foreground italic">{{ t.inferredPlaceholder }}</p>
                  <SchemaInferencer :visible="inferDialogOpen" @update:visible="inferDialogOpen = $event" @schema-inferred="inferPopupSchema = $event" />
                </div>
              </DemoBlock>
            </div>

            <!-- Inline -->
            <div id="section-infer-inline" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.inlineTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.omitVisibleA }} <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">:visible</code> {{ t.omitVisibleB }} {{ t.inferInlineExtra }}</p>
              <DemoBlock :code="code['infer-inline']">
                <div class="grid lg:grid-cols-2 gap-4 p-4">
                  <div>
                    <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">{{ t.stepPasteJson }}</p>
                    <SchemaInferencer @schema-inferred="inferInlineSchema = $event" />
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">{{ t.stepResultSchema }}</p>
                    <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card" style="height:368px">
                      <JsonSchemaEditor :schema="inferInlineSchema" @update:schema="inferInlineSchema = $event" :show-json-editor="false" :show-fullscreen="false" class="h-full" />
                    </div>
                  </div>
                </div>
              </DemoBlock>
            </div>

            <!-- Utility -->
            <div id="section-infer-util" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.utilityTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.inferUtilDesc }}</p>
              <DemoBlock :code="code['infer-util']" language="typescript">
                <div class="grid lg:grid-cols-2 gap-4 p-4">
                  <div>
                    <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">{{ t.inputJson }}</p>
                    <textarea v-model="utilInput" class="rounded-xl border border-border/60 bg-card p-3 text-xs font-mono resize-none w-full h-36 focus:outline-none shadow-xs" />
                    <button type="button" @click="runInfer"
                      class="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-medium hover:shadow-md transition-all">{{ t.run }}</button>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">{{ t.outputSchema }}</p>
                    <pre class="rounded-xl border border-border/60 bg-card p-3 text-xs font-mono h-36 overflow-auto shadow-xs">{{ utilOutput || t.pressRun }}</pre>
                  </div>
                </div>
              </DemoBlock>
            </div>
          </section>

          <hr class="border-border/30" />

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║     JsonValidator             ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <section id="section-validator">
            <div class="flex items-center gap-3 mb-2">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center">
                <Zap :size="16" class="text-white" />
              </div>
              <h2 class="text-xl font-bold text-foreground">JsonValidator</h2>
            </div>
            <p class="text-muted-foreground mb-6 leading-relaxed">
              {{ t.validatorDesc }}
            </p>

            <div class="grid gap-5 mb-10">
              <div>
                <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">{{ t.props }}</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-muted text-left text-xs text-muted-foreground uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">{{ t.name }}</th><th class="px-4 py-2.5 font-medium">{{ t.type }}</th>
                      <th class="px-4 py-2.5 font-medium">{{ t.default }}</th><th class="px-4 py-2.5 font-medium">{{ t.description }}</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="p in validatorProps" :key="p.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-emerald-600 font-medium">{{ p.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{{ p.type }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground/70">{{ p.def }}</td>
                        <td class="px-4 py-2.5 text-muted-foreground">{{ p.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
              <div>
                <h3 class="text-sm font-semibold text-foreground uppercase tracking-wider mb-2">{{ t.events }}</h3>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card">
                  <table class="w-full text-sm">
                    <thead><tr class="bg-muted text-left text-xs text-muted-foreground uppercase tracking-wider">
                      <th class="px-4 py-2.5 font-medium">{{ t.name }}</th><th class="px-4 py-2.5 font-medium">{{ t.payload }}</th>
                      <th class="px-4 py-2.5 font-medium">{{ t.description }}</th>
                    </tr></thead>
                    <tbody>
                      <tr v-for="e in validatorEvents" :key="e.name" class="border-t border-border/40">
                        <td class="px-4 py-2.5 font-mono text-xs text-emerald-600 font-medium">{{ e.name }}</td>
                        <td class="px-4 py-2.5 font-mono text-xs text-muted-foreground">{{ e.payload }}</td>
                        <td class="px-4 py-2.5 text-muted-foreground">{{ e.desc }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Popup -->
            <div id="section-validator-popup" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.popupTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.validatorPopupDesc }}</p>
              <DemoBlock :code="code['validator-popup']">
                <div class="p-4">
                  <button type="button" @click="validatorDialogOpen = true"
                    class="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:shadow-md hover:shadow-emerald-500/20 transition-all">
                    {{ t.openValidator }}
                  </button>
                  <p class="text-sm text-muted-foreground mt-2">{{ t.validatesAgainst }}</p>
                  <JsonValidator :visible="validatorDialogOpen" @update:visible="validatorDialogOpen = $event" :schema="schema" />
                </div>
              </DemoBlock>
            </div>

            <!-- Inline -->
            <div id="section-validator-inline" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.inlineTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.omitVisibleA }} <code class="text-xs bg-muted px-1 py-0.5 rounded font-mono">:visible</code> {{ t.omitVisibleB }}</p>
              <DemoBlock :code="code['validator-inline']">
                <div class="p-4">
                  <JsonValidator :schema="schema" />
                </div>
              </DemoBlock>
            </div>

            <!-- Utility -->
            <div id="section-validator-util" class="mb-10">
              <h3 class="text-base font-semibold text-foreground mb-1">{{ t.utilityTitle }}</h3>
              <p class="text-sm text-muted-foreground mb-3">{{ t.validatorUtilDesc }}</p>
              <DemoBlock :code="code['validator-util']" language="typescript">
                <div class="grid lg:grid-cols-2 gap-4 p-4">
                  <div>
                    <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">{{ t.input }}</p>
                    <textarea v-model="validUtilInput" class="rounded-xl border border-border/60 bg-card p-3 text-xs font-mono resize-none w-full h-36 focus:outline-none shadow-xs" />
                    <button type="button" @click="runValidate"
                      class="mt-2 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium hover:shadow-md transition-all">{{ t.validate }}</button>
                  </div>
                  <div>
                    <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">{{ t.result }}</p>
                    <pre class="rounded-xl border border-border/60 bg-card p-3 text-xs font-mono h-36 overflow-auto whitespace-pre-wrap shadow-xs">{{ validUtilOutput || t.pressValidate }}</pre>
                  </div>
                </div>
              </DemoBlock>
            </div>
          </section>

          <hr class="border-border/30" />

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║     Localization              ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <section id="section-i18n">
            <div class="flex items-center gap-3 mb-2">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                <Globe :size="16" class="text-white" />
              </div>
              <h2 class="text-xl font-bold text-foreground">{{ t.localization }}</h2>
            </div>
            <p class="text-muted-foreground mb-6 leading-relaxed">
              {{ t.i18nDesc }}
            </p>

            <DemoBlock :code="code.i18n">
              <div class="p-4">
                <div class="mb-4">
                  <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">{{ t.availableLocales }}</p>
                  <div class="flex flex-wrap gap-2">
                    <button v-for="lang in langs" :key="lang.value" type="button" @click="switchLang(lang.value)"
                      :class="[
                        'px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
                        currentLang === lang.value
                          ? 'bg-gradient-to-r from-primary-500 to-primary-700 text-white shadow-md shadow-primary-500/20'
                          : 'bg-card border border-border/60 text-muted-foreground hover:bg-muted hover:shadow-xs'
                      ]">
                      {{ lang.label }}
                    </button>
                  </div>
                </div>
                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card" style="height:380px">
                  <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" class="h-full" />
                </div>
              </div>
            </DemoBlock>
          </section>

          <hr class="border-border/30" />

          <!-- ╔══════════════════════════════╗ -->
          <!-- ║     Theming                   ║ -->
          <!-- ╚══════════════════════════════╝ -->
          <section id="section-theming">
            <div class="flex items-center gap-3 mb-2">
              <div class="h-8 w-8 rounded-lg bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                <Palette :size="16" class="text-white" />
              </div>
              <h2 class="text-xl font-bold text-foreground">{{ t.theming }}</h2>
            </div>
            <p class="text-muted-foreground mb-6 leading-relaxed">
              {{ t.themingDesc }}
            </p>

            <DemoBlock :code="code.theming">
              <div class="p-4">
                <div class="mb-4">
                  <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">{{ t.darkMode }}</p>
                  <button type="button" @click="toggleDarkMode()"
                    :class="[
                      'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
                      darkMode
                        ? 'bg-gray-800 text-yellow-300 shadow-md'
                        : 'bg-card border border-border/60 text-muted-foreground hover:bg-muted hover:shadow-xs'
                    ]">
                    <Moon v-if="darkMode" :size="14" />
                    <Sun v-else :size="14" />
                    {{ darkMode ? t.dark : t.light }}
                  </button>
                </div>

                <div class="mb-4">
                  <p class="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-2">{{ t.colorPreset }}</p>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="key in THEME_PRESET_KEYS"
                      :key="key"
                      type="button"
                      @click="setPreset(key as ThemePreset)"
                      :class="[
                        'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all',
                        preset === key
                          ? 'text-white shadow-md'
                          : 'bg-card border border-border/60 text-muted-foreground hover:bg-muted hover:shadow-xs'
                      ]"
                      :style="preset === key ? { background: THEME_PRESETS[key as ThemePreset].primary } : undefined"
                    >
                      <span class="inline-block h-3 w-3 rounded-full"
                        :style="{ background: THEME_PRESETS[key as ThemePreset].primary }" />
                      {{ t[key as keyof DemoText] }}
                    </button>
                  </div>
                </div>

                <div class="rounded-xl border border-border/60 overflow-hidden shadow-xs bg-card" style="height:350px">
                  <JsonSchemaEditor :schema="schema" @update:schema="schema = $event" class="h-full" />
                </div>
              </div>
            </DemoBlock>
          </section>

          <!-- Footer -->
          <footer class="text-center text-xs text-muted-foreground pt-8 pb-12 border-t border-border/20">
            {{ t.footer }}
          </footer>

        </div>
      </main>
    </div>
  </div>
</template>
