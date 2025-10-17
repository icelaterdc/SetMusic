SETMUSIC LIBRARY - README
=========================

**Overview:**
---------
SetMusic is a modular, ultra-featured music bot library for Discord. It gives you a rich API for music playback and control—including basic controls, volume and loop settings, advanced audio effects and filters, queue management, skip voting, playlist handling, search functionality, and more. This library does not enforce any command or embed structure, so you can integrate its functions into your own Discord bot framework as needed.

**System Requirements:**
--------------------
- Node.js v18.20.7 or higher
- npm v9.x or higher
- A valid Discord bot token with the necessary permissions
## Usage:
------
*All functions expect a Discord Message or VoiceChannel as input (usually your command message).*

**Importing the Library:**
------------------------
To begin, require the library (assuming it’s installed via npm as “setmusic”):

-------------------------------------------------
```javascript
const Music = require("setmusic");
```
-------------------------------------------------


## Initialize your Discord client and MusicService:
-------------------------------------------------
```javascript
const { Client, GatewayIntentBits } = require("discord.js");
const Music = require("setmusic");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Create an instance of MusicService with a basic event handler:
client.music = new Music(client, {
  onEvent: (event, ...args) => {
    // Log events to the console for debugging:
    console.log(`Event: ${event}`, args);
  }
});

client.once("ready", () => {
  console.log(`Logged in as ${client.user.tag}`);
});

client.login("YOUR_DISCORD_BOT_TOKEN");
```
-------------------------------------------------


# 1. Basic Playback Commands
--------------------------
Play a song, stop playback, skip, pause, resume, and toggle pause.

**Play a song by URL or search query:**
-------------------------------------------------
```javascript
await client.music.play(message, "https://youtu.be/dQw4w9WgXcQ");
// or use a search query:
await client.music.play(message, "Never Gonna Give You Up");
```
-------------------------------------------------

**Stop playback:**
-------------------------------------------------
```javascript
await client.music.stop(message);
```
-------------------------------------------------

**Skip the current song:**
-------------------------------------------------
```javascript
await client.music.skip(message);
```
-------------------------------------------------

**Pause & Resume:**
-------------------------------------------------
```javascript
await client.music.pause(message);
await client.music.resume(message);
// Alternatively, toggle pause/resume:
await client.music.togglePause(message);
```
-------------------------------------------------

**Seek, Jump, and Replay:**
-------------------------------------------------
```javascript
await client.music.seek(message, 60);   // Jump to 60 seconds into current track
await client.music.jump(message, 3);      // Jump to the 3rd song in the queue (1-indexed)
await client.music.replay(message);       // Restart the current song (seek to 0)
```
-------------------------------------------------


# 2. Volume and Loop Controls
---------------------------
*Set volume, increase/decrease volume, and manage loop modes.*

**Set volume to a specific level:**
-------------------------------------------------
```javascript
await client.music.setVolume(message, 75);  // Set volume to 75%
```
-------------------------------------------------

**Increase or decrease volume by a step:**
-------------------------------------------------
```javascript
await client.music.increaseVolume(message, 10); // Increase by 10 units
await client.music.decreaseVolume(message, 10); // Decrease by 10 units
```
-------------------------------------------------

**Set loop modes (off, song, queue):**
-------------------------------------------------
```javascript
await client.music.setLoop(message, "off");   // No looping
await client.music.setLoop(message, "song");  // Repeat the current song
await client.music.setLoop(message, "queue"); // Repeat the entire queue
```
-------------------------------------------------

**Toggle autoplay:**
-------------------------------------------------
```javascript
await client.music.toggleAutoplay(message);
```
-------------------------------------------------


# 3. Queue Information and Progress Bar
---------------------------------------
*Retrieve detailed information about the queue and display a progress bar.*

**Get queue details:**
-------------------------------------------------
```javascript
const queueInfo = client.music.getQueueInfo(message);
console.log(queueInfo);
// Expected output: { nowPlaying, queueLength, totalDuration, volume }
```
-------------------------------------------------

**Get the full queue as a JSON string:**
-------------------------------------------------
```javascript
const queueJSON = client.music.getQueueJSON(message);
console.log(queueJSON);
```
-------------------------------------------------

**Generate and display a progress bar for the current song:**
-------------------------------------------------
```javascript
const progressBar = client.music.getProgressBar(message);
message.channel.send(`Now Playing Progress:\n${progressBar}`);
```
-------------------------------------------------


# 4. Audio Filters, Equalizer, and Effects
------------------------------------------
*Apply single or multiple filters, adjust equalizer settings, and add advanced audio effects.*

**Apply a single filter:**
-------------------------------------------------
```javascript
await client.music.setFilter(message, "bassboost");
```
-------------------------------------------------

**Apply multiple filters:**
-------------------------------------------------
```javascript
await client.music.setFilters(message, ["filter1", "filter2", "filter3"]);
```
-------------------------------------------------

**Remove a specific filter:**
-------------------------------------------------
```javascript
await client.music.removeFilter(message, "bassboost");
```
-------------------------------------------------

**Clear all filters:**
-------------------------------------------------
```javascript
await client.music.clearFilter(message);
```
-------------------------------------------------

**Apply an equalizer preset:**
-------------------------------------------------
```javascript
await client.music.setEqualizer(message, "bass");  
// Options include "bass", "treble", and "normal"
```
-------------------------------------------------

**Adjust playback speed:**
-------------------------------------------------
```javascript
await client.music.setPlaybackSpeed(message, 1.5);  // 1.5x speed; allowed range is 0.5x to 2x
```
-------------------------------------------------

**Apply fade-in/fade-out transition:**
-------------------------------------------------
```javascript
await client.music.setTransition(message, 3);  // 3-second fade-in/out
```
-------------------------------------------------

**Set crossfade between songs:**
-------------------------------------------------
```javasxript
await client.music.setCrossfade(message, 5);  // 5-second crossfade effect
```
-------------------------------------------------

**Normalize the audio:**
-------------------------------------------------
```javascript
await client.music.normalizeAudio(message);
```
-------------------------------------------------


# 5. Skip Vote Mechanism
----------------------
*Enable users to collaboratively vote to skip the current song.*

**Example usage:**
-------------------------------------------------
```javascript
const voteResult = await client.music.voteSkip(message, message.author.id);
console.log(`Vote Skip: ${voteResult.votes} votes out of ${voteResult.members} members`);
```
-------------------------------------------------


# 6. Playlist Management and Play History
-----------------------------------------
*Manage your playlist history, save the current queue, or load a saved queue.*

**Retrieve play history:**
-------------------------------------------------
```javascript
const history = client.music.getPlayHistory();
console.log("Play History:", history);
```
-------------------------------------------------

**Clear play history:**
-------------------------------------------------
```javascript
client.music.clearPlayHistory();
```
-------------------------------------------------

**Save the current queue to a file:**
-------------------------------------------------
```javascript
const saved = client.music.saveQueueToFile(message, "./queue.json");
if (saved) {
  console.log("Queue saved successfully.");
}
```
-------------------------------------------------

**Load a queue from a file:**
-------------------------------------------------
```javascript
const loadedQueue = client.music.loadQueueFromFile(message, "./queue.json");
if (loadedQueue) {
  console.log("Queue loaded:", loadedQueue);
}
```
-------------------------------------------------


# 7. Search Functionality
-----------------------
*Search for songs using a query string.*

**Example:**
-------------------------------------------------
```javascript
const searchResults = await client.music.search("never gonna give you up");
console.log("Search Results:", searchResults);
```
-------------------------------------------------


# 8. Destruction and Disconnect
-----------------------------
*Forcefully stop the queue and disconnect the bot from the voice channel.*

**Example:**
-------------------------------------------------
```javascript
await client.music.destroy(message);
```
-------------------------------------------------


# 9. Advanced Event Handling
--------------------------
*Capture events to monitor and react to various music actions.*

**When initializing MusicService, pass an "onEvent" callback:**

-------------------------------------------------
```javascript
const musicService = new Music(client, {
  onEvent: (event, ...args) => {
    switch (event) {
      case "playSong":
        console.log(`Now playing: ${args[1].name}`);
        break;
      case "voteSkipUpdate":
        console.log(`Skip Vote Update: ${args[1]} votes (${args[2]} members)`);
        break;
      case "customError":
        console.error("Error encountered:", args[0]);
        break;
      default:
        console.log(`Event ${event}:`, args);
    }
  }
});
```
-------------------------------------------------

*Emitted events include:*
  • playSong, addSong, addList, finish, empty, searchResult, searchCancel, disconnect, error
  • voteSkipUpdate, voteSkipSuccess, queueLoaded, customError

**Summary of All Features:**
------------------------
- Basic Playback: play, stop, skip, pause, resume, seek, jump, replay.
- Volume & Loop Controls: setVolume, increaseVolume, decreaseVolume, setLoop, toggleAutoplay.
- Queue Information: getQueueInfo, getQueueJSON, getProgressBar.
- Audio Effects & Filters: setFilter, setFilters, removeFilter, clearFilter, setEqualizer,
  setPlaybackSpeed, setTransition, setCrossfade, normalizeAudio.
- Skip Vote: voteSkip mechanism for collaborative skipping.
- Playlist Management: getPlayHistory, clearPlayHistory, saveQueueToFile, loadQueueFromFile.
- Search: search for songs using query strings.
- Destruction: destroy to stop playback and disconnect.
- Advanced Event Handling: custom events for all actions.

**License:**
--------
This project is licensed under the Apache 2.0 License.
