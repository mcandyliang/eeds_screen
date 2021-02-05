const { app, BrowserWindow, Menu, ipcMain } = require("electron");
const Store = require("electron-store");

const store = new Store();
const fs = require("fs");
console.log(store);
process.env["ELECTRON_DISABLE_SECURITY_WARNINGS"] = "true";

let arr = [
  {
    label: "开发者工具",
    submenu: [
      {
        label: "打开/关闭",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click: (item, focusedWindow) => {
          focusedWindow.toggleDevTools();
        },
      },
      {
        label: "刷新一下",
        role: "reload",
        accelerator: process.platform == "darwin" ? "Command+F5" : "Ctrl+F5",
      },
    ],
  },
];
let mainMenu = Menu.buildFromTemplate(arr);
// Menu.setApplicationMenu(mainMenu);
let win = null;
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
    autoHideMenuBar: true,
    fullscreen: true,
    // simpleFullscreen: true,
  });

  // win.webContents.openDevTools();
  win.loadFile("index.html");
  win.webContents.on("did-finish-load", function () {
    // console.log("发送消息");

    fs.readFile(store.path, "utf-8", function (err, data) {
      if (err) {
        console.log(err);
      } else {
        // console.log(data);
        const val = JSON.parse(data);
        // console.log(val);
        win.webContents.send("data", val);
      }
    });
  });
  // 点击主窗口的关闭按钮
  win.on("closed", () => {
    app.quit();
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
ipcMain.on("opennew", (event, val) => {
  win.loadFile("home.html");
  store.set(val.username, val.password);
  win.webContents.on("did-finish-load", function () {
    // console.log("发送消息");
    win.webContents.send("data", val);
  });
});
