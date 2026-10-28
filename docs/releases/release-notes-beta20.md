SkyLab Connect Windows x64／macOS beta.20

- 新增 macOS 版：下載 `SkyLab-Connect-mac-universal.dmg`，Intel 與 Apple Silicon 都能用。DMG 未簽章、未公證，第一次開啟時請到「系統設定 → 隱私權與安全性」允許開啟。第一次連線會要求一次管理員授權來安裝 WireGuard 元件。
- SSH 連線虛擬機（VM）時改為詢問登入帳號，請填申請 VM 時設定的帳號；會依平台與 VM 記住上次填的帳號。容器（LXC）維持以 `root` 登入，不會詢問。舊版一律用 `root` 連 VM 而無法登入，Windows 使用者請更新到本版。

本版延續 beta.19 的其他功能。Windows 下載安裝版 `SkyLab-Connect-Setup.exe`，或使用免安裝版 `SkyLab-Connect-Portable.exe`；macOS 下載 `SkyLab-Connect-mac-universal.dmg`。

SkyLab Connect 採 AGPL-3.0 授權；對應原始碼與建置方式附於 `SkyLab-Connect-Source-v0.2.0-beta.20.zip`。發行檔延續現有的未簽章建置方式；Windows 內附的 WireGuard 安裝程式維持上游簽章，macOS 內附的 WireGuard 執行檔授權見 `vendor/wireguard-mac/THIRD_PARTY_NOTICES.txt`。

對應原始碼：[發行附件 ZIP](https://github.com/SkyLab-tw/SkyLab-Connect/releases/download/v0.2.0-beta.20/SkyLab-Connect-Source-v0.2.0-beta.20.zip)。
