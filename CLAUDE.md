# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run dev        # Start Next.js dev server on port 3000
npm run build      # Production build
npm run lint       # ESLint
npm test           # Run Jest tests
npm run test:watch # Jest in watch mode
```

## Architecture Overview

Luma Mail is an AI-powered email client built with Next.js 16 App Router and React 19.

### Core Layers

- **Presentation**: React components in `app/` (pages/routes) and `components/ui/` (shadcn components)
- **API**: Route handlers in `app/api/` - Better-auth at `/api/auth/[...all]`, Aurinko email sync at `/api/aurinko/`
- **Services**: Business logic in `lib/services/` (email sync operations)
- **Repository**: Data access in `lib/repository/` (thread, email, account repos)
- **Database**: Drizzle ORM with PostgreSQL (Neon) - schema in `db/schema.ts`

### Dashboard Structure

The dashboard uses a 3-column resizable layout (`react-resizable-panels` v2.1.7):
- Sidebar (16%): Account selector, folders, compose button
- Email List (26%): Search, filters, thread list
- Email Detail (58%): Email content and actions

Dashboard components live in `app/dashboard/_components/`.

### Key Integrations

- **Authentication**: Better-auth with GitHub/Google OAuth and email/password
- **Email Sync**: Aurinko API for Gmail/IMAP integration via `lib/clients/aurinko-email-client.ts`
- **UI Components**: shadcn/ui built on Radix UI primitives

## Conventions

### Commit Messages

Follow conventional commits format:
```
<type>(<scope>): <description>
```
Types: `feat`, `fix`, `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, `test`, `revert`

Examples: `feat(dashboard): add sidebar`, `fix(auth): handle token refresh`

### Component Patterns

- Server Components by default; add `'use client'` only when needed for interactivity
- Route groups use parentheses: `(auth)` for auth pages
- Private components use underscore prefix: `_components/`
- Use `cn()` utility from `lib/utils.ts` for class merging

### Styling

- Tailwind CSS 4 with CSS variables for theming
- Dark mode via `next-themes` - colors defined in `app/globals.css`
- shadcn components configured in `components.json`

## Environment Variables

Required in `.env.local`:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` - Auth configuration
- `GITHUB_CLIENT_ID/SECRET`, `GOOGLE_CLIENT_ID/SECRET` - OAuth providers
- `AURINKO_CLIENT_ID/SECRET` - Email integration

## Agent Usage

Use the `coding-advisor` agent proactively (without being asked) when:
- User asks "how should I...", "what's the best way to...", "explain..."
- Questions about architecture, design patterns, or trade-offs
- User wants to understand concepts before implementation
- Discussion is about structure/approach, not "write this code"
