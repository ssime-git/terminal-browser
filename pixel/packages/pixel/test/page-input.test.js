const assert = require("node:assert/strict");
const Module = require("node:module");
const { test } = require("node:test");

const originalLoad = Module._load;
Module._load = function (id, ...args) {
  return id === "electron" ? {} : originalLoad.call(this, id, ...args);
};
const { PageInput } = require("../dist/web/input.js");
Module._load = originalLoad;

function input() {
  const events = [];
  const page = new PageInput({
    contents: () => ({ sendInputEvent: (event) => events.push(event) }),
    focus: () => {},
    scale: () => 2,
  });
  return { page, events };
}

const wheel = (deltaY, precise = false, ctrl = false) => ({
  deltaX: 0, deltaY, precise,
  mods: { ctrl, super: false, alt: false, shift: false },
});

test("wheel speed changes detent distance in both directions", () => {
  const { page, events } = input();
  page.wheel(wheel(20), 1);
  page.wheel(wheel(20), 1.5);
  page.wheel(wheel(-20), 1.5);
  assert.equal(events[1].deltaY, events[0].deltaY * 1.5);
  assert.equal(events[2].deltaY, -events[1].deltaY);
  assert.equal(events[1].wheelTicksY, -1.5);
});

test("wheel speed preserves precise trackpad distance and pinch zoom", () => {
  const normal = input();
  const fast = input();
  for (const event of [wheel(20, true), wheel(-10, true, true)]) {
    normal.page.wheel(event, 1);
    fast.page.wheel(event, 3);
  }
  assert.deepEqual(fast.events, normal.events);
  assert.equal(fast.events[0].deltaY, -10);
  assert.deepEqual(fast.events[1].modifiers, ["ctrl"]);
});
