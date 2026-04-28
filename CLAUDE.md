# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

12星座男友手账 (Zodiac Boyfriend Journal) — an interactive mobile-first web app where users chat with AI-powered zodiac boyfriend characters, progress through relationship stages, and collect memory cards.

## Commands

```bash
npm run dev      # Start dev server (localhost:3000)
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Run ESLint (next/core-web-vitals + next/typescript)
```

## Tech Stack

- **Framework**: Next.js 16 (App Router) + React 19
- **Language**: TypeScript (strict mode, path alias `@/*` → `./src/*`)
- **Styling**: Tailwind CSS 4 + CSS custom properties (dark theme, pink/gold accents)
- **Database**: Supabase (tables: `users`, `chat_messages`, `progress`, `memory_cards`)
- **AI**: DeepSeek API (`deepseek-chat` model) for boyfriend persona responses
- **UI Library**: antd-mobile

**IMPORTANT**: This uses Next.js 16 which has breaking changes from training data. Read guides in `node_modules/next/dist/docs/` before writing code.

## Architecture

### Route Structure (`src/app/`)

```
(login|register)/page.tsx     — Auth pages (public)
(main)/                       — Route group for authenticated pages
  home/page.tsx               — Dashboard with current boyfriend card
  select/page.tsx             — Zodiac boyfriend selection grid
  chat/page.tsx               — Chat interface (query param: ?sign=aries)
  gallery/page.tsx            — Memory card collection / progress viewer
api/auth/(login|register|logout|me)/route.ts  — Cookie-based auth endpoints
api/chat/route.ts             — AI chat with progress tracking
api/progress/route.ts         — Relationship progress CRUD
api/memory-cards/route.ts     — Memory card retrieval
```

### Core Game Loop

1. User selects a zodiac boyfriend → creates progress record (stage: `stranger`, progress: 0)
2. Chat messages sent to DeepSeek API with character system prompt
3. Each message increments progress (random +5-12), potentially triggering stage transitions
4. Stage thresholds: stranger(0) → ambiguous(30) → crush(60) → lover(85)
5. Memory cards unlock at progress milestones
6. Occupation unlock triggers when user mentions career-related keywords

### Key Modules

- `src/lib/db.ts` — Supabase client wrapper, reads `user_id` from httpOnly cookie
- `src/lib/deepseek.ts` — DeepSeek API client + system prompt builder with character persona, stage-aware call names, and occupation reveal logic
- `src/constants/boyfriends.ts` — All 12 boyfriend profiles (name, personality, backstory, chat examples per stage, call names per stage)
- `src/constants/daily-topics.ts` — Keyword-matched daily conversation topics + image message triggers
- `src/constants/images-game.ts` — Placeholder images via picsum.photos + zodiac emoji mapping
- `src/contexts/AuthContext.tsx` — Client auth state via React context, wraps entire app in root layout
- `src/components/BackgroundEffects.tsx` — StarField + AuroraBackground decorative components

### Auth Flow

Simple cookie-based auth (no JWT/session library in use despite `jose` in dependencies). Password stored in plaintext in Supabase `users` table. `user_id` cookie set on login/register, read server-side via `cookies()`.

### Theming

CSS custom properties define the dark theme. Key variables: `--bg-primary`, `--bg-card`, `--accent-pink`, `--accent-gold`, `--gradient-pink`, `--glow-pink`, `--text-primary`, `--text-secondary`, `--border-light`. Glass morphism via `.glass-card` and `.glow-border` classes.
