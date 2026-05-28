class PetState {
  constructor() {
    this.name = '小猫咪';
    this.createdAt = new Date().toISOString();
    this.totalSessionMinutes = 0;
    this.isSleeping = false;
  }

  static fromData(data) {
    const pet = new PetState();
    pet.name = data?.name || '小猫咪';
    pet.createdAt = data?.createdAt || new Date().toISOString();
    pet.totalSessionMinutes = data?.totalSessionMinutes || 0;
    pet.isSleeping = false;
    return pet;
  }

  toJSON() {
    return {
      name: this.name,
      createdAt: this.createdAt,
      totalSessionMinutes: this.totalSessionMinutes
    };
  }
}
