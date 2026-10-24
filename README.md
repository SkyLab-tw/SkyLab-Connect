# SkyLab Connect

SkyLab Connect 的獨立桌面客戶端原始碼與 Windows 發行版本。
透過 SkyLab 網頁登入，建立 WireGuard 安全通道，並開啟課程機器的 RDP／SSH 連線。

- [下載 Windows 安裝程式](https://github.com/SkyLab-tw/SkyLab-Connect/releases/latest/download/SkyLab-Connect-Setup.exe)
- [下載 Windows Portable](https://github.com/SkyLab-tw/SkyLab-Connect/releases/latest/download/SkyLab-Connect-Portable.exe)
- [所有版本與各版原始碼附件](https://github.com/SkyLab-tw/SkyLab-Connect/releases)

Windows x64 發行版本包含經 Microsoft 簽章的官方 WireGuard MSI。現有測試版的 SkyLab Connect 本身尚未簽章，Windows 可能顯示 SmartScreen 提示。

## 開發與建置

需要 Windows x64、Node.js 22.12 以上與 npm。請在此 repo 根目錄執行：

```powershell
npm ci
npm run dev
```

開發介面位於 `http://127.0.0.1:3344`。第一次開啟時在首頁輸入學校 SkyLab 平台的網址（之後可在設定頁修改）；登入與資源連線仍需要運作中的 SkyLab 後端。

```powershell
npm run lint
npm test
npm run audit:security
npm run build
npm run test:connection-ui
```

`test:connection-ui` 會以隱藏的 Electron 視窗驗證建置後的深色／淺色介面，必須先執行 `build`。

```powershell
# 測試用未簽章安裝版與 Portable
npm run build:electron:win:unsigned

# 正式簽章建置，需另行設定簽章憑證
npm run build:electron:win
```

安裝檔輸出至 `release/<version>/`。請勿提交 node_modules、建置產物、憑證、token 或發行暫存狀態。

## 發佈新版本

1. 更新 `package.json` 與 `package-lock.json` 的版號，新增 `docs/releases/release-notes-beta<N>.md`（正式版用 `release-notes-v<版號>.md`），經 PR 合併到 `main`。
2. 在合併後的 commit 建立同名 tag，推送到 `SkyLab-tw/SkyLab-Connect`，例如 `git tag v0.2.0-beta.19` 後 `git push <remote> v0.2.0-beta.19`。
3. [Release workflow](.github/workflows/release.yml) 會重跑全部檢查，建置未簽章的安裝版與 Portable，連同原始碼 ZIP 與 `SHA256SUMS.txt` 直接發佈成最新版。已安裝的 SkyLab Connect 會在一小時內提示更新。

tag 與版號不一致、缺少發佈說明，或同版 Release 已存在時，workflow 會停止，不會覆蓋既有版本。

## 來源與分支

- `main`：保留已發布 beta.18 的功能與 RDP／SSH 修正，完成獨立 repo 路徑調整。
- `archive/monorepo-main-2026-10-23`：保留主專案 10/23 的另一條客戶端版本，該版原始版本號為 beta.5。
- 客戶端位於 repo 根目錄；原本引用主專案的共用樣式與章魚元件已移入 `src/shared/web/`，不需要相鄰的主專案資料夾。
- [搬移來源與驗證方式](docs/MIGRATION.md)、[原架構文件](docs/wireguard-desktop-architecture.zh-TW.md)。原架構與樣式文件記錄搬移前的主專案結構，獨立 repo 的操作方式以本 README 為準。

## 與平台整合

後端登入、下載與 WireGuard API 由 [SkyLab](https://github.com/SkyLab-tw/SkyLab) 維護。API 路徑、下載設定、跨 repo 更新方式與舊版來源下載方式見 [整合說明](docs/INTEGRATION.md)。

## 授權

SkyLab Connect 採 AGPL-3.0，完整授權見 [LICENSE](LICENSE)。原始 Electron／Vue 範本的 MIT 聲明保留於 [NOTICE](NOTICE) 與 [範本授權](docs/template-LICENSE-MIT.txt)，其他元件聲明見 [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt)。
