import {
  getUiAudioContext,
  resumeUiAudio,
  uiAudioAllowed,
} from "./df-ui-audio"

const SCRUB_FREQ_MIN = 210
const SCRUB_FREQ_SPAN = 260
const SCRUB_FILTER_IDLE = 720
const SCRUB_FILTER_SPAN = 980
const SCRUB_GAIN_IDLE = 0.018
const SCRUB_GAIN_MOVE = 0.055
const SCRUB_GAIN_SILENCE = 0.0001
const SCRUB_SPEED_REF = 1.8
const SCRUB_FREQ_SMOOTH = 0.045
const SCRUB_FILTER_SMOOTH = 0.05
const SCRUB_GAIN_SMOOTH = 0.04
const SCRUB_STOP_FADE = 0.03
const SCRUB_STOP_DISPOSE_MS = 140

type ScrubSession = {
  osc: OscillatorNode
  filter: BiquadFilterNode
  gain: GainNode
  lastRatio: number
  lastTime: number
}

let session: ScrubSession | null = null
let stopTimer: ReturnType<typeof setTimeout> | null = null
let watchingVisibility = false

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

function freqForRatio(ratio: number) {
  return SCRUB_FREQ_MIN + clamp01(ratio) * SCRUB_FREQ_SPAN
}

function clearStopTimer() {
  if (stopTimer == null) return
  clearTimeout(stopTimer)
  stopTimer = null
}

function handleVisibilityChange() {
  if (typeof document !== "undefined" && document.hidden) {
    stopUiScrub()
  }
}

function setVisibilityWatch(enabled: boolean) {
  if (typeof document === "undefined") return
  if (enabled && !watchingVisibility) {
    document.addEventListener("visibilitychange", handleVisibilityChange)
    watchingVisibility = true
    return
  }
  if (!enabled && watchingVisibility) {
    document.removeEventListener("visibilitychange", handleVisibilityChange)
    watchingVisibility = false
  }
}

function disposeSession(next: ScrubSession) {
  try {
    next.osc.stop()
  } catch {}
  next.osc.disconnect()
  next.filter.disconnect()
  next.gain.disconnect()
}

export function resumeUiScrubAudio(): void {
  resumeUiAudio()
}

export function startUiScrub(ratio: number): void {
  clearStopTimer()
  if (session) {
    disposeSession(session)
    session = null
  }
  if (!uiAudioAllowed()) {
    setVisibilityWatch(false)
    return
  }

  const ctx = getUiAudioContext()
  if (!ctx) return
  if (ctx.state === "suspended") {
    void ctx.resume()
  }

  const osc = ctx.createOscillator()
  osc.type = "sine"
  osc.frequency.value = freqForRatio(ratio)

  const filter = ctx.createBiquadFilter()
  filter.type = "lowpass"
  filter.frequency.value = SCRUB_FILTER_IDLE
  filter.Q.value = 0.7

  const gain = ctx.createGain()
  gain.gain.value = SCRUB_GAIN_IDLE

  osc.connect(filter)
  filter.connect(gain)
  gain.connect(ctx.destination)
  osc.start()

  session = {
    osc,
    filter,
    gain,
    lastRatio: clamp01(ratio),
    lastTime: performance.now(),
  }
  setVisibilityWatch(true)
}

export function updateUiScrub(ratio: number, now = performance.now()): void {
  if (!session) return
  if (!uiAudioAllowed()) {
    stopUiScrub()
    return
  }

  const nextRatio = clamp01(ratio)
  const dt = Math.max(0.001, (now - session.lastTime) / 1000)
  const speed = clamp01(
    Math.abs(nextRatio - session.lastRatio) / dt / SCRUB_SPEED_REF
  )
  const t = session.osc.context.currentTime

  session.osc.frequency.setTargetAtTime(
    freqForRatio(nextRatio),
    t,
    SCRUB_FREQ_SMOOTH
  )
  session.filter.frequency.setTargetAtTime(
    SCRUB_FILTER_IDLE + speed * SCRUB_FILTER_SPAN,
    t,
    SCRUB_FILTER_SMOOTH
  )
  session.gain.gain.setTargetAtTime(
    SCRUB_GAIN_IDLE + speed * (SCRUB_GAIN_MOVE - SCRUB_GAIN_IDLE),
    t,
    SCRUB_GAIN_SMOOTH
  )

  session.lastRatio = nextRatio
  session.lastTime = now
}

export function stopUiScrub(): void {
  if (!session) {
    setVisibilityWatch(false)
    return
  }
  const active = session
  session = null
  clearStopTimer()

  const t = active.osc.context.currentTime
  active.gain.gain.cancelScheduledValues(t)
  active.gain.gain.setTargetAtTime(SCRUB_GAIN_SILENCE, t, SCRUB_STOP_FADE)

  stopTimer = setTimeout(() => {
    stopTimer = null
    disposeSession(active)
    if (!session) setVisibilityWatch(false)
  }, SCRUB_STOP_DISPOSE_MS)
}
