# Notepad

> A Discord bot for creating, sharing, and setting reminders on personal notes — built with `discord.js` v12 and a SQLite-backed persistence layer.

**Status: Retired.** Notepad is no longer hosted or maintained. This repository is kept public as a portfolio piece showcasing the architecture, feature set, and engineering decisions behind the project. The code is preserved as-is from its last active development period (December 2020 – January 2021).

---

## Overview

Notepad was a multi-server Discord bot that let users create text notes, optionally share them with a co-owner, and schedule reminders that would ping them with the note's content after a configurable delay. It also included a lightweight AFK system and a set of owner-only administration tools.

At its peak the bot served multiple guilds and handled per-user note storage, reminder scheduling, and reaction-based pagination entirely through Discord's message interface.

## Features

### Notes
- **Create notes** (`note!addnote`) — up to 50 notes per user, 1,000 characters each, with an optional co-owner who can also edit
- **View notes** (`note!notepad`) — paginated, reaction-based browsing with a searchable index (`--search:<text>`)
- **Edit notes** (`note!editnote`) — supports inline content editing, renaming (`--editname:`), and reassigning co-owners (`--editcoowner:`)
- **Delete notes** (`note!deletenote`) — with confirmation prompts and cascading reminder cleanup
- **Co-owned notes** (`note!coowned`) — view all notes you co-own across other users

### Reminders
- **Set reminders** (`note!remind`) — schedule a ping that delivers the note's content after a human-readable duration (e.g. `3d`, `2h30m`)
- **View reminders** (`note!reminders`) — paginated list of active reminders with time remaining
- **Loop reminders** (`note!loopreminder`) — repeat a reminder up to 10 times (gated behind bot-list voting)

### Utility
- **AFK system** (`note!afk`) — set an away status; the bot auto-responds when you're mentioned and tracks how many pings you received while away
- **Bot info** (`note!botinfo`) — live stats on server count, uptime, CPU/RAM usage, and command count
- **Help** (`note!help`) — categorized command listing with per-command usage and aliases
- **Ping** (`note!ping`) — websocket and message round-trip latency
- **Suggestions** (`note!suggest`) — forward feature ideas to a dedicated feedback channel

### Owner-Only Administration
- **Blacklist** (`note!blacklist`) — block users from using the bot, with a reason stored and surfaced on attempted use
- **Evaluate** (`note!evaluate`) — safely eval JavaScript with paginated output, type inspection, and token redaction
- **Reload** (`note!reload`) — hot-reload individual commands or entire categories without restarting the process
- **Restart** (`note!restart`) — gracefully shut down the process (used with a process manager for auto-restart)

## Technical Highlights

| Area | Implementation |
|------|---------------|
| **Runtime** | Node.js + `discord.js` v12 |
| **Persistence** | `enmap` backed by SQLite (`data/enmap.sqlite`) — three stores for notes, blacklists, and AFK states |
| **Reminder scheduling** | In-memory `setTimeout` queue that rehydrates from the database on startup, so reminders survive restarts |
| **Flag parsing** | Custom `String.prototype.parseFlags` / `parseFlagsWithOptions` helpers supporting `--flag` and `--flag:value` syntax |
| **Pagination** | Reaction-based collectors (⏪ ◀️ ▶️ ⏩) for browsing notes, reminders, and eval output — no external pagination library |
| **Diff rendering** | `jest-diff` used to show before/after changes when editing or deleting notes |
| **Command loading** | Dynamic `fs.readdirSync` loader that registers commands from `commands/{notes,other,creator}/` at startup |
| **Cooldowns** | Per-user, per-command cooldown system built on `Discord.Collection` |
| **Status rotation** | Rotating presence cycling server/user/channel counts every ~5.5 seconds |
| **Bot-list integration** | Server count posted to VoidBots API on ready; `loopreminder` gated behind vote status |

## Project Structure

```
Notepad/
├── index.js                 # Bot entry point: event handlers, DB init, reminder engine, flag parsers
├── config.json              # Bot token & API keys (empty in repo — secrets stripped)
├── package.json
├── structures/
│   └── Reminders.js         # Reminder class scaffold (WIP abstraction layer)
├── commands/
│   ├── notes/               # addnote, editnote, deletenote, notepad, coowned,
│   │                        #   remind, reminders, loopreminder, editreminder, deletereminder
│   ├── other/               # afk, botinfo, help, ping, suggest
│   └── creator/             # blacklist, evaluate, reload, restart (owner-only)
└── data/
    └── enmap.sqlite         # SQLite database file (not included)
```

## License

ISC — see `package.json`.

---

Built by [DaRealDorseyBro](https://github.com/DaRealDorseyBro).
