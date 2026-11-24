// Futuristic Neon UI Sound Synthesizer via Web Audio API (Zero external assets needed)
class NeonSoundEngine {
  constructor() {
    this.ctx = null
    this.muted = false
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  toggleMute() {
    this.muted = !this.muted
    if (!this.muted) {
      this.playClick()
    }
    return !this.muted
  }

  // Futuristic neon hover chime (Silky high-tech synthesizer blip)
  playHover() {
    if (this.muted) return
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(520, now)
      osc.frequency.exponentialRampToValueAtTime(860, now + 0.08)

      gain.gain.setValueAtTime(0.06, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.09)
    } catch {
      // Silently guarded if audio policy restricts
    }
  }

  // Satisfying neon energy pulse / club bass click
  playClick() {
    if (this.muted) return
    try {
      this.init()
      if (!this.ctx) return

      const now = this.ctx.currentTime

      // Punchy sub-bass drop
      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = 'triangle'
      osc.frequency.setValueAtTime(180, now)
      osc.frequency.exponentialRampToValueAtTime(45, now + 0.16)

      gain.gain.setValueAtTime(0.18, now)
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start(now)
      osc.stop(now + 0.17)
    } catch {
      // Silently guarded if audio policy restricts
    }
  }
}

export const neonSound = new NeonSoundEngine()
