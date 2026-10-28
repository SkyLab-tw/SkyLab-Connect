import assert from "node:assert/strict";
import { test } from "node:test";
import { build } from "esbuild";

const bundle = await build({
  entryPoints: ["electron/service/SkyLabService.ts"],
  bundle: true,
  write: false,
  platform: "node",
  format: "esm",
  plugins: [
    {
      name: "identity-runtime",
      setup(builder) {
        builder.onResolve({ filter: /^(electron)$|\/core\/Logger$/ }, args => ({
          path: args.path,
          namespace: "fake"
        }));
        builder.onLoad({ filter: /.*/, namespace: "fake" }, args => ({
          contents:
            args.path === "electron"
              ? "export const net = {};"
              : "export default {warn(){},error(){},info(){}};"
        }));
      }
    }
  ]
});
const { default: SkyLabService } = await import(
  `data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString("base64")}`
);

const first = "2e801048-422e-4761-ae26-f2fb0ddd5848";
const replacement = "1e801048-422e-4761-ae26-f2fb0ddd5849";
function setup() {
  const state = {
    url: "https://school.example.org",
    resource: { vmid: 212, type: "qemu", request_id: first, can_control: true },
    status: 200,
    paths: []
  };
  const service = new SkyLabService({ getBackendUrl: async () => state.url });
  service.request = async (method, path, options) => {
    state.paths.push({ method, path, options });
    return { status: state.status, body: JSON.stringify(state.resource) };
  };
  return { state, service };
}

test("new allocations reusing the same IP and VMID have different host identities", async () => {
  const { state, service } = setup();
  const old = (await service.getSshTarget(212)).hostKeyAlias;
  assert.match(old, /^skylab-[a-f0-9]{64}$/);
  assert.equal((await service.getSshTarget(212)).hostKeyAlias, old);
  state.resource.request_id = replacement;
  assert.notEqual((await service.getSshTarget(212)).hostKeyAlias, old);
  assert.deepEqual(state.paths[0], {
    method: "GET",
    path: "/api/v1/resources/212",
    options: { auth: true }
  });
});

test("identity stays stable across address changes and differs between servers", async () => {
  const { state, service } = setup();
  const original = (await service.getSshTarget(212)).hostKeyAlias;
  state.resource.ip_address = "192.168.60.110";
  state.resource.name = "renamed";
  state.url += "/";
  assert.equal((await service.getSshTarget(212)).hostKeyAlias, original);
  state.url = "https://other.example.org";
  assert.notEqual((await service.getSshTarget(212)).hostKeyAlias, original);
});

test("legacy resources retain address-based verification instead of a random identity", async () => {
  const { state, service } = setup();
  state.resource.request_id = null;
  assert.deepEqual(await service.getSshTarget(212), { resourceType: "qemu" });
});

test("invalid IDs, failed authorization and mismatched resources cannot yield an identity", async () => {
  const { state, service } = setup();
  for (const id of [0, -1, 1.5, NaN])
    await assert.rejects(service.getSshTarget(id));
  assert.equal(state.paths.length, 0);
  state.status = 403;
  await assert.rejects(service.getSshTarget(212));
  state.status = 200;
  state.resource.vmid = 213;
  await assert.rejects(service.getSshTarget(212));
  state.resource.vmid = 212;
  state.resource.can_control = false;
  await assert.rejects(service.getSshTarget(212));
});

test("the resource type comes from the API response, not the renderer", async () => {
  const { state, service } = setup();
  assert.equal((await service.getSshTarget(212)).resourceType, "qemu");
  state.resource.type = "lxc";
  assert.equal((await service.getSshTarget(212)).resourceType, "lxc");
  delete state.resource.type;
  assert.equal((await service.getSshTarget(212)).resourceType, "");
});
