class App {
  constructor() {
    this.petState = null;
    this.renderer = null;
    this.systemMonitor = null;
    this.hiddenState = null;
    this.behaviorEngine = null;
    this.gameLoop = null;
    this.saveManager = new SaveManager();

    this.logger = new RuntimeLogger('renderer');
    this.movementController = null;
    this.effectController = null;
    this.actionController = null;
    this.menuController = null;
    this.inputController = null;
  }

  async init() {
    const { petState, hiddenState } = await this.saveManager.loadFull();
    this.petState = petState;

    this.renderer = new PetRenderer();
    this.systemMonitor = new SystemMonitor();
    this.hiddenState = new HiddenStateEngine(this.systemMonitor);
    if (hiddenState) this.hiddenState.loadState(hiddenState);

    this.movementController = new MovementController({
      logger: this.logger,
      renderer: this.renderer
    });
    this.effectController = new EffectController({
      logger: this.logger,
      renderer: this.renderer
    });
    await this.effectController.loadEffects();

    this.actionController = new ActionController({
      logger: this.logger,
      renderer: this.renderer,
      hiddenState: this.hiddenState,
      movementController: this.movementController,
      effectController: this.effectController
    });

    this.behaviorEngine = new BehaviorEngine(
      this.hiddenState,
      this.renderer,
      petData,
      this.actionController
    );

    this.menuController = new MenuController({
      logger: this.logger,
      actionController: this.actionController,
      effectController: this.effectController,
      saveManager: this.saveManager,
      renderer: this.renderer,
      petState: this.petState,
      hiddenState: this.hiddenState
    });
    this.menuController.init();

    this.inputController = new InputController({
      logger: this.logger,
      actionController: this.actionController,
      menuController: this.menuController
    });
    this.inputController.init();

    this.setupIPCListeners();
    this.setupGlobalMouse();

    this.gameLoop = new GameLoop(
      this.renderer,
      this.systemMonitor,
      this.hiddenState,
      this.behaviorEngine,
      this.saveManager,
      this.petState
    );
    this.gameLoop.start();

    this.renderer.updateKaomoji('happy', 'adult');
    this.renderer.showBubble('喵~ 你好！', 4000);
    this.renderer.spawnParticles('sparkle', 3);
    this.logger.write('app-ready', this.getState());
  }

  getState() {
    return {
      action: this.actionController?.getState?.() || null,
      movement: this.movementController?.getState?.() || null,
      effects: this.effectController?.getState?.() || null
    };
  }

  setupIPCListeners() {
    window.petAPI.onAppClosing(() => {
      this.saveManager.saveFull(this.petState, this.hiddenState.getState());
      this.logger.write('app:closing', this.getState());
    });
  }

  setupGlobalMouse() {
    window.petAPI.onGlobalMouse((data) => {
      if (this.renderer._isSleeping) return;
      this.renderer.handleGlobalMouse(data);
    });
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  window.app = app;
  app.init();
});
