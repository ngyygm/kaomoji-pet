class SaveManager {
  constructor() {
    this.lastSave = null;
  }

  async loadFull() {
    try {
      const data = await window.petAPI.loadData();
      if (data) {
        const petState = PetState.fromData(data.petState || data);
        const hiddenState = data.hiddenState || null;
        return { petState, hiddenState, isNew: !data.petState };
      }
    } catch (e) {
      console.error('Failed to load save:', e);
    }
    return { petState: new PetState(), hiddenState: null, isNew: true };
  }

  saveFull(petState, hiddenState) {
    try {
      window.petAPI.saveData({
        petState: petState.toJSON(),
        hiddenState: hiddenState,
        timestamp: Date.now()
      });
      this.lastSave = Date.now();
    } catch (e) {
      console.error('Failed to save:', e);
    }
  }
}
