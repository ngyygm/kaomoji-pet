class RuntimeLogger {
  constructor(source = 'renderer') {
    this.source = source;
  }

  write(event, state = null, details = null) {
    window.petAPI.logInteraction?.(event, {
      source: this.source,
      state,
      details
    });
  }
}
