/**
 * 後端網址的檢查與正規化。主程序存檔前（SettingsService）與首頁、設定頁輸入時共用同一套規則，
 * 畫面上即時提示的錯誤跟真正存檔時擋下來的原因才會一致。
 * 平台一律架在網域根目錄：沒寫 https:// 就補上，從瀏覽器貼上的路徑、查詢參數與 # 都捨棄，只存來源（origin）。
 * 純函式、不碰 Node／Electron API，渲染程序也能直接 import。
 */
export type BackendUrlProblem =
  "required" | "invalid" | "insecure" | "credentials";

export type BackendUrlResult =
  { ok: true; url: string } | { ok: false; problem: BackendUrlProblem };

class BackendUrlUtils {
  public static parse(value: string): BackendUrlResult {
    const trimmed = String(value ?? "").trim();
    if (!trimmed) return { ok: false, problem: "required" };
    let url: URL;
    try {
      url = new URL(
        /^[a-z][a-z\d+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`
      );
    } catch {
      return { ok: false, problem: "invalid" };
    }
    const isLocal =
      url.hostname === "localhost" || url.hostname === "127.0.0.1";
    if (url.protocol !== "https:" && !(isLocal && url.protocol === "http:")) {
      return { ok: false, problem: "insecure" };
    }
    if (url.username || url.password) {
      return { ok: false, problem: "credentials" };
    }
    return { ok: true, url: url.origin };
  }
}

export default BackendUrlUtils;
