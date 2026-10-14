const assert = require("node:assert/strict");
const { test } = require("node:test");
const { computeLayout } = require("../dist/session/layout.js");

const info = { width: 1200, height: 800, basePx: 16, cellHeight: 20 };

test("left tabs reserve space beside the page and both devtools docks", () => {
  for (const dock of [null, "bottom", "right"]) {
    const { chrome, surface, devtools } = computeLayout(info, 2, dock && { dock, fraction: 0.3 });
    assert.equal(chrome.sidebarWidth, 208);
    assert.ok(surface.x >= chrome.sidebarWidth);
    assert.ok(surface.x + surface.width <= info.width);
    assert.ok(surface.y + surface.height <= info.height);
    assert.equal(surface.width % 2, 0);
    if (devtools) {
      assert.ok(devtools.x >= chrome.sidebarWidth);
      assert.ok(devtools.x + devtools.width <= info.width);
      assert.ok(devtools.y + devtools.height <= info.height);
    }
  }
});

test("top tabs return sidebar space to the page", () => {
  const left = computeLayout(info, 1, null).chrome;
  const top = computeLayout(info, 1, null, 0, "top").chrome;
  assert.equal(top.sidebarWidth, 0);
  assert.equal(top.page.width - left.page.width, left.sidebarWidth);
});

test("sidebar stays bounded in narrow panes and page scaling preserves chrome size", () => {
  const narrow = computeLayout({ ...info, width: 240 }, 1, null).chrome;
  assert.ok(narrow.sidebarWidth <= 240 * 0.3);
  assert.ok(narrow.page.width > 0);
  const normal = computeLayout(info, 1, null).chrome;
  const scaled = computeLayout(info, 2, null).chrome;
  assert.equal(normal.rem, scaled.rem);
  assert.equal(normal.toolbarHeight, scaled.toolbarHeight);
  assert.equal(normal.sidebarWidth, scaled.sidebarWidth);
});

test("split panes stay separate and within bounds with resize, sidebar and devtools", () => {
  for (const width of [400, 1200]) {
    for (const dock of [null, "right", "bottom"]) {
      for (const fraction of [0.15, 0.5, 0.85]) {
        for (const active of [0, 1]) {
          const result = computeLayout(
            { ...info, width }, 2, dock && { dock, fraction: 0.3 }, 0, "left", { fraction, active },
          );
          const [left, right] = result.chrome.splitPages;
          assert.ok(left.x >= result.chrome.sidebarWidth);
          assert.ok(left.x + left.width < right.x);
          assert.ok(right.x + right.width <= width);
          assert.ok(left.width > 0 && right.width > 0);
          assert.equal(left.width % 2, 0);
          assert.equal(right.width % 2, 0);
          assert.deepEqual(result.chrome.page, result.chrome.splitPages[active]);
          assert.equal(result.surface.x, result.chrome.page.x);
          assert.equal(result.surface.width, result.chrome.page.width);
        }
      }
    }
  }
});
