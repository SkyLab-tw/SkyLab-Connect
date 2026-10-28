import assert from "node:assert/strict";
import { beforeEach, test } from "node:test";
import { build } from "esbuild";

const bundle = await build({
  stdin: {
    contents: `export {default as SystemController} from './electron/controller/SystemController';
export {default as BeanFactory} from './electron/core/BeanFactory';
export {BusinessError, ResponseCode} from './electron/core/BusinessError';`,
    resolveDir: ".",
    loader: "ts"
  },
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  plugins: [
    {
      name: "controller-runtime",
      setup(builder) {
        builder.onResolve({ filter: /(^|\/)Logger$/ }, () => ({
          path: "Logger",
          namespace: "fake"
        }));
        builder.onResolve({ filter: /\/utils\/PathUtils$/ }, () => ({
          path: "PathUtils",
          namespace: "fake"
        }));
        builder.onLoad({ filter: /.*/, namespace: "fake" }, () => ({
          contents: "export default {info(){},error(){}};"
        }));
      }
    }
  ]
});
const { SystemController, BeanFactory, BusinessError, ResponseCode } =
  await import(
    `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
  );
let calls;
beforeEach(() => {
  calls = [];
  BeanFactory.clear();
  BeanFactory.setBean("systemService", {
    openSsh: async (...args) => calls.push(args)
  });
});
function request(args) {
  const replies = [];
  return {
    args,
    channel: "test",
    event: { reply: (_channel, response) => replies.push(response) },
    replies
  };
}

const alias = "skylab-" + "a".repeat(64);
function sshService(resourceType, hostKeyAlias = alias) {
  BeanFactory.setBean("SkyLabService", {
    getSshTarget: async vmid => {
      assert.equal(vmid, 212);
      return hostKeyAlias ? { hostKeyAlias, resourceType } : { resourceType };
    }
  });
}

test("SSH uses the API identity and ignores a renderer-supplied alias", async () => {
  sshService("lxc");
  const req = request({
    vmid: 212,
    host: "192.168.60.109",
    port: 22,
    hostKeyAlias: "untrusted"
  });
  await new SystemController().openSsh(req);
  assert.deepEqual(calls, [[22, "root", "192.168.60.109", alias]]);
  assert.equal(req.replies[0].bizCode, "A1000");
});

test("containers always log in as root, whatever username the renderer sends", async () => {
  sshService("lxc");
  const req = request({
    vmid: 212,
    host: "192.168.60.109",
    port: 22,
    username: "student"
  });
  await new SystemController().openSsh(req);
  assert.deepEqual(calls, [[22, "root", "192.168.60.109", alias]]);
});

test("VMs log in with the username typed in the dialog", async () => {
  sshService("qemu", null);
  const req = request({
    vmid: 212,
    host: "192.168.60.109",
    port: 2222,
    username: "  gpu_user  "
  });
  await new SystemController().openSsh(req);
  assert.deepEqual(calls, [[2222, "gpu_user", "192.168.60.109", undefined]]);
  assert.equal(req.replies[0].bizCode, "A1000");
});

test("VMs without a valid username stop before the terminal opens", async () => {
  sshService("qemu");
  for (const username of [
    undefined,
    "",
    "   ",
    "root; rm -rf ~",
    "a b",
    "$(id)",
    "-oProxyCommand=x",
    "x".repeat(33),
    42
  ]) {
    const req = request({
      vmid: 212,
      host: "192.168.60.109",
      port: 22,
      username
    });
    await new SystemController().openSsh(req);
    assert.equal(req.replies[0].bizCode, "B1023", String(username));
  }
  assert.equal(calls.length, 0);
});

test("a resource the API does not mark as a container is treated as a VM", async () => {
  // 渲染程序以為是容器而沒問帳號：主程序依後端回的類型擋下，不會退回 root
  sshService("");
  const req = request({ vmid: 212, host: "192.168.60.109", port: 22 });
  await new SystemController().openSsh(req);
  assert.equal(calls.length, 0);
  assert.equal(req.replies[0].bizCode, "B1023");
});

test("denied resource lookup stops SSH before the terminal opens", async () => {
  BeanFactory.setBean("SkyLabService", {
    getSshTarget: async () => {
      throw new BusinessError(ResponseCode.NOT_LOGGED_IN);
    }
  });
  const req = request({
    vmid: 212,
    host: "192.168.60.109",
    port: 22,
    username: "student"
  });
  await new SystemController().openSsh(req);
  assert.equal(calls.length, 0);
  assert.equal(req.replies[0].bizCode, "B1001");
});

test("RDP service errors retain their actionable code through IPC", async () => {
  BeanFactory.setBean("systemService", {
    openRdp: async () => {
      throw new BusinessError(ResponseCode.RDP_REFUSED);
    }
  });
  const req = request({ host: "192.168.60.109", port: 3389 });
  new SystemController().openRdp(req);
  await new Promise(resolve => setImmediate(resolve));
  assert.equal(req.replies[0].bizCode, "B1019");
});

test("links still open when the school platform URL is not set yet", async () => {
  BeanFactory.setBean("systemService", {
    openUrl: async (...args) => calls.push(args)
  });
  BeanFactory.setBean("settingsService", {
    getBackendUrl: async () => {
      throw new BusinessError(ResponseCode.BACKEND_NOT_CONFIGURED);
    }
  });
  const req = request({ url: "https://github.com/SkyLab-tw/SkyLab-Connect" });
  new SystemController().openUrl(req);
  await new Promise(resolve => setTimeout(resolve, 0));
  assert.deepEqual(calls, [
    ["https://github.com/SkyLab-tw/SkyLab-Connect", undefined]
  ]);
  assert.equal(req.replies[0].bizCode, "A1000");
});
