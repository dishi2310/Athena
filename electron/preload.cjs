const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  setFullScreen: () => ipcRenderer.invoke("full-screen"),
  exitFullScreen: () => ipcRenderer.invoke("exit-fullscreen"),
  getRemainingTime: () => ipcRenderer.invoke("get-time"),
  startTest: () => ipcRenderer.invoke("start-test"),
  showExamRules: () => ipcRenderer.invoke("show-rules"),
  savePhoto: (arrayBuffer) => ipcRenderer.invoke("save-photo", arrayBuffer),
  saveLog: (logData) => ipcRenderer.invoke("save-log", logData),
  quitApp: () => ipcRenderer.invoke("quit-app"),
});
