/**
 * 記住每台 VM 上次用的 SSH 登入帳號，下次開帳號對話框時預先帶入。
 * 帳號不是機密（密碼仍在終端機輸入），存 localStorage 即可；依學校平台網址分開存，
 * 換平台後同一個 VMID 不會帶出別台機器的帳號。localStorage 不能用時只是不記住。
 */
const LS_KEY = "skylab.sshUsernames";
const MAX_ENTRIES = 200;

type Store = Record<string, string>;

const entryKey = (backendUrl: string, vmid: number) =>
  `${backendUrl.replace(/\/$/, "")}#${vmid}`;

function read(): Store {
  try {
    const parsed = JSON.parse(localStorage.getItem(LS_KEY) ?? "{}");
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? (parsed as Store)
      : {};
  } catch {
    return {};
  }
}

export function rememberedSshUsername(
  backendUrl: string,
  vmid: number
): string {
  const value = read()[entryKey(backendUrl, vmid)];
  return typeof value === "string" ? value : "";
}

export function rememberSshUsername(
  backendUrl: string,
  vmid: number,
  username: string
): void {
  const key = entryKey(backendUrl, vmid);
  const store = read();
  delete store[key];
  store[key] = username;
  // 物件鍵依插入順序排列：超過上限時丟掉最久沒用的
  const keys = Object.keys(store);
  for (const stale of keys.slice(0, Math.max(0, keys.length - MAX_ENTRIES)))
    delete store[stale];
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(store));
  } catch {
    // 只是下次不會預先帶入
  }
}
