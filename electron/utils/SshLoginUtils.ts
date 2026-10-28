/**
 * SSH 登入帳號的規則。主程序開終端機前（SystemController）與首頁的帳號對話框共用，
 * 畫面上即時提示的錯誤跟真正擋下來的原因才會一致。
 * 容器（LXC）固定 root；VM 的帳號是申請時填的 cloud-init 使用者，平台不幫忙帶，
 * 一律由使用者輸入。純函式、不碰 Node／Electron API，渲染程序也能直接 import。
 */
const MAX_LENGTH = 32;
// 同 SystemService.openSsh 的檢查：帳號直接接進終端機指令，只放行 Linux 帳號字元
const PATTERN = /^[a-z_][a-z0-9_-]*[$]?$/i;

class SshLoginUtils {
  public static readonly maxLength = MAX_LENGTH;

  public static isContainer(resourceType: unknown): boolean {
    return String(resourceType ?? "").toLowerCase() === "lxc";
  }

  public static isValidUsername(value: unknown): value is string {
    return (
      typeof value === "string" &&
      value.length <= MAX_LENGTH &&
      PATTERN.test(value)
    );
  }

  /** 實際登入帳號：容器一律 root（不理會傳入的值），VM 帳號不合規則回 null */
  public static loginUser(
    resourceType: unknown,
    requested: unknown
  ): string | null {
    if (SshLoginUtils.isContainer(resourceType)) return "root";
    const username = typeof requested === "string" ? requested.trim() : "";
    return SshLoginUtils.isValidUsername(username) ? username : null;
  }
}

export default SshLoginUtils;
