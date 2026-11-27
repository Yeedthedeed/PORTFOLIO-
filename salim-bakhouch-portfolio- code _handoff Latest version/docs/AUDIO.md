# AUDIO

One engine: `src/audio/SoundEngine.ts` exporting the global `sfx` instance.

## Public API
`init`, `enable`, `disable`, `toggle`, `setVolume`, `subscribe`, `cursor`,
`hover`, `press`, `release`, `drag`, `scroll`, `holdStart`, `holdEnd`, `morph`,
`open`, `close`, `transition`, `section`, `develop`, plus the legacy aliases
`navigate`, `click`, `tap`, `swipe`, `reveal` that now resolve to the new
palette.

## Sound identity (current)
Glass filament, brushed metal, felt-damped mechanism, glass/metal release,
analogue friction, film-transport tick, glass suspension (hold), slow optical
rack (morph), composed thresholds and air transitions. No arcade or generic UI
clicks.

## Ambient bed
31 Hz sub floor, 620 Hz band-limited tape air, 62/93 Hz fifth harmonic through a
slow LFO filter drift. Starts only when browser policy allows (after a permitted
gesture); fades in over 2.8 s.

## State
Explicit mute is persisted as `cine-audio` (`"0"` = muted) and is authoritative;
a later autoplay-unlock handler may never override it. Volume is persisted as
`cine-volume` (0…1) and drives the single master bus. Every mounted
`AudioToggle` subscribes to the same engine.

## Safety
Gain envelopes start above the exponential floor and frequencies are clamped,
so `exponentialRampToValueAtTime` can no longer throw. Stereo panning is used
where supported. One coherent system; never add a parallel audio engine.


## Audit status (Phase 01)

Architecture verified in source and runtime interaction: one engine, persisted
mute/volume, no Web Audio `exponentialRampToValueAtTime` errors on tested
journeys. Sound character was **not auditioned** (headless Chromium is muted);
do not infer sound quality from the source.
