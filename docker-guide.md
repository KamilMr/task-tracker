# Docker Production Setup Guide

This guide explains how to containerize the task-tracker for production deployment.

## Files Overview

| File | Purpose |
|------|---------|
| `Dockerfile` | Multi-stage build (builder → production) |
| `docker-compose.yml` | 4 services: tracker, migrations, db, db-init |
| `.env.example` | Template for environment variables |
| `README.md` | Add Docker deployment section |

---

## Dockerfile Explained

### What is a Dockerfile?

A Dockerfile is a recipe for building a Docker image. Think of it like a script that tells Docker: "Start with this base, add these files, run these commands, and here's how to start the app."

### Multi-stage Builds

```dockerfile
FROM node:20-alpine AS builder
# ... build steps ...

FROM node:20-alpine AS production
COPY --from=builder /app/dist ./dist
```

**Why multi-stage?**

Imagine you're shipping a product. You need tools to build it (hammer, saw, drill), but the customer only needs the finished product. Multi-stage builds work the same way:

- **Stage 1 (builder)**: Has all dev tools (Babel, devDependencies) - big and heavy
- **Stage 2 (production)**: Only the compiled code and runtime deps - small and fast

The final image only contains Stage 2. Your ~500MB build environment becomes a ~150MB production image.

### Key Dockerfile Instructions

```dockerfile
WORKDIR /app
```
Sets the "current directory" inside the container. All subsequent commands run from here.

```dockerfile
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
```
**Why copy package files first?**

Docker caches each layer. If you copy everything at once, changing ANY file invalidates the cache. By copying package files first:
- Change source code → only rebuild from `COPY . .` onwards
- Change dependencies → rebuild from `pnpm install` onwards

This saves minutes on each build.

```dockerfile
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs
```
**Security best practice**: Never run as root. If your app gets compromised, the attacker has limited permissions.

```dockerfile
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node --eval "process.exit(0)" || exit 1
```
Docker periodically runs this check. If it fails 3 times, the container is marked "unhealthy". Orchestrators like Docker Compose use this to know when a service is ready.

---

## docker-compose.yml Explained

### What is Docker Compose?

Running one container is easy. Running multiple containers that talk to each other, start in order, and share configuration? That's Docker Compose.

### Service Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    docker-compose.yml                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────┐    ┌────────────┐    ┌─────────────────┐  │
│  │    db    │───▶│  db-init   │───▶│   migrations    │  │
│  │ (MySQL)  │    │ (one-time) │    │   (one-time)    │  │
│  └──────────┘    └────────────┘    └────────┬────────┘  │
│       │                                      │          │
│       │              ┌───────────────────────┘          │
│       │              ▼                                  │
│       │         ┌─────────┐                             │
│       └────────▶│ tracker │                             │
│                 │  (app)  │                             │
│                 └─────────┘                             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Service Dependencies

```yaml
depends_on:
  db:
    condition: service_healthy
```

This means: "Don't start me until `db` passes its healthcheck."

Without `condition: service_healthy`, Docker only waits for the container to START, not for MySQL to be READY. Your app would crash trying to connect to a database that's still initializing.

### The Four Services

**1. db (MySQL)**
```yaml
db:
  image: mysql:8.0
  volumes:
    - mysql_data:/var/lib/mysql
  healthcheck:
    test: ['CMD', 'mysqladmin', 'ping', '-h', 'localhost']
```
- Uses official MySQL image
- Named volume `mysql_data` persists data (survives `docker-compose down`)
- Healthcheck pings MySQL to confirm it's accepting connections

**2. db-init (One-time setup)**
```yaml
db-init:
  depends_on:
    db:
      condition: service_healthy
  entrypoint: >
    sh -c "mysql -h db -u root -p... -e 'CREATE DATABASE IF NOT EXISTS...'"
```
- Waits for db to be healthy
- Creates the database if it doesn't exist
- Runs once and exits (no `restart` policy)

**3. migrations (Schema setup)**
```yaml
migrations:
  depends_on:
    db-init:
      condition: service_completed_successfully
  command: pnpm knex migrate:latest --knexfile src/db/knexfile.js
```
- Waits for db-init to COMPLETE (not just start)
- Runs Knex migrations to create tables
- Runs once and exits

**4. tracker (The app)**
```yaml
tracker:
  depends_on:
    migrations:
      condition: service_completed_successfully
    db:
      condition: service_healthy
  stdin_open: true
  tty: true
```
- Waits for migrations to complete
- `stdin_open` + `tty` = interactive terminal (required for Ink/React terminal UI)
- `restart: unless-stopped` = auto-restart on crash

### Why stdin_open and tty?

Normal Docker containers run headless (no terminal). But task-tracker is a terminal UI app built with Ink. It needs:
- `tty: true` - Allocate a pseudo-TTY (terminal)
- `stdin_open: true` - Keep stdin open for keyboard input

Without these, Ink can't render or receive keystrokes.

### Named Volumes

```yaml
volumes:
  mysql_data:
    driver: local
```

Three ways to persist data:
1. **Bind mount**: `-v /host/path:/container/path` - Maps host directory
2. **Named volume**: `mysql_data:/var/lib/mysql` - Docker manages location
3. **Anonymous volume**: Just `/var/lib/mysql` - Lost on container removal

Named volumes are best for databases:
- Docker manages the storage location
- Portable across machines
- Easy to backup: `docker volume inspect mysql_data`

---

## .env.example Explained

```bash
MYSQL_HOST=db           # Service name from docker-compose (Docker DNS)
MYSQL_USER=root
MYSQL_PASSWD=secret
MYSQL_DATABASE=task_tracker_v1
MYSQL_ROOT_PASSWORD=secret
```

**Why `MYSQL_HOST=db`?**

Docker Compose creates a network where services can reach each other by name. The `db` service is accessible at hostname `db`, not `localhost`.

---

## Common Pitfalls

### 1. "Connection refused" on startup
Your app starts before the database is ready. Solution: Use `depends_on` with `condition: service_healthy`.

### 2. Data disappears after restart
You forgot to use a volume. Add:
```yaml
volumes:
  - mysql_data:/var/lib/mysql
```

### 3. Can't type in the app
Missing `stdin_open: true` and `tty: true` for terminal apps.

### 4. Build is slow every time
You're copying all files before installing dependencies. Copy `package.json` first, install, then copy the rest.

### 5. Image is huge (1GB+)
- Use Alpine base images (`node:20-alpine` not `node:20`)
- Use multi-stage builds
- Add `.dockerignore` to exclude `node_modules`, `.git`, etc.

---

## Commands Reference

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f tracker

# Attach to interactive app
docker attach <container-name>
# Detach: Ctrl+P, Ctrl+Q

# Stop everything
docker-compose down

# Stop and delete volumes (loses data!)
docker-compose down -v

# Rebuild after code changes
docker-compose up -d --build

# Check service status
docker-compose ps
```

---

## Learning Resources

- [Dockerfile reference](https://docs.docker.com/reference/dockerfile/)
- [Docker Compose file reference](https://docs.docker.com/compose/compose-file/)
- [Multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
- [Docker volumes](https://docs.docker.com/storage/volumes/)
