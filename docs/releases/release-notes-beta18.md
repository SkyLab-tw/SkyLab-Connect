SkyLab Connect Windows x64 beta.18

- 修正 Windows RDP 可能因短暫的 TCP 前置檢查逾時而無法開啟遠端桌面：所有合法的目標 IP 與連接埠均直接交由 Windows 內建遠端桌面處理連線與重試。
- 修正 RDP、SSH、資源載入與授權更新等操作錯誤，會誤將「已安全連線」的盾牌與邊框變紅。安全連線列現在只依通道本身的狀態顯示異常。
- 新增不同 IP、自訂連接埠、主機尚未就緒及啟動失敗的回歸測試；加入深色、淺色介面的錯誤情境檢查，並納入 Windows 自動測試流程。

這項修正適用所有 Windows RDP 連線目標。主機未開機、未啟用遠端桌面或防火牆阻擋時，仍須處理主機端原因。

本版延續 beta.17 的其他功能。下載安裝版 `SkyLab-Connect-Setup.exe`，或使用免安裝版 `SkyLab-Connect-Portable.exe`。

SkyLab Connect 採 AGPL-3.0 授權；對應原始碼與建置方式附於 `SkyLab-Connect-Source-v0.2.0-beta.18.zip`。發行檔延續現有的未簽章建置方式；內附的 WireGuard 安裝程式維持上游簽章。

來源 commit：[`{source_commit}`](https://github.com/1Ray0/Campus-Cloud/commit/{source_commit})。
