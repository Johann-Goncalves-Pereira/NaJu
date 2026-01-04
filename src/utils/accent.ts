// Accent color manager: animates an OKLCH hue over time and persists the
// current hue in localStorage so reloads restore the same accent.
import { Effect } from 'effect'

import { AccentPersistenceError, StorageUnavailable, toUnexpected } from '@/types/effectErrors'

const LS_KEY = 'xoice:accent:hue:v1'

type AccentOptions = {
	// seconds for a full 360° cycle (more human-friendly)
	speed?: number
	chroma?: number
	lightness?: number
	// ms, throttle saves to localStorage
	saveInterval?: number
	// ms, minimum gap between visual hue changes
	changeInterval?: number
}

const CONFIG = {
	// full loop duration in seconds (default 120s)
	speed: 120,
	// allowed chroma range to keep colors in gamut and accessible
	minChroma: 0.05,
	maxChroma: 0.38,
	// minimum gap between visual hue updates (ms)
	changeInterval: 1000,
}

let rafId: number | null = null
let startTs = 0
let baseHue = 0
type InternalOptions = {
	duration: number
	chroma: number
	lightness: number
	saveInterval: number
	changeInterval: number
}

let options: InternalOptions
let lastSave = 0
let lastChangeTs = 0
let lastAppliedHue = 0

function easeInOutSine(x: number) {
	// smooth ease that loops well
	return -(Math.cos(Math.PI * x) - 1) / 2
}

function clamp(n: number, a: number, b: number) {
	return Math.min(b, Math.max(a, n))
}

function oklchString(h: number, L: number, C: number) {
	// keep hue in 0..360 and format like the project uses
	const hue = ((h % 360) + 360) % 360
	return `oklch(${L} ${C} ${hue})`
}

function applyHue(h: number) {
	const root = document.documentElement
	root.style.setProperty('--accent', oklchString(h, options.lightness, options.chroma))
}

function saveHue(h: number) {
	try {
		localStorage.setItem(LS_KEY, String(h))
	} catch (err) {
		// warn so developers know persistence failed (e.g. private mode)
		// but don't throw — fall back to in-memory behavior
		console.warn('[accent] failed to save hue to localStorage:', err)
	}
}

function loadHue(): number | null {
	try {
		const v = localStorage.getItem(LS_KEY)
		if (!v) return null
		const n = Number(v)
		if (Number.isFinite(n)) return n
		return null
	} catch (err) {
		console.warn('[accent] failed to load hue from localStorage:', err)
		return null
	}
}

function tick(ts: number) {
	if (!startTs) startTs = ts
	const elapsed = ts - startTs
	const progress = (elapsed % options.duration) / options.duration
	const eased = easeInOutSine(progress)
	const hue = (baseHue + eased * 360) % 360
	// Only apply visual changes at most once per changeInterval. This keeps
	// the accent stable for small changes while the internal animation keeps
	// progressing and saves remain throttled separately.
	const nowMs = Date.now()
	const timeSinceLastChange = nowMs - lastChangeTs
	const angularDiff = Math.abs(((hue - lastAppliedHue + 540) % 360) - 180)

	if (timeSinceLastChange >= options.changeInterval && angularDiff > 0.1) {
		applyHue(hue)
		lastAppliedHue = hue
		lastChangeTs = nowMs
	}

	// throttle saves
	if (nowMs - lastSave > options.saveInterval) {
		saveHue(hue)
		lastSave = nowMs
	}

	rafId = requestAnimationFrame(tick)
}

const accent = {
	init(opts?: AccentOptions) {
		options = {
			// convert speed seconds -> duration ms
			duration: (opts?.speed ?? CONFIG.speed) * 1000,
			chroma: clamp(opts?.chroma ?? 0.28, CONFIG.minChroma, CONFIG.maxChroma),
			lightness: opts?.lightness ?? 0.78,
			saveInterval: opts?.saveInterval ?? 1500,
			changeInterval: opts?.changeInterval ?? CONFIG.changeInterval,
			...(opts ?? {}),
		} as Required<AccentOptions> & { duration: number }

		// expose config defaults for debugging
		// eslint-disable-next-line no-console
		console.debug('[accent] initialized with options', options)

		// restore saved hue if available
		const saved = loadHue()
		if (saved !== null) {
			baseHue = saved
		} else {
			// choose a starting hue seeded by current time for a pleasing start
			baseHue = (Date.now() / 1000) % 360
		}

		// apply immediately so UI doesn't flash. Also add a CSS transition
		// on the root element so changes appear smooth even though we only
		// update at most once per `changeInterval`.
		const root = document.documentElement
		const prevTransition = root.style.transition
		root.style.transition = 'color 700ms ease, background-color 700ms ease'
		applyHue(baseHue)
		lastAppliedHue = baseHue
		// keep previous transition intact (no-op if unset)
		// setTimeout avoids clobbering transitions if other code expects them
		setTimeout(() => {
			root.style.transition = prevTransition
		}, 800)
	},

	start() {
		if (rafId != null) return
		startTs = 0
		rafId = requestAnimationFrame(tick)
	},

	stop() {
		if (rafId != null) cancelAnimationFrame(rafId)
		rafId = null
	},

	getHue() {
		return baseHue
	},
}

export default accent

// Effect-based wrappers for accent operations (optional use)
export const accentEffects = {
	init: (opts?: AccentOptions) =>
		Effect.try({
			try: () => {
				accent.init(opts)
				return true
			},
			catch: cause => toUnexpected('accent.init', cause),
		}),
	start: Effect.try({
		try: () => {
			accent.start()
			return true
		},
		catch: cause => toUnexpected('accent.start', cause),
	}),
	stop: Effect.try({
		try: () => {
			accent.stop()
			return true
		},
		catch: cause => toUnexpected('accent.stop', cause),
	}),
	getHue: Effect.try({
		try: () => accent.getHue(),
		catch: cause => toUnexpected('accent.getHue', cause),
	}),
	load: Effect.try({
		try: () => {
			if (typeof localStorage === 'undefined') throw new StorageUnavailable({})
			const raw = localStorage.getItem(LS_KEY)
			if (!raw) throw new AccentPersistenceError({ action: 'load', reason: 'missing' })
			return Number(raw)
		},
		catch: cause =>
			cause instanceof AccentPersistenceError ? cause : toUnexpected('accent.load', cause),
	}),
}
