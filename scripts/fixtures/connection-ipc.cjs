const { contextBridge } = require("electron");
const handlers = new Map();
const tunnel = {
  running: true,
  connected: true,
  connectionError: null,
  tunnels: [],
  latestHandshakeAt: Date.now()
};
const emit = (channel, data, bizCode = "A1000") => {
  for (const fn of handlers.get(channel) || []) {
    fn({}, { bizCode, data, message: "Regression test scenario" });
  }
};
const settings = { language: "zh-TW", backendUrl: "https://campus.example.org" };
const sent = [];
contextBridge.exposeInMainWorld("connectionTestReply", emit);
contextBridge.exposeInMainWorld("connectionTestSent", () => sent.slice());
contextBridge.exposeInMainWorld("electronIpcRenderer", {
  send(channel, params) {
    sent.push({ channel, params });
    setTimeout(() => {
      const data =
        channel === "auth/getAuthState"
          ? { loggedIn: true }
          : channel === "settings/getSettings"
            ? settings
            : channel === "settings/saveSettings"
              ? { ...settings, ...params }
              : ["tunnel/getStatus", "tunnel/refresh"].includes(channel)
                ? tunnel
                : [];
      emit(channel + ":hook", data);
    }, 20);
  },
  on(channel, fn) {
    handlers.set(channel, [...(handlers.get(channel) || []), fn]);
  },
  removeListener(channel, fn) {
    handlers.set(
      channel,
      (handlers.get(channel) || []).filter(x => x !== fn)
    );
  },
  removeAllListeners(channel) {
    handlers.delete(channel);
  }
});
