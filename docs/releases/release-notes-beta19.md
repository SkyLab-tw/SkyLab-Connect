SkyLab Connect Windows x64 beta.19

- 安裝檔不再內建任何學校的網址。第一次開啟時，首頁會請你輸入學校 SkyLab 平台的網址（就是平常用瀏覽器登入的網址），之後可以在「設定」修改。
- 從舊版更新的北商使用者不用重新設定：舊版內建的 `https://skylab-tw.com`、`https://skylab.ntubimdbirc.tw` 與 `http://localhost:8000` 會自動改成 `https://ntub.skylab-tw.com`，更新後重新登入一次即可。自己填過的網址不受影響。
- 網址可以只填網域（例如 `school.skylab-tw.com`），會自動補上 `https://`；從瀏覽器貼上完整網址也可以，只會保留網域部分。含帳號密碼的網址會被拒絕。
- 自本版起由 [SkyLab-tw/SkyLab-Connect](https://github.com/SkyLab-tw/SkyLab-Connect) 發佈。

`skylab-tw.com` 已改為 SkyLab 官網，beta.18 以前的版本因此無法登入。還沒更新的使用者，可以先到「設定」把後端網址改成 `https://ntub.skylab-tw.com`。

本版延續 beta.18 的其他功能。下載安裝版 `SkyLab-Connect-Setup.exe`，或使用免安裝版 `SkyLab-Connect-Portable.exe`。

SkyLab Connect 採 AGPL-3.0 授權；對應原始碼與建置方式附於 `SkyLab-Connect-Source-v0.2.0-beta.19.zip`。發行檔延續現有的未簽章建置方式；內附的 WireGuard 安裝程式維持上游簽章。

對應原始碼：[發行附件 ZIP](https://github.com/SkyLab-tw/SkyLab-Connect/releases/download/v0.2.0-beta.19/SkyLab-Connect-Source-v0.2.0-beta.19.zip)。
