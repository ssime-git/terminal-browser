const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const originalLoad = Module._load;
Module._load = function (id, ...args) {
  return id === "../pages/scheme"
    ? { DOC_SCHEME: "terminal-browser-file" }
    : originalLoad.call(this, id, ...args);
};
const { TabManager } = require("../dist/session/tabs.js");
Module._load = originalLoad;

function manager() {
  const tabs = new TabManager({
    onActivated() {},
    onTabsChanged() {},
    requestRender() {},
    tabSwitchAllowed: () => true,
  }, "about:blank");
  return tabs;
}

test("split reuses an existing tab and focusing preserves left and right positions", () => {
  const tabs = manager();
  const left = tabs.create("https://left.example");
  const right = tabs.create("https://right.example", false);
  tabs.toggleSplit();
  assert.deepEqual(tabs.split, [left.id, right.id]);
  tabs.focusOtherPane();
  assert.equal(tabs.active.id, right.id);
  assert.deepEqual(tabs.split, [left.id, right.id]);
  tabs.activate(left.id);
  assert.deepEqual(tabs.split, [left.id, right.id]);
});

test("split creates a second tab when only one exists and collapsing keeps both tabs", () => {
  const tabs = manager();
  const left = tabs.create("https://left.example");
  tabs.toggleSplit();
  assert.equal(tabs.count, 2);
  assert.equal(tabs.get(tabs.split[1]).state.url, "about:blank");
  tabs.focusOtherPane();
  const right = tabs.active;
  tabs.toggleSplit();
  assert.equal(tabs.split, null);
  assert.equal(tabs.active.id, right.id);
  assert.ok(tabs.has(left.id));
});

test("switching to a third tab replaces only the focused pane", () => {
  const tabs = manager();
  const left = tabs.create("https://left.example");
  const right = tabs.create("https://right.example", false);
  const third = tabs.create("https://third.example", false);
  tabs.toggleSplit();
  tabs.focusOtherPane();
  tabs.activate(third.id);
  assert.deepEqual(tabs.split, [left.id, third.id]);
  assert.ok(tabs.has(right.id));
});

test("closing either split tab expands the remaining pane", () => {
  for (const closeActive of [true, false]) {
    const tabs = manager();
    const left = tabs.create("https://left.example");
    const right = tabs.create("https://right.example", false);
    tabs.toggleSplit();
    tabs.close(closeActive ? left.id : right.id);
    assert.equal(tabs.split, null);
    assert.equal(tabs.count, 1);
    assert.equal(tabs.active.id, closeActive ? right.id : left.id);
  }
});
