const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');

class TrayService {
  constructor({ windowService, movementService, systemService, saveService, logger }) {
    this.windowService = windowService;
    this.movementService = movementService;
    this.systemService = systemService;
    this.saveService = saveService;
    this.logger = logger;
    this.tray = null;
    this.isQuitting = false;
    this._renameFn = null; // 主进程传入的 showRenameDialog 引用
  }

  /** 设置改名对话框函数（避免循环依赖） */
  setRenameFn(fn) {
    this._renameFn = fn;
  }

  createTray() {
    const iconPath = path.join(__dirname, '..', '..', 'assets', 'tray-icon.png');
    const icon = nativeImage.createFromPath(iconPath);

    // Windows 任务栏图标尺寸建议 16x16，如果图片太大则缩放
    let trayIcon = icon;
    if (icon.getSize().width > 16) {
      trayIcon = icon.resize({ width: 16, height: 16 });
    }

    this.tray = new Tray(trayIcon);
    this.tray.setToolTip('颜文字宠物');

    // 左键点击 → 显示/隐藏宠物窗口
    this.tray.on('click', () => this.toggleVisibility());

    // 右键菜单 — 每次弹出时重新构建，确保文本状态正确
    this.tray.on('right-click', () => {
      const menu = this._buildMenu();
      this.tray.popUpContextMenu(menu);
    });

    this.logger.write('tray-created', 'tray');
  }

  /** 重置主窗口视觉状态，防止托盘菜单关闭后出现标题栏 */
  _resetMainWindow() {
    const win = this.windowService.getWindow();
    if (win && !win.isDestroyed()) win.showInactive();
  }

  _buildMenu() {
    const isVisible = this.windowService.getWindow() !== null;
    const label = isVisible ? '隐藏宠物' : '显示宠物';

    return Menu.buildFromTemplate([
      {
        label,
        click: () => { this.toggleVisibility(); this._resetMainWindow(); }
      },
      { type: 'separator' },
      {
        label: '给猫猫改名',
        click: () => this._onRename()
      },
      { type: 'separator' },
      {
        label: '开发工具',
        submenu: [
          {
            label: '打开 DevTools',
            click: () => {
              const win = this.windowService.getWindow();
              if (win) win.webContents.openDevTools({ mode: 'detach' });
              this._resetMainWindow();
            }
          },
          {
            label: '重载页面',
            click: () => {
              const win = this.windowService.getWindow();
              if (win) win.reload();
              this._resetMainWindow();
            }
          }
        ]
      },
      { type: 'separator' },
      {
        label: '退出',
        click: () => {
          this.isQuitting = true;
          this.windowService.closeApp(app);
        }
      }
    ]);
  }

  /** 托盘改名：直接弹出改名对话框，结果通知渲染进程 */
  async _onRename() {
    if (!this._renameFn) return;

    // 从存档读取当前名字
    const save = this.saveService.load();
    const currentName = save?.petState?.name || '小猫咪';

    const newName = await this._renameFn(currentName);
    if (!newName) return; // 用户取消

    // 确保窗口可见，然后把新名字发给渲染进程
    this.ensureWindowVisible();

    // 等窗口准备好再发消息
    const win = this.windowService.getWindow();
    if (win) {
      win.webContents.send('tray:rename-result', newName);
    }
    // 改名对话框关闭后，重置主窗口视觉状态防止标题栏出现
    this._resetMainWindow();

    this.logger.write('tray-rename', 'tray', null, { oldName: currentName, newName });
  }

  /** 左键点击：显示/隐藏宠物窗口 */
  toggleVisibility() {
    const win = this.windowService.getWindow();
    if (win) {
      this.hidePet();
    } else {
      this.showPet();
    }
  }

  showPet() {
    if (this.windowService.getWindow()) return;
    this.windowService.createMainWindow();
    this.systemService.start();
    this.logger.write('tray-show-pet', 'tray');
  }

  hidePet() {
    const win = this.windowService.getWindow();
    if (!win) return;
    this.movementService.stop('tray-hide');
    win.close();
    this.logger.write('tray-hide-pet', 'tray');
  }

  ensureWindowVisible() {
    if (!this.windowService.getWindow()) {
      this.showPet();
    }
  }

  getQuitting() {
    return this.isQuitting;
  }

  destroy() {
    if (this.tray) {
      this.tray.destroy();
      this.tray = null;
    }
  }
}

module.exports = { TrayService };
