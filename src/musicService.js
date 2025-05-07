const { DisTube } = require("distube");
const { YtDlpPlugin } = require("@distube/yt-dlp");
const { SpotifyPlugin } = require("@distube/spotify");
const { handleError } = require("./utils/errorHandler");
const { formatTime } = require("./utils/timeFormatter");
const VoteManager = require("./managers/voteManager");
const PlaylistManager = require("./managers/playlistManager");

class MusicService {
  /**
   * @param {Discord.Client} client Discord istemcisi.
   * @param {object} options Ek seçenekler.
   * @param {boolean} [options.leaveOnEmpty=true] Oda boşsa otomatik çıkış.
   * @param {boolean} [options.leaveOnStop=false] Stop sonrası otomatik çıkış.
   * @param {object} [options.distubeOptions] Ek Distube ayarları.
   * @param {function} [options.onEvent] Olay callback fonksiyonu: (event, ...args).
   */
  constructor(client, options = {}) {
    this.client = client;
    this.options = options;
    this.voteManager = new VoteManager();
    this.playlistManager = new PlaylistManager();
    this.distube = new DisTube(client, {
      leaveOnEmpty: options.leaveOnEmpty ?? true,
      leaveOnStop: options.leaveOnStop ?? false,
      emitNewSongOnly: true,
      plugins: [new YtDlpPlugin(), new SpotifyPlugin()],
      ...options.distubeOptions,
    });
    this.registerDefaultEvents();
  }

  registerDefaultEvents() {
    this.distube.on("playSong", (queue, song) => {
      this.playlistManager.addToHistory(song);
      this.emitEvent("playSong", queue, song);
    });
    this.distube.on("addSong", (queue, song) => this.emitEvent("addSong", queue, song));
    this.distube.on("addList", (queue, playlist) => this.emitEvent("addList", queue, playlist));
    this.distube.on("finish", queue => this.emitEvent("finish", queue));
    this.distube.on("empty", queue => this.emitEvent("empty", queue));
    this.distube.on("searchResult", (message, results) => this.emitEvent("searchResult", message, results));
    this.distube.on("searchCancel", message => this.emitEvent("searchCancel", message));
    this.distube.on("disconnect", queue => this.emitEvent("disconnect", queue));
    this.distube.on("error", (channel, error) => {
      if (channel && channel.send) channel.send(`Error: ${error.message}`);
      else console.error("DisTube Error:", error);
      this.emitEvent("error", channel, error);
    });
  }

  emitEvent(event, ...args) {
    if (typeof this.options.onEvent === "function") {
      this.options.onEvent(event, ...args);
    }
  }

  async play(input, query) {
    try {
      if (!query || typeof query !== "string") throw new Error("No valid query provided.");
      await this.distube.play(input, query);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async stop(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.stop();
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async skip(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.skip();
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async pause(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.pause();
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async resume(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.resume();
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  getQueue(input) {
    return this.distube.getQueue(input);
  }

  async setVolume(input, volume) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      if (isNaN(volume) || volume < 0 || volume > 100)
        throw new Error("Volume must be a number between 0 and 100.");
      queue.setVolume(volume);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async setLoop(input, mode = "off") {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      if (!["off", "song", "queue"].includes(mode))
        throw new Error("Invalid loop mode. Use off, song, or queue.");
      queue.setRepeatMode(mode === "off" ? 0 : mode === "song" ? 1 : 2);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async shuffle(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.songs = [queue.songs[0], ...this._shuffleArray(queue.songs.slice(1))];
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  _shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  async remove(input, index) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      if (isNaN(index) || index < 1 || index > queue.songs.length)
        throw new Error("Invalid song index.");
      queue.songs.splice(index - 1, 1);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async clearQueue(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.songs = queue.songs.slice(0, 1);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async toggleAutoplay(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.toggleAutoplay();
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async seek(input, seconds) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      if (isNaN(seconds) || seconds < 0) throw new Error("Invalid seek time.");
      queue.seek(seconds);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async replay(input) {
    return this.seek(input, 0);
  }

  async jump(input, index) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      if (isNaN(index) || index < 1 || index > queue.songs.length)
        throw new Error("Invalid song index.");
      queue.songs = queue.songs.slice(index - 1);
      queue.skip();
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  nowPlaying(input) {
    try {
      const queue = this.distube.getQueue(input);
      return queue && queue.songs.length > 0 ? queue.songs[0] : null;
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      return null;
    }
  }

  async increaseVolume(input, step = 10) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      let newVolume = Math.min(100, queue.volume + step);
      queue.setVolume(newVolume);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async decreaseVolume(input, step = 10) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      let newVolume = Math.max(0, queue.volume - step);
      queue.setVolume(newVolume);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async togglePause(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      return queue.paused ? await this.resume(input) : await this.pause(input);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  getFilters(input) {
    try {
      const queue = this.distube.getQueue(input);
      return queue ? queue.filters || [] : [];
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      return [];
    }
  }

  async setFilter(input, filter) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      if (!filter || typeof filter !== "string") throw new Error("Invalid filter.");
      queue.setFilter(filter);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async clearFilter(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.setFilter("clear");
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async setFilters(input, filtersArray = []) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      if (!Array.isArray(filtersArray)) throw new Error("Filters must be an array.");
      filtersArray.forEach(filter => {
        if (typeof filter === "string" && filter.trim() !== "") {
          queue.filters.add(filter);
        }
      });
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async removeFilter(input, filter) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      let currentFilters = queue.filters.names;
      if (!currentFilters.includes(filter)) throw new Error("Filter not active.");
      currentFilters = currentFilters.filter(f => f !== filter);
      queue.setFilter("clear");
      currentFilters.forEach(f => queue.filters.add(f));
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  getProgressBar(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) return "No active queue.";
      const total = queue.songs[0].duration;
      const current = queue.currentTime;
      const barLength = 20;
      const progress = Math.round((current / total) * barLength);
      const progressBar = "▬".repeat(progress) + "🔵" + "▬".repeat(barLength - progress);
      return `\`${formatTime(current)}\` ${progressBar} \`${formatTime(total)}\``;
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      return "Error generating progress bar.";
    }
  }

  getActiveFilters(input) {
    try {
      const queue = this.distube.getQueue(input);
      return queue ? queue.filters.names : [];
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      return [];
    }
  }

  getQueueJSON(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) return null;
      return JSON.stringify(
        queue.songs.map(song => ({
          title: song.name,
          url: song.url,
          duration: song.formattedDuration,
          requestedBy: song.user.tag,
        })),
        null,
        2
      );
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      return null;
    }
  }

  getQueueInfo(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) return null;
      const nowPlaying = queue.songs[0] || null;
      const queueLength = queue.songs.length;
      const totalDuration = queue.songs.reduce((acc, song) => acc + (song.duration || 0), 0);
      const volume = queue.volume;
      return { nowPlaying, queueLength, totalDuration, volume };
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      return null;
    }
  }

  getQueueObject(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) return null;
      return {
        nowPlaying: queue.songs[0] || null,
        songs: queue.songs.map(song => ({
          title: song.name,
          url: song.url,
          duration: song.duration,
          formattedDuration: song.formattedDuration,
          requestedBy: song.user.tag,
        })),
        volume: queue.volume,
        repeatMode: queue.repeatMode,
      };
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      return null;
    }
  }

  async setPlaybackSpeed(input, speed = 1) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      if (speed < 0.5 || speed > 2) throw new Error("Speed must be between 0.5x and 2x.");
      queue.filters.add(`atempo=${speed}`);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async setEqualizer(input, type = "bass") {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      const filters = {
        bass: "bass=g=10",
        treble: "treble=g=5",
        normal: "aecho=0.8:0.9:1000:0.3",
      };
      if (!filters[type]) throw new Error("Invalid equalizer type.");
      queue.filters.add(filters[type]);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async setTransition(input, duration = 3) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.filters.add(`afade=t=in:ss=0:d=${duration}`);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async setCrossfade(input, duration = 5) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.filters.add(`acrossfade=d=${duration}`);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async normalizeAudio(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.filters.add("loudnorm");
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async voteSkip(input, userId) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      return this.voteManager.voteSkip(queue, userId, this.emitEvent.bind(this));
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  saveQueueToFile(input, filePath) {
    try {
      const queueObj = this.getQueueObject(input);
      if (!queueObj) throw new Error("No active queue.");
      return this.playlistManager.saveQueueToFile(queueObj, filePath);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      return false;
    }
  }

  loadQueueFromFile(input, filePath) {
    try {
      return this.playlistManager.loadQueueFromFile(filePath, this.emitEvent.bind(this));
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      return null;
    }
  }

  getPlayHistory() {
    return this.playlistManager.getHistory();
  }

  clearPlayHistory() {
    return this.playlistManager.clearHistory();
  }

  async destroy(input) {
    try {
      const queue = this.distube.getQueue(input);
      if (!queue) throw new Error("No active queue.");
      queue.stop();
      if (queue.connection) {
        queue.connection.destroy();
      }
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }

  async search(query, options = {}) {
    try {
      if (!query || typeof query !== "string") throw new Error("No valid query provided.");
      return await this.distube.search(query, options);
    } catch (error) {
      handleError(error, this.emitEvent.bind(this));
      throw error;
    }
  }
}

module.exports = MusicService;
