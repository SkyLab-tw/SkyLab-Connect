import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { beforeEach, test } from "node:test";
import { build } from "esbuild";

// 真的 store、ipcUtils 與 i18n；IPC、提示訊息與 router 換成假的
const toasts = [];
const listeners = new Map();
const fakeWindow = new EventTarget();
fakeWindow.electronIpcRenderer = {
  send: () => {},
  on: (channel, handler) => listeners.set(channel, handler),
  removeListener: () => {},
  removeAllListeners: () => {}
};
globalThis.window = fakeWindow;
globalThis.localStorage = { getItem: () => null, setItem: () => {} };
globalThis.__skylabToasts = toasts;

const src = path.join(process.cwd(), "src");
const bundle = await build({
  stdin: {
    contents: [
      'export { createPinia, setActivePinia } from "pinia";',
      'export { useAppStore } from "./src/store/app";',
      'export { ipcRouters } from "./electron/core/IpcRouter";'
    ].join("\n"),
    resolveDir: process.cwd(),
    loader: "ts"
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  plugins: [
    {
      name: "fake-renderer-runtime",
      setup(builder) {
        builder.onResolve({ filter: /^@\// }, args => {
          const base = path.join(src, args.path.slice(2));
          return {
            path: fs.existsSync(`${base}.ts`)
              ? `${base}.ts`
              : path.join(base, "index.ts")
          };
        });
        builder.onResolve(
          { filter: /^(element-plus|\.\.\/router)$/ },
          args => ({ path: args.path, namespace: "fake" })
        );
        builder.onLoad({ filter: /.*/, namespace: "fake" }, args => ({
          contents:
            args.path === "element-plus"
              ? `const push = type => message => globalThis.__skylabToasts.push({ type, message });
                 export const ElMessage = { error: push("error"), warning: push("warning") };`
              : 'export default { currentRoute: { value: { name: "Home" } }, replace: async () => {} };'
        }));
      }
    }
  ]
});
const { createPinia, setActivePinia, useAppStore, ipcRouters } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);

const reply = (router, response) =>
  listeners.get(`${router.path}:hook`)({}, response);
const statuses = ipcRouters.SESSION.getSessionStatuses;
const resources = ipcRouters.RESOURCE.listMyResources;
const ok = data => ({ bizCode: "A1000", data, message: "successful." });
const unreachable = {
  bizCode: "B1017",
  data: null,
  message: "Could not reach the server. net::ERR_CONNECTION_REFUSED"
};

let store;
beforeEach(() => {
  toasts.length = 0;
  listeners.clear();
  setActivePinia(createPinia());
  store = useAppStore();
  store.registerListeners();
  store.loggedIn = true;
});

test("a backend outage during polling shows one quiet indicator, not a toast per poll", () => {
  for (let poll = 0; poll < 3; poll++) reply(statuses, unreachable);

  assert.deepEqual(toasts, []);
  assert.equal(store.serverUnreachable, true);
});

test("a server error during polling is also shown as unreachable", () => {
  reply(statuses, { bizCode: "B1005", data: null, message: "Bad gateway" });

  assert.equal(store.serverUnreachable, true);
});

test("the indicator clears on the next successful poll", () => {
  reply(statuses, unreachable);
  reply(statuses, ok([]));

  assert.equal(store.serverUnreachable, false);
  assert.deepEqual(toasts, []);
});

test("a successful resource refresh also clears the indicator", () => {
  reply(statuses, unreachable);
  reply(resources, ok([]));

  assert.equal(store.serverUnreachable, false);
});

test("an expired login is not reported as an unreachable server", () => {
  let expired = 0;
  fakeWindow.addEventListener("skylab:auth-expired", () => expired++);

  reply(statuses, { bizCode: "B1001", data: null, message: "Not logged in." });

  assert.equal(store.serverUnreachable, false);
  assert.ok(expired >= 1);
});

test("stopping the poller (logout) drops a stale indicator", () => {
  reply(statuses, unreachable);
  store.stopSessionPolling();

  assert.equal(store.serverUnreachable, false);
});
