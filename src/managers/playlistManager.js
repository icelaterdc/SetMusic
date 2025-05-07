const fs = require("fs");
const path = require("path");

class PlaylistManager {
  constructor() {
    this.playHistory = [];
  }

  addToHistory(song) {
    this.playHistory.push(song);
  }

  getHistory() {
    return this.playHistory;
  }

  clearHistory() {
    this.playHistory = [];
  }

  saveQueueToFile(queueObj, filePath) {
    try {
      fs.writeFileSync(path.resolve(filePath), JSON.stringify(queueObj, null, 2));
      return true;
    } catch (error) {
      return false;
    }
  }

  loadQueueFromFile(filePath, emitEvent) {
    try {
      const data = fs.readFileSync(path.resolve(filePath));
      const savedQueue = JSON.parse(data);
      if (typeof emitEvent === "function") {
        emitEvent("queueLoaded", savedQueue);
      }
      return savedQueue;
    } catch (error) {
      return null;
    }
  }
}

module.exports = PlaylistManager;
