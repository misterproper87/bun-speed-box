# bun-speed-box

A fast URL shortener built with [Bun](https://bun.sh), [ElysiaJS](https://elysiajs.com), and [Drizzle ORM](https://orm.drizzle.team). Links are stored in a local SQLite file.

## Stack

| Tool | Purpose |
|------|---------|
| [Bun](https://bun.sh) | Runtime & package manager |
| [ElysiaJS](https://elysiajs.com) | HTTP framework |
| [Drizzle ORM](https://orm.drizzle.team) | Type-safe SQLite ORM |
| [Biome.js](https://biomejs.dev) | Linter & formatter (replaces ESLint + Prettier) |

## Prerequisites

- [Bun](https://bun.sh) >= 1.0

## Setup

```bash
# Install dependencies
bun install

# Copy environment file
cp .env.example .env
```

## Database Migrations

Generate migration files from the schema:

```bash
bun run db:generate
```

Apply migrations to the SQLite database:

```bash
bun run db:migrate
```

> Migrations are stored in `./migrations/` and tracked by Drizzle Kit.  
> The database file defaults to `db.sqlite` (configurable via `DATABASE_URL` in `.env`).

## Running the App

```bash
# Development (hot reload)
bun run dev

# Production
bun run start
```

The server listens on `http://localhost:3000` by default (set `PORT` in `.env` to change).

## API

### `POST /shorten`

Shorten a URL.

**Request body:**
```json
{ "url": "https://example.com/some/long/path" }
```

**Response:**
```json
{ "code": "aB3xY7k", "shortUrl": "http://localhost:3000/aB3xY7k" }
```

---

### `GET /:code`

Redirects to the original URL (HTTP 302). Increments the visit counter.

---

### `GET /stats/:code`

Returns visit statistics for a short link.

**Response:**
```json
{
  "code": "aB3xY7k",
  "url": "https://example.com/some/long/path",
  "visits": 42,
  "createdAt": "2026-04-22T10:00:00.000Z"
}
```

## Testing

```bash
bun test
```

Tests use an in-memory SQLite database so they never touch `db.sqlite`.

## Linting & Formatting

```bash
# Check for issues
bun run lint

# Auto-fix and format
bun run check
```

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DATABASE_URL` | `db.sqlite` | Path to the SQLite database file |
| `PORT` | `3000` | HTTP port the server listens on |
