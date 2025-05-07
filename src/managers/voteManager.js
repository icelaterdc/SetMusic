class VoteManager {
  constructor() {
    this.voteSkips = new Map();
  }

  voteSkip(queue, userId, emitEvent) {
    const channelId = queue.voiceChannel.id;
    if (!this.voteSkips.has(channelId)) this.voteSkips.set(channelId, new Set());
    const votes = this.voteSkips.get(channelId);
    votes.add(userId);
    const membersInVoice = queue.voiceChannel.members.filter(m => !m.user.bot).size;
    if (votes.size >= Math.ceil(membersInVoice / 2)) {
      this.voteSkips.delete(channelId);
      if (typeof emitEvent === "function") {
        emitEvent("voteSkipSuccess", channelId);
      }
      return { success: true, votes: votes.size, members: membersInVoice };
    } else {
      if (typeof emitEvent === "function") {
        emitEvent("voteSkipUpdate", channelId, votes.size, membersInVoice);
      }
      return { success: false, votes: votes.size, members: membersInVoice };
    }
  }
}

module.exports = VoteManager;
