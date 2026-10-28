import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";

const bundle = await build({
  entryPoints: ["electron/utils/SshLoginUtils.ts"],
  bundle: true,
  write: false,
  platform: "node",
  format: "esm"
});
const { default: SshLoginUtils } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);

test("containers are detected by the PVE resource type", () => {
  assert.equal(SshLoginUtils.isContainer("lxc"), true);
  assert.equal(SshLoginUtils.isContainer("LXC"), true);
  for (const type of ["qemu", "", null, undefined, "lxc "])
    assert.equal(SshLoginUtils.isContainer(type), false, String(type));
});

test("containers use root and VMs use the typed username", () => {
  assert.equal(SshLoginUtils.loginUser("lxc", undefined), "root");
  assert.equal(SshLoginUtils.loginUser("lxc", "student"), "root");
  assert.equal(SshLoginUtils.loginUser("qemu", "student"), "student");
  assert.equal(SshLoginUtils.loginUser("qemu", " gpu-user "), "gpu-user");
  assert.equal(SshLoginUtils.loginUser("qemu", "root"), "root");
  assert.equal(SshLoginUtils.loginUser("qemu", undefined), null);
  assert.equal(SshLoginUtils.loginUser("qemu", ""), null);
});

test("usernames that could break the terminal command are rejected", () => {
  for (const name of [
    "_svc",
    "a",
    "user01",
    "web-dev",
    "samba$",
    "x".repeat(32)
  ])
    assert.equal(SshLoginUtils.isValidUsername(name), true, name);
  for (const name of [
    "",
    "1user",
    "-oProxyCommand=x",
    "a b",
    "a;b",
    "a&b",
    "a|b",
    "$(id)",
    "`id`",
    'a"b',
    "a'b",
    "a\nb",
    "a@b",
    "x".repeat(33),
    null,
    42
  ])
    assert.equal(SshLoginUtils.isValidUsername(name), false, String(name));
});
