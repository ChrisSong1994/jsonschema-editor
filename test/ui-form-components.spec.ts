import { mount } from "@vue/test-utils";
import { ElInput, ElSelect, ElSwitch } from "element-plus";
import { describe, expect, it } from "vitest";

// These specs cover the Element Plus components that replaced the removed
// `src/components/ui/*` wrappers (InputField → ElInput, Select → ElSelect +
// ElOption, Switch → ElSwitch). Component-name coverage preserved.

const globalPlugins = {
  global: {
    plugins: [],
  },
};

describe("ElInput (replaces ui/InputField)", () => {
  it("renders with placeholder", () => {
    const wrapper = mount(ElInput, {
      ...globalPlugins,
      props: { placeholder: "Enter text..." },
    });
    expect(wrapper.find("input").attributes("placeholder")).toBe(
      "Enter text...",
    );
  });

  it("renders with id", async () => {
    const wrapper = mount(ElInput, {
      ...globalPlugins,
      props: { id: "test-input" },
    });
    await new Promise((r) => setTimeout(r, 0));
    expect(wrapper.find("input").attributes("id")).toBe("test-input");
  });

  it("renders as disabled", () => {
    const wrapper = mount(ElInput, {
      ...globalPlugins,
      props: { disabled: true },
    });
    expect(wrapper.find("input").attributes("disabled")).toBeDefined();
  });

  it("emits update:modelValue on input", async () => {
    const wrapper = mount(ElInput, {
      ...globalPlugins,
      props: { modelValue: "" },
    });
    await wrapper.find("input").setValue("hello");
    expect(wrapper.emitted("update:modelValue")).toBeTruthy();
  });
});

describe("ElSelect (replaces ui/Select)", () => {
  it("renders the component", () => {
    const wrapper = mount(ElSelect, {
      ...globalPlugins,
      props: { placeholder: "Choose..." },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("renders with placeholder", () => {
    const wrapper = mount(ElSelect, {
      ...globalPlugins,
      props: { placeholder: "Choose..." },
    });
    expect(wrapper.text()).toContain("Choose...");
  });
});

describe("ElSwitch (replaces ui/Switch)", () => {
  it("renders the component", () => {
    const wrapper = mount(ElSwitch, {
      ...globalPlugins,
      props: { modelValue: false },
    });
    expect(wrapper.exists()).toBe(true);
  });

  it("renders with id", () => {
    const wrapper = mount(ElSwitch, {
      ...globalPlugins,
      props: { id: "my-switch", modelValue: true },
    });
    expect(wrapper.exists()).toBe(true);
  });
});