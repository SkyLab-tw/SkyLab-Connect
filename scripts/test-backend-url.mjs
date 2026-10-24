import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";

/* 後端網址的規則：設定頁即時提示與主程序存檔共用同一支，兩邊不會各說各話 */
const bundle = await build({
  entryPoints: ["electron/utils/BackendUrlUtils.ts"],
  bundle: true,
  write: false,
  platform: "node",
  format: "esm"
});
const { default: BackendUrlUtils } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);
const parse = value => BackendUrlUtils.parse(value);

test("https URLs are accepted and normalized without a trailing slash", () => {
  assert.deepEqual(parse("  https://ntub.skylab-tw.com/  "), {
    ok: true,
    url: "https://ntub.skylab-tw.com"
  });
});

test("a bare host gets https:// added", () => {
  assert.deepEqual(parse("ntub.skylab-tw.com"), {
    ok: true,
    url: "https://ntub.skylab-tw.com"
  });
  assert.deepEqual(parse("localhost:8000"), {
    ok: true,
    url: "https://localhost:8000"
  });
});

test("only the origin of a URL pasted from the browser is kept", () => {
  assert.deepEqual(parse("https://ntub.skylab-tw.com/login?next=/home#top"), {
    ok: true,
    url: "https://ntub.skylab-tw.com"
  });
  assert.deepEqual(parse("ntub.skylab-tw.com/login"), {
    ok: true,
    url: "https://ntub.skylab-tw.com"
  });
});

test("plain http is only allowed for local testing", () => {
  assert.deepEqual(parse("http://localhost:8000"), {
    ok: true,
    url: "http://localhost:8000"
  });
  assert.equal(parse("http://127.0.0.1:8000").ok, true);
  assert.deepEqual(parse("http://ntub.skylab-tw.com"), {
    ok: false,
    problem: "insecure"
  });
  assert.deepEqual(parse("ftp://ntub.skylab-tw.com"), {
    ok: false,
    problem: "insecure"
  });
});

test("empty, malformed and credential URLs report the reason", () => {
  assert.deepEqual(parse("   "), { ok: false, problem: "required" });
  assert.deepEqual(parse("ntub skylab"), { ok: false, problem: "invalid" });
  assert.deepEqual(parse("https://"), { ok: false, problem: "invalid" });
  assert.deepEqual(parse("https://user:pw@ntub.skylab-tw.com"), {
    ok: false,
    problem: "credentials"
  });
  assert.deepEqual(parse("user@ntub.skylab-tw.com"), {
    ok: false,
    problem: "credentials"
  });
});
