const { app, BrowserWindow } = require("electron");
const path = require("path");

let mainWindow;

app.whenReady().then(() => {
  mainWindow = new BrowserWindow({
    width: 1028,
    height: 780,
    webPreferences: {
      nodeIntegration: true,
    },
  });

  const startUrl = 
    "http://localhost:3000/";

  mainWindow.loadURL(startUrl);

  mainWindow.on("closed", () => (mainWindow = null));
});