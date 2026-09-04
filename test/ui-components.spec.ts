import { mount } from "@vue/test-utils";
import { ElButton, ElTag } from "element-plus";
import { describe, expect, it } from "vitest";

// These specs cover the Element Plus components that replaced the removed
// `src/components/ui/*` wrappers (Button → ElButton, ButtonToggle → ElButton
// text, Badge → ElTag). Component-name coverage preserved from the originals.

const globalPlugins = {
  global: {
    plugins: [],
  },
};

describe("ElButton (replaces ui/Button)", () => {
  it("renders slot content", () => {
    const wrapper = mount(ElButton, {
      ...globalPlugins,
      slots: { default: "Click Me" },
    });
    expect(wrapper.text()).toContain("Click Me");
  });

  it("emits click event", async () => {
    const wrapper = mount(ElButton, {
      ...globalPlugins,
      slots: { default: "Click" },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
    expect(wrapper.emitted("click")?.length).toBe(1);
  });

  it("renders as submit button", () => {
    const wrapper = mount(ElButton, {
      ...globalPlugins,
      props: { nativeType: "submit" },
      slots: { default: "Submit" },
    });
    expect(wrapper.find("button").attributes("type")).toBe("submit");
  });
});

describe("ElButton text (replaces ui/ButtonToggle)", () => {
  it("renders slot content", () => {
    const wrapper = mount(ElButton, {
      ...globalPlugins,
      props: { text: true, size: "small" },
      slots: { default: "Toggle" },
    });
    expect(wrapper.text()).toContain("Toggle");
  });

  it("emits click on press", async () => {
    const wrapper = mount(ElButton, {
      ...globalPlugins,
      props: { text: true, size: "small" },
      slots: { default: "Toggle" },
    });
    await wrapper.find("button").trigger("click");
    expect(wrapper.emitted("click")).toBeTruthy();
  });
});

describe("ElTag (replaces ui/Badge)", () => {
  it("renders slot content", () => {
    const wrapper = mount(ElTag, {
      ...globalPlugins,
      slots: { default: "Test Badge" },
    });
    expect(wrapper.text()).toContain("Test Badge");
  });

  it("renders with destructive (danger) type", () => {
    const wrapper = mount(ElTag, {
      ...globalPlugins,
      props: { type: "danger" },
      slots: { default: "Error" },
    });
    expect(wrapper.text()).toContain("Error");
  });

  it("renders with info type", () => {
    const wrapper = mount(ElTag, {
      ...globalPlugins,
      props: { type: "info" },
      slots: { default: "Info" },
    });
    expect(wrapper.text()).toContain("Info");
  });
});