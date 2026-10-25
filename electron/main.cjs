const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require('fs');

let win = null;

function createWindow() {
  win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // Prevent opening new tabs or external windows
  win.webContents.setWindowOpenHandler(() => ({ action: "deny" }));

  win.loadURL("http://localhost:5173/").catch(() => {
    // If the Vite dev server is not running, fall back to built production files
    const distPath = path.join(__dirname, "../dist/index.html");
    if (fs.existsSync(distPath)) {
      win.loadFile(distPath);
    }
  });
  win.webContents.openDevTools({ mode: "detach" });
}

ipcMain.handle("full-screen", () => {
  if (win) {
    win.kiosk = true;
  }
});

ipcMain.handle("exit-fullscreen", () => {
  if (win) {
    win.kiosk = false;
    win.setFullScreen(false);
  }
});

ipcMain.handle("quit-app", () => {
  app.quit();
});

let end_time = null;

ipcMain.handle("start-test", () => {
  // Set 60 minutes countdown (60 * 60 * 1000 ms)
  end_time = Date.now() + 60 * 60 * 1000;
});

ipcMain.handle("get-time", () => {
  return end_time - Date.now();
});

ipcMain.handle("show-rules", async () => {
  const res = await dialog.showMessageBox(win, {
    type: "info",
    title: "Exam rules",
    message: "Please follow these things:",
    detail: `
    1. Do not open any new tab
    2. You will get 0 marks if you cheat
    `,
    buttons: ["Cancel", "Accept"],
    defaultId: 0
  });

  return res.response;
});

ipcMain.handle("save-photo", (_, arrayBuffer) => {
  const dir = path.join(__dirname, "cameraFeed");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const filePath = path.join(dir, `${Date.now()}.jpeg`);
  const buffer = Buffer.from(arrayBuffer);
  console.log(buffer);
  fs.writeFileSync(filePath, buffer);
});

ipcMain.handle("save-log", (_, logData) => {
  const dir = path.join(__dirname, "cameraFeed");
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const logPath = path.join(dir, "session-logs.json");
  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));
  return true;
});

app.whenReady().then(() => {
  createWindow();
});
