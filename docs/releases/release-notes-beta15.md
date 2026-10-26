SkyLab Connect Windows x64 beta.15

- 修正按 SSH 後命令視窗一閃即逝：改為開啟獨立、可互動的終端機，可輸入密碼；SSH 結束或連線失敗後保留視窗與錯誤訊息。
- 設定頁移除儲存按鈕；主題、語言及開機啟動點選後立即套用並自動保存。
- 伺服器網址在離開輸入欄位或按 Enter 後自動套用，保留網址檢查及切換伺服器前的登出確認。
- 連續快速切換設定時依序保存最後的選擇，避免舊回覆覆蓋新選擇；保存設定與登入憑證輪替互不覆蓋。
- 保留 beta.14 的帳號連線金鑰隔離、取消登入及重複提示修正。

相關登入、SSH、設定及通道回歸測試、TypeScript、ESLint 與正式建置通過。尚未使用真實帳號完成 SSH 登入驗證。

SkyLab Connect 本身未簽章；內附 WireGuard 前置安裝程式為 WireGuard LLC 簽章版本。安裝前請從系統匣結束舊程式。

完整桌面原始碼附於 `SkyLab-Connect-Source-v0.2.0-beta.15.zip`。
基底：[beta.14](https://github.com/SkyLab-tw/SkyLab-Connect/releases/tag/v0.2.0-beta.14)
對應原始碼以本版發行附件 ZIP 為準；舊 tag 的 GitHub 自動 Source ZIP 不含完整客戶端。
