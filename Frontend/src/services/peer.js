class PeerService {
  constructor() {
    if (!this.peer) {
      this.peer = new RTCPeerConnection({
        iceServers: [
          {
            urls: [
              'stun:stun.l.google.com:19302',
              'stun:global.stun.twilio.com:3478'
            ]
          }
        ]
      })
    }
  }

  async createOffer() {
    if (this.peer) {
      const offer = await this.peer.createOffer()
      await this.peer.setLocalDescription(new RTCSessionDescription(offer))
      return offer
    }
  }

  async createAnswer(offer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(offer)
      const answer = await this.peer.createAnswer()
      await this.peer.setLocalDescription(new RTCSessionDescription(answer))
      return answer
    }
  }

  async setAnswer(answer) {
    if (this.peer) {
      await this.peer.setRemoteDescription(new RTCSessionDescription(answer))
    }
  }
  
  async disconnect() {
    if (this.peer) {
      this.peer.close()
      this.peer.getSenders().forEach(sender => sender.track.stop());
      this.peer.getReceivers().forEach(receiver => {
        if (receiver.track) {
          receiver.track.stop();
        }
      });
      this.peer = null
    }
  }
}

export default new PeerService()