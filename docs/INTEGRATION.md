# SkyLab 平台與獨立客戶端整合

| 維護位置 | 職責 |
| --- | --- |
| [SkyLab](https://github.com/SkyLab-tw/SkyLab) | 網頁、裝置授權、token、資源授權、WireGuard 控制面、平台下載入口 |
| [SkyLab-Connect](https://github.com/SkyLab-tw/SkyLab-Connect) | Electron 客戶端、共用樣式副本、Windows／macOS 建置、更新器、桌面端 CI 與發行附件 |

## API 相容性

repo 改名不會改動平台 API。客戶端繼續使用以下路徑：

- `POST /api/v1/desktop-client/auth/device-code`：取得瀏覽器登入網址與裝置碼。
- `GET /api/v1/desktop-client/auth/poll?code=...`：讀取核准結果；後端的 `access_token`／`refresh_token` 由客戶端轉為內部欄位。
- `POST /api/v1/desktop-client/wireguard/connect`、`refresh`、`disconnect`：建立、續約與撤銷通道。
- 網頁的 `POST /api/v1/desktop-client/auth/approve`、`deny` 仍由平台處理。

平台移除的是客戶端原始碼與桌面端 CI，裝置登入路由、WireGuard 服務及其測試仍保留。變更這些 API 時，請同時檢查客戶端 `electron/service/SkyLabService.ts`、型別與對應回歸測試；發布前先讓既有客戶端仍可使用。

## 下載與既有安裝

平台網頁預設連到 `GET /api/v1/desktop-client/download`。`VITE_API_URL` 可指定不同的 API 網域；後端用 `DESKTOP_CLIENT_DOWNLOAD_URL` 決定實際下載位置，預設為本 repo 的 GitHub release 安裝檔。需要直接下載覆寫時才設定 `VITE_DESKTOP_CLIENT_DOWNLOAD_URL`。

macOS 安裝檔固定為 `https://github.com/SkyLab-tw/SkyLab-Connect/releases/latest/download/SkyLab-Connect-mac-universal.dmg`（Intel 與 Apple Silicon 通用）。平台下載入口要依使用者的作業系統選擇 macOS 或 Windows 安裝檔。

既有部署請在下次部署時將舊 repo 網址更新為 `https://github.com/SkyLab-tw/SkyLab-Connect/releases/latest/download/SkyLab-Connect-Setup.exe`。舊網址由 GitHub 重新導向，既有安裝程式使用的舊更新 API 也可沿用重新導向。新建置的更新器已使用 `SkyLab-tw/SkyLab-Connect`。

本次搬移不替換既有 EXE。既有 release 的對應原始碼請下載該版的 `SkyLab-Connect-Source-v<version>.zip` 附件；部分舊 tag 建立於只有下載說明的 repo 時期，GitHub 自動產生的 Source code ZIP 不代表該版完整客戶端。未附 Source ZIP 的更早期版本，請參考保留的客戶端歷史。

## 開發與發行

1. 客戶端在本 repo 根目錄執行 `npm ci`、`npm run lint`、`npm test`、`npm run audit:security`、`npm run build`、`npm run test:connection-ui`。
2. `src/shared/web/` 是已提交的客戶端輸入；平台樣式變更需要明確移植到這裡並重新驗證，不依賴相鄰的主專案資料夾。
3. 發布新版本時，先提交版本號、lockfile 與發佈說明，再從該 commit 推送 tag；[Release workflow](../.github/workflows/release.yml) 會從 tag 建置並發佈，安裝檔名保持 `SkyLab-Connect-Setup.exe`／`SkyLab-Connect-Portable.exe`／`SkyLab-Connect-mac-universal.dmg`，並附上該 commit 的原始碼 ZIP，讓 release tag 與建置來源一致。步驟見 [README](../README.md#發佈新版本)。
4. 平台端只需部署下載設定與 API 變更；桌面端建置和測試在本 repo 的 CI 執行。

主專案另一條 10/23 版本仍保留於 `archive/monorepo-main-2026-10-23`。來源與驗證紀錄見 [MIGRATION.md](MIGRATION.md)。
