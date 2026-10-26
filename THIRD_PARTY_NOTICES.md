# SkyLab Connect — Third-party notices

SkyLab Connect is licensed under AGPL-3.0; see [LICENSE](LICENSE). The original Electron + Vue + Vite template attribution is reproduced in [NOTICE](NOTICE) and [docs/template-LICENSE-MIT.txt](docs/template-LICENSE-MIT.txt).

## Application runtime

The About page shows the exact dependency versions for each build. The dependency lockfile is [package-lock.json](package-lock.json) in this repository.

| Package | License | Upstream |
| --- | --- | --- |
| electron | MIT | https://github.com/electron/electron |
| @material-design-icons/font | Apache-2.0 | https://github.com/marella/material-design-icons |
| @seald-io/nedb | MIT | https://github.com/seald/nedb |
| electron-log | MIT | https://github.com/megahertz/electron-log |
| element-plus | MIT | https://github.com/element-plus/element-plus |
| pinia | MIT | https://github.com/vuejs/pinia |
| tree-kill | MIT | https://github.com/pkrumins/node-tree-kill |
| vue | MIT | https://github.com/vuejs/core |
| vue-i18n | MIT | https://github.com/intlify/vue-i18n |
| vue-router | MIT | https://github.com/vuejs/router |

## Bundled WireGuard installer

The unmodified, Authenticode-signed WireGuard for Windows MSI and its own notices live under [vendor/wireguard/](vendor/wireguard/). The upstream project is [WireGuard for Windows](https://git.zx2c4.com/wireguard-windows/), licensed under MIT. Its notices are copied into the app resources with the installer.

## Shared UI sources and build tooling

`src/shared/web/` contains the SCSS and octopus JavaScript sources copied from the SkyLab project at original commit `7ce6d7e27deb2367b97f1f6698360b285c8517c9`. These are local, versioned client inputs; a build does not read another checkout. SkyLab's original template notices are retained in NOTICE.

Vite, TypeScript, ESLint, Sass and electron-builder are build tools. Their licenses and transitive dependencies remain in their package metadata and the npm lockfile. Platform backend, React web frontend and documentation-site dependencies are maintained separately in [SkyLab](https://github.com/SkyLab-tw/SkyLab/blob/main/THIRD_PARTY_NOTICES.md).
