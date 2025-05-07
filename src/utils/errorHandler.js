function handleError(error, emitEvent, eventName = "customError") {
  console.error(`[MusicService Error]: ${error.message}`);
  if (typeof emitEvent === "function") {
    emitEvent(eventName, error);
  }
}

module.exports = { handleError };
