const { app, BrowserWindow, nativeTheme } = require("electron");
const assert = require("node:assert/strict");
const path = require("node:path");

app.setPath("userData", process.env.SKYLAB_CONNECTION_TEST_DIR);
app.disableHardwareAcceleration();
// Keep Electron alive between the dark and light theme windows.
app.on("window-all-closed", () => {});
app
  .whenReady()
  .then(async () => {
    let scenarios = 0;
    for (const theme of ["dark", "light"]) {
      nativeTheme.themeSource = theme;
      const win = new BrowserWindow({
        width: 960,
        height: 700,
        show: false,
        webPreferences: {
          preload: path.join(__dirname, "connection-ipc.cjs"),
          sandbox: true,
          backgroundThrottling: false
        }
      });
      await win.loadFile(path.resolve(__dirname, "../../dist/index.html"));
      await win.webContents.executeJavaScript(`new Promise((resolve,reject)=>{
      const start=Date.now(); const timer=setInterval(()=>{
        if(document.querySelector('.connection-banner .is-running')){clearInterval(timer);resolve()}
        else if(Date.now()-start>10000){clearInterval(timer);reject(new Error('Connected UI did not initialize'))}
      },30)
    })`);
      const settle = () =>
        win.webContents.executeJavaScript(
          "new Promise(resolve=>setTimeout(resolve,0))"
        );
      const inspect = () =>
        win.webContents.executeJavaScript(`(()=>{
      const banner=document.querySelector('.connection-banner');
      return {error:banner.classList.contains('connection-banner--error'),
        title:banner.querySelector('h2').textContent,
        border:getComputedStyle(banner).borderColor,
        icon:getComputedStyle(banner.querySelector('.material-icons-outlined')).color,
        alerts:document.querySelectorAll('.sl-notice--danger').length}
    })()`);
      const normal = await inspect();
      assert.equal(normal.error, false);
      for (const [route, code] of [
        ["system/openRdp", "B1018"],
        ["system/openRdp", "B1019"],
        ["system/openRdp", "B1020"],
        ["system/openSsh", "B1018"],
        ["tunnel/refresh", "B1017"],
        ["resource/listMyResources", "B1017"]
      ]) {
        await win.webContents.executeJavaScript(
          `window.connectionTestReply(${JSON.stringify(route + ":hook")},null,${JSON.stringify(code)})`
        );
        await settle();
        const failure = await inspect();
        assert.equal(failure.error, false, `${theme}: ${route} ${code}`);
        assert.equal(failure.title, normal.title);
        assert.equal(failure.border, normal.border);
        assert.equal(failure.icon, normal.icon);
        if (code === "B1018") assert.ok(failure.alerts > 0);
        scenarios++;
      }
      await win.webContents
        .executeJavaScript(`window.connectionTestReply('tunnel/getStatus:hook',{
      running:false,connected:false,connectionError:'Disconnected',connectionErrorCode:'B1005',tunnels:[]
    })`);
      await settle();
      const disconnected = await inspect();
      assert.equal(disconnected.error, true);
      assert.notEqual(disconnected.title, normal.title);
      scenarios++;

      // 背景輪詢連不上後端：側欄常駐「暫時連不上伺服器」，不跳錯誤訊息；下次成功就消失
      const offline = () =>
        win.webContents.executeJavaScript(`(()=>({
        text:document.querySelector('.desktop-offline')?.lastElementChild.textContent.trim()||'',
        toasts:document.querySelectorAll('.el-message').length
      }))()`);
      for (let poll = 0; poll < 3; poll++) {
        await win.webContents.executeJavaScript(
          "window.connectionTestReply('session/getSessionStatuses:hook',null,'B1017')"
        );
      }
      await settle();
      const unreachable = await offline();
      assert.equal(unreachable.text, "暫時連不上伺服器", `${theme}: offline notice`);
      assert.equal(unreachable.toasts, 0, `${theme}: no toast while polling`);
      await win.webContents.executeJavaScript(
        "window.connectionTestReply('session/getSessionStatuses:hook',[])"
      );
      await settle();
      assert.equal((await offline()).text, "", `${theme}: offline notice cleared`);
      scenarios++;

      // 還沒填學校平台網址：連線橫幅換成輸入框、側欄「開啟 Web 平台」停用、
      // 連線資訊的網址顯示「—」；存好網址後才回到「開始連線」
      await win.webContents.executeJavaScript(`
        window.connectionTestReply('auth/getAuthState:hook',{loggedIn:false});
        window.connectionTestReply('settings/getSettings:hook',{language:'zh-TW',backendUrl:''});
      `);
      await settle();
      const setupState = () =>
        win.webContents.executeJavaScript(`(()=>({
        banner:!!document.querySelector('.connection-banner'),
        form:!!document.querySelector('.backend-setup input'),
        openWebDisabled:[...document.querySelectorAll('.desktop-nav-list button')].some(b=>b.disabled)
      }))()`);
      assert.deepEqual(
        await setupState(),
        { banner: false, form: true, openWebDisabled: true },
        `${theme}: unconfigured`
      );
      const shownUrl = await win.webContents.executeJavaScript(`new Promise(resolve=>{
        [...document.querySelectorAll('.desktop-nav-list button')][0].click();
        setTimeout(()=>{
          const dd=[...document.querySelectorAll('.sl-details dd')][1];
          resolve(dd&&dd.textContent.trim());
          document.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',bubbles:true}));
        },300);
      })`);
      assert.equal(shownUrl, "—", `${theme}: connection info without URL`);
      await win.webContents.executeJavaScript(`(()=>{
        const input=document.querySelector('.backend-setup input');
        input.value='ntub.skylab-tw.com/login?next=/home';
        input.dispatchEvent(new Event('input',{bubbles:true}));
      })()`);
      await settle();
      await win.webContents.executeJavaScript(
        "document.querySelector('.backend-setup button[type=submit]').click()"
      );
      await win.webContents.executeJavaScript(
        "new Promise(resolve=>setTimeout(resolve,100))"
      );
      const saved = (
        await win.webContents.executeJavaScript("window.connectionTestSent()")
      ).filter(item => item.channel === "settings/saveSettings");
      assert.deepEqual(saved.at(-1).params, {
        backendUrl: "https://ntub.skylab-tw.com"
      });
      assert.deepEqual(
        await setupState(),
        { banner: true, form: false, openWebDisabled: false },
        `${theme}: configured after saving`
      );
      scenarios++;
      win.destroy();
    }
    console.log(
      `Connection UI: ${scenarios} scenarios passed in dark and light themes.`
    );
    app.exit(0);
  })
  .catch(error => {
    console.error(error);
    app.exit(1);
  });
