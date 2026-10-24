SkyLab Connect Windows x64 beta.16

- 修正 SSH、RDP 與詳細資料按鈕擠壓：卡片的詳細資料按鈕移至右上角；列表模式分開安排名稱、連線按鈕與詳細資料。依內容寬度調整排版，長名稱與不同語系不會互相覆蓋。
- SSH 改用從已登入 SkyLab API 查得的資源申請識別碼記錄主機金鑰，避免重新申請後沿用相同 IP／VMID 時撞到舊機器的紀錄。
- 保留 StrictHostKeyChecking=accept-new：同一資源的金鑰異常變更仍會拒絕連線。舊版 API 沒有資源申請識別碼時，保留原本的 IP 驗證。
- RDP 開啟前先檢查目的連接埠；拒絕連線或無法連到時，在程式內顯示服務、桌面環境及防火牆的檢查提示，避免開啟必然失敗的遠端桌面視窗。
- SSH／RDP 啟動期間防止重複點擊；啟動錯誤只顯示一次。

本版本不會替 VM 安裝桌面或 RDP 伺服器。只有 Ubuntu Server、未啟用遠端桌面服務的 VM，仍需先配置機器。

驗證：900／960／1280px、卡片／列表、三個語系與明暗主題共 36 種排版檢查，以及詳細資料對話框視覺檢查通過。15 項 SSH／RDP／資源身份測試通過，Windows OpenSSH 實測確認 IP 重用不衝突、同一身份換金鑰仍被拒絕；資源、登入與通道回歸測試、TypeScript、ESLint、正式建置通過。

SkyLab Connect 本身未簽章；內附 WireGuard 前置安裝程式為 WireGuard LLC 簽章版本。安裝前請從系統匣結束舊程式。

完整桌面原始碼附於 `SkyLab-Connect-Source-v0.2.0-beta.16.zip`。
基底：[beta.15](https://github.com/SkyLab-tw/SkyLab-Connect/releases/tag/v0.2.0-beta.15)
對應原始碼以本版發行附件 ZIP 為準；舊 tag 的 GitHub 自動 Source ZIP 不含完整客戶端。
