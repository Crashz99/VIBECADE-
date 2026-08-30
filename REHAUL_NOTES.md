# VIBECADE V4 Rehaul Notes

## Direction change
Customization is no longer the main product flow. The app now opens into a lobby of distinct rooms: Music, Study, Notes, Arcade, and Schedule. World/cartridge customization lives behind a secondary **Tune the world** control.

## New theatrical opening
The first lobby entry runs a CSS-only black-and-white staircase scene: a piano falls, crashes, and Whistle Duck escapes from underneath it.

## Mascot roles
- Cat: chaos/procrastination.
- Inspector Dog: study/focus enforcement.
- Whistle Duck: time/scheduling.

## New systems
- dedicated page-like room screens
- Music Room with persistent local playlist shelf
- Study Hall with XP/ranks
- Scratchpad room
- Arcade room
- Schedule room with local entries and optional browser notifications
- scheduled entries can launch a requested focus mode
- compact World Tuner modal

## Persistence
Schedule data is added to the existing local-data export. Playlist audio remains stored locally in IndexedDB.

## V5 personality pass
The final pass deliberately favors memorable micro-interactions over additional productivity surface area. Color packs and room finishes add visual range without bringing customization back to the foreground. A small encounter director reacts to usage and can unlock local curios such as the Cassette Ghost, Moth Librarian, Calendar Snail, Arcade Rat and Inspector Gold Baton. Each room also contains a faint secret hotspot for users who like poking at interfaces. The lobby curio shelf acts as the persistent collection display.
