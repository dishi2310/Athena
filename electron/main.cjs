const { BrowserWindow, app, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");

let win = null;
let end_time = null;

function createWindow() {
  const iconPath = path.join(__dirname, "../public/icon.svg");

  win = new BrowserWindow({
    width: 1000,
    height: 700,
    frame: false,
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // Prevent opening new tabs or external windows
  win.webContents.setWindowOpenHandler(() => ({
    action: "deny",
  }));

  // Load the correct page for development or production
  if (app.isPackaged) {
    const distPath = path.join(__dirname, "../dist/index.html");

    win.loadFile(distPath).catch((error) => {
      console.error("Failed to load the production app:", error);
    });
  } else {
    win.loadURL("http://localhost:5173/").catch((error) => {
      console.error(
        "Could not load the Vite development server. Run npm run dev first.",
        error
      );
    });
  }

  // Open DevTools only during development
  if (!app.isPackaged) {
    win.webContents.openDevTools({ mode: "detach" });
  }

  win.on("closed", () => {
    win = null;
  });
}

// Enable fullscreen/kiosk mode
ipcMain.handle("full-screen", () => {
  if (win) {
    win.setKiosk(true);
  }
});

// Exit fullscreen/kiosk mode
ipcMain.handle("exit-fullscreen", () => {
  if (win) {
    win.setKiosk(false);
    win.setFullScreen(false);
  }
});

// Quit Athena
ipcMain.handle("quit-app", () => {
  app.quit();
});

// Start the 60-minute exam timer
ipcMain.handle("start-test", () => {
  end_time = Date.now() + 60 * 60 * 1000;
  return end_time;
});

// Get remaining exam time in milliseconds
ipcMain.handle("get-time", () => {
  if (end_time === null) {
    return null;
  }

  return Math.max(0, end_time - Date.now());
});

// Show exam rules dialog
ipcMain.handle("show-rules", async () => {
  if (!win) {
    return 0;
  }

  const res = await dialog.showMessageBox(win, {
    type: "info",
    title: "Exam rules",
    message: "Please follow these things:",
    detail: [
      "1. Do not open any new tab",
      "2. You will get 0 marks if you cheat",
    ].join("\n"),
    buttons: ["Cancel", "Accept"],
    defaultId: 0,
    cancelId: 0,
  });

  return res.response;
});

// Save webcam snapshots
ipcMain.handle("save-photo", (_, arrayBuffer) => {
  const dir = path.join(__dirname, "cameraFeed");

  fs.mkdirSync(dir, { recursive: true });

  const filePath = path.join(dir, `${Date.now()}.jpeg`);
  const buffer = Buffer.from(arrayBuffer);

  fs.writeFileSync(filePath, buffer);

  return true;
});

// Save session logs
ipcMain.handle("save-log", (_, logData) => {
  const dir = path.join(__dirname, "cameraFeed");

  fs.mkdirSync(dir, { recursive: true });

  const logPath = path.join(dir, "session-logs.json");

  fs.writeFileSync(logPath, JSON.stringify(logData, null, 2));

  return true;
});

// Create the application window
app.whenReady().then(() => {
  createWindow();

  // Set macOS dock icon
  if (process.platform === "darwin" && app.dock && fs.existsSync(path.join(__dirname, "../public/icon.png"))) {
    app.dock.setIcon(path.join(__dirname, "../public/icon.png"));
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit on all windows closed, except on macOS
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});