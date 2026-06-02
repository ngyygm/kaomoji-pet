const fs = require('fs');
const path = require('path');

class Logger {
  constructor(app) {
    this.app = app;
  }

  getLogPath() {
    return path.join(this.app.getPath('userData'), 'interaction.log');
  }

  write(event, source = 'main', state = null, details = null) {
    try {
      const entry = {
        time: new Date().toISOString(),
        source,
        event
      };
      if (state) entry.state = state;
      if (details) entry.details = details;

      fs.mkdirSync(path.dirname(this.getLogPath()), { recursive: true });
      fs.appendFileSync(this.getLogPath(), JSON.stringify(entry) + '\n', 'utf-8');
    } catch (_) {
      // Logging must never break the desktop pet.
    }
  }
}

module.exports = { Logger };
