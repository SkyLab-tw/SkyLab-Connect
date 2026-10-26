import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";

const bundle = await build({
  entryPoints: ["electron/repository/SettingsRepository.ts"],
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  plugins: [
    {
      name: "fake-settings-storage",
      setup(builder) {
        builder.onResolve({ filter: /^electron$/ }, () => ({
          path: "electron",
          namespace: "fake"
        }));
        builder.onResolve({ filter: /\/BaseRepository$/ }, () => ({
          path: "BaseRepository",
          namespace: "fake"
        }));
        builder.onLoad({ filter: /.*/, namespace: "fake" }, args => ({
          contents:
            args.path === "electron"
              ? `export const safeStorage = {
              isEncryptionAvailable: () => true,
              encryptString: value => Buffer.from(value),
              decryptString: value => value.toString()
            };`
              : `export default class BaseRepository {
              async findById() { return this.record; }
              async updateById(_id, value) { this.record = value; return value; }
            }`
        }));
      }
    }
  ]
});
const { default: SettingsRepository } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);

test("a new install has no backend URL until the user enters one", async () => {
  const repository = new SettingsRepository();
  const settings = await repository.get();
  assert.equal(settings.backendUrl, "");
  assert.equal(repository.record.backendUrl, "");
});

/* 舊版內建過的網址都只有北商用過，讀設定時直接改到北商現在的網址 */
for (const oldUrl of [
  "http://localhost:8000",
  "http://localhost:8000/",
  "https://skylab.ntubimdbirc.tw",
  "https://skylab.ntubimdbirc.tw/",
  "https://skylab-tw.com",
  "https://skylab-tw.com/"
]) {
  test(`former default ${oldUrl} migrates to NTUB and clears old credentials`, async () => {
    const repository = new SettingsRepository();
    repository.record = {
      _id: "1",
      backendUrl: oldUrl,
      token: "old-token",
      refreshToken: "old-refresh",
      language: "zh-TW"
    };
    const settings = await repository.get();
    assert.equal(settings.backendUrl, "https://ntub.skylab-tw.com");
    assert.equal(settings.token, "");
    assert.equal(settings.refreshToken, "");
    assert.equal(repository.record.backendUrl, "https://ntub.skylab-tw.com");
    assert.equal(repository.record.token, "");
  });
}

for (const customUrl of [
  "https://skylab.school.edu.tw",
  "https://ntub.skylab-tw.com"
]) {
  test(`a user configured server ${customUrl} is preserved`, async () => {
    const repository = new SettingsRepository();
    repository.record = {
      _id: "1",
      backendUrl: customUrl,
      token: "my-token",
      refreshToken: "my-refresh",
      language: "zh-TW"
    };
    const settings = await repository.get();
    assert.equal(settings.backendUrl, customUrl);
    assert.equal(settings.token, "my-token");
    assert.equal(settings.refreshToken, "my-refresh");
  });
}
