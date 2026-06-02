const fs = require('fs');
const path = require('path');

class SaveService {
  constructor({ app, logger }) {
    this.app = app;
    this.logger = logger;
  }

  registerIpc() {
    const { ipcMain } = require('electron');
    ipcMain.handle('save:load', () => this.load());
    ipcMain.handle('save:write', (_, data) => this.write(data));
  }

  getSavePath() {
    return path.join(this.app.getPath('userData'), 'save.json');
  }

  load() {
    const savePath = this.getSavePath();
    if (!fs.existsSync(savePath)) return null;

    try {
      return JSON.parse(fs.readFileSync(savePath, 'utf-8'));
    } catch (err) {
      this.logger.write('ipc-error', 'main', null, {
        ipc: 'save:load',
        message: err.message
      });
      return null;
    }
  }

  write(data) {
    try {
      const savePath = this.getSavePath();
      fs.mkdirSync(path.dirname(savePath), { recursive: true });
      fs.writeFileSync(savePath, JSON.stringify(data, null, 2), 'utf-8');
      this.logger.write('save:write', 'main');
      return { success: true };
    } catch (err) {
      this.logger.write('ipc-error', 'main', null, {
        ipc: 'save:write',
        message: err.message
      });
      return { success: false, error: err.message };
    }
  }
}

module.exports = { SaveService };
