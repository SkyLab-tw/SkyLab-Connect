# 客戶端獨立 repo 搬移紀錄

日期：2026-10-24（Asia/Taipei）。

## 可追溯來源

| 來源 | 原 commit | 保留位置 |
| --- | --- | --- |
| 本機 `fix/desktop-rdp-status`，beta.18 | `7ce6d7e27deb2367b97f1f6698360b285c8517c9` | `main` 的匯入歷史 |
| `SkyLab-tw/SkyLab` 主分支 10/23 版本 | `e627f3e1e484d79f5c75aeadf6e9867a2868b783` | `archive/monorepo-main-2026-10-23` |
| 本機 beta.17 分支 | `a8ab0d2f` | 已包含於 beta.18 的提交歷史 |

原主專案的 `desktop-client/` 提交經路徑篩選後移至新 repo 根目錄，保留作者、時間、提交訊息及客戶端提交間的歷史關係。路徑與父提交變更會產生新的 commit SHA。匯入時，beta.18 的 73 筆提交與主專案另一版的 61 筆提交，其最終 tree SHA 分別與原來源 `desktop-client` 子目錄完全相符：

- beta.18：`8cc15205c608e4d2b9c1bc5e9ba6f1c5cc35e6ba`
- 主專案版本：`cc2e41af15840d39fb30c7911d6c1fc5228e5741`

後續獨立化提交另行加入 beta.18 使用的原主專案共用 SCSS、章魚 JavaScript 元件及圖示來源，調整 Vite、TypeScript、圖示產生腳本與 CI 路徑。更新器與「關於」頁改為指向 `SkyLab-tw/SkyLab-Connect`。

三個本機來源的 `desktop-client` 都沒有未提交的追蹤檔修改；beta.17 已包含於 beta.18。根目錄的發行暫存 JSON、診斷腳本、畫面擷取與本機 token 不屬於應用程式建置來源，未匯入。beta.15–beta.18 的發行說明另存於 `docs/releases/`。

## 遷移後檢查

從此 repo 根目錄執行 `npm ci`、`npm run lint`、`npm test`、`npm run audit:security`、`npm run build`，最後執行 `npm run test:connection-ui`。CI 使用 Windows 與 Node.js 22。原 lockfile 缺少 Windows 簽章工具的相依紀錄，於獨立化時補齊。

本機 Windows／Node.js 24.15 的驗證結果：lint 與正式 build 通過；服務及單元回歸測試 77 項通過、1 項因平台條件跳過；Electron 深色／淺色介面 14 個情境通過。依賴套用原有 semver 範圍內的相容修補（包括 Electron 44.9.3、Vite 8.3.5、undici 7.30.1 與 fast-uri 3.1.9），`npm audit` 為 0 個漏洞。沒有升級應用程式版本號，也沒有重發 beta.18 安裝檔。

repo 改名沿用相同 GitHub repository ID、既有 release 與附件。既有已發布的 EXE 不會因這次原始碼搬移而重新建置或替換。

完成以上驗證且兩條分支都已推送後，主專案的 `desktop-client/` 才可另行移除。主專案內的桌面端 CI、文件與其他指向該資料夾的路徑也應同步調整。
