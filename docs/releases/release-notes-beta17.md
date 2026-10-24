SkyLab Connect Windows x64 beta.17

- RDP 連線前檢查失敗時，改為顯示單一說明對話框，提醒 Linux 使用者透過 SSH 自行安裝並啟用 xrdp；沒有桌面環境時，也需自行安裝 Xfce 等桌面。
- Windows 主機另提示啟用內建遠端桌面，避免誤導安裝 xrdp。
- 保留「主機拒絕連線」與「連不到連接埠」的不同原因；網路不通時會先提醒檢查主機及安全連線。
- 關閉提示後可以重新按 RDP；已可連線的主機維持原本的直接開啟流程。

本版本只提供提示，不會自動安裝套件、執行 SSH 指令或變更 VM 設定。

驗證：RDP 提示對話框的三語系、明暗模式與兩種錯誤原因視覺檢查，以及 SSH／RDP 測試、TypeScript、ESLint 與正式建置通過。

SkyLab Connect 本身未簽章；內附 WireGuard 前置安裝程式為 WireGuard LLC 簽章版本。安裝前請從系統匣結束舊程式。

完整桌面原始碼及建置所需共用前端元件附於 `SkyLab-Connect-Source-v0.2.0-beta.17.zip`。
基底：[beta.16](https://github.com/SkyLab-tw/SkyLab-Connect/releases/tag/v0.2.0-beta.16)
對應原始碼以本版發行附件 ZIP 為準；舊 tag 的 GitHub 自動 Source ZIP 不含完整客戶端。
