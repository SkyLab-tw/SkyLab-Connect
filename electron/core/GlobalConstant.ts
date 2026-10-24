class GlobalConstant {
  public static DEFAULT_LANGUAGE = "zh-TW";
  /**
   * 已發出的舊版內建過的後端網址，都只有北商用過，讀設定時改到北商現在的網址。
   * 安裝檔給所有學校共用，之後不再內建任何學校的網址，這份清單也不再新增。
   */
  public static RETIRED_BACKEND_URLS = [
    "http://localhost:8000",
    "https://skylab.ntubimdbirc.tw",
    "https://skylab-tw.com"
  ];
  public static NTUB_BACKEND_URL = "https://ntub.skylab-tw.com";
  public static TUNNEL_STATUS_POLL_INTERVAL_MS = 1000;
}

export default GlobalConstant;
