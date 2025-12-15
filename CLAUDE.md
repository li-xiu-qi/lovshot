# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**lovshot** - A GIF screenshot desktop application built with Tauri 2 + React 19 + TypeScript + Vite.

## Development Commands

```bash
# Frontend dev server (runs on port 1420)
pnpm dev

# Tauri desktop app development
pnpm tauri dev

# Build production bundle
pnpm tauri build

# Type check
pnpm build  # runs tsc && vite build
```

## Architecture

```
src/              # React frontend (TypeScript)
  main.tsx        # React entry point
  App.tsx         # Main application component

src-tauri/        # Rust backend (Tauri 2)
  src/lib.rs      # Tauri commands and app builder
  src/main.rs     # Desktop entry point
  tauri.conf.json # Tauri configuration
  Cargo.toml      # Rust dependencies
```

## Key Patterns

- **Tauri Commands**: Define in `src-tauri/src/lib.rs` with `#[tauri::command]`, register in `invoke_handler`
- **Frontend-Backend IPC**: Use `invoke()` from `@tauri-apps/api/core` to call Rust commands
- **Hot Reload**: Frontend changes auto-reload; Rust changes require restart

## Bundle Identifier

`app.lovpen.shot`
