# Link Shortener

Create short links, track clicks live, and set links to expire.

**Stack:** TanStack Router / Query / Form / Table · Spring Boot 4 · MongoDB 8 · Docker


---

## Quick start (one command)

Needs only **Docker Desktop**. No Java, Node or MongoDB install required.

```powershell
.\run.ps1 start      # Windows (PowerShell)
./run.sh start       # macOS / Linux / Git Bash
```

Open **http://localhost:3000**. Stop with `.\run.ps1 stop`.

---

## Command cheat sheet

All commands are for **Windows PowerShell**, run from the **project root** (`link-shortener/`) unless the line starts with `cd`.
On macOS / Linux / Git Bash use `./run.sh` instead of `.\run.ps1`, and `./mvnw` instead of `.\mvnw.cmd`.

### Which mode do I use?

| I want to… | Mode | Why |
|---|---|---|
| Write or change code | **Dev mode** | Instant reload when you save a file |
| Show the project / demo / check the production build | **Docker mode** | Production builds, one command |
| Run the automated tests | **Tests** | Testcontainers starts its own throwaway MongoDB |

> ⚠️ Never run Dev mode and Docker mode at the same time: both use ports **3000** and **8080**.

### Docker mode (run the finished app)

| Task | Command |
|---|---|
| Start everything (builds if needed, waits, opens the browser) | `.\run.ps1 start` |
| Stop everything (links are kept) | `.\run.ps1 stop` |
| Is it running? | `.\run.ps1 status` |
| Watch live logs (Ctrl+C stops watching, app keeps running) | `.\run.ps1 logs` |
| Logs of one part only | `docker compose --profile full logs -f backend` (or `frontend`, `mongo`) |
| **After changing code:** rebuild and restart | `.\run.ps1 start` (rebuilds only what changed) |
| Rebuild and restart only one part | `docker compose --profile full up -d --build backend` (or `frontend`) |
| Rebuild from scratch (if changes don't show up) | `docker compose --profile full build --no-cache` then `.\run.ps1 start` |
| ⚠️ Delete **all links** and start with an empty database | `docker compose --profile full down -v` |
| Free disk space (old images and build cache) | `docker system prune` |

### Dev mode (while writing code)

Open three terminals:

| Step | Terminal | Command | Stop with |
|---|---|---|---|
| 1. Database | project root | `docker compose up -d` | `docker compose down` |
| 2. Backend (http://localhost:8080) | `cd backend` | `.\mvnw.cmd spring-boot:run` | Ctrl+C |
| 3. Frontend (http://localhost:3000) | `cd frontend` | `npm run dev` | Ctrl+C |

| Also useful | Command |
|---|---|
| First time, or after `package.json` changed | `cd frontend` then `npm install` |
| Backend from IntelliJ instead | Open `ShortenerApplication.java` → green ▶ next to `main` |
| Is the backend alive? | `curl.exe http://localhost:8080/api/ping` → `{"status":"ok"}` |

Start order is always **database → backend → frontend**.

### Switching between modes

| From → To | Do this |
|---|---|
| Dev → Docker | Ctrl+C in the backend and frontend terminals, then `.\run.ps1 start` (the dev database keeps running and is reused) |
| Docker → Dev | `.\run.ps1 stop`, then Dev mode steps 1–3 |

Both modes use the **same database volume**, so your links are the same in both.

### Tests

Docker Desktop must be running.

| Task | Command |
|---|---|
| Run all tests | `cd backend` then `.\mvnw.cmd test` |
| Run one test class | `.\mvnw.cmd test "-Dtest=CodeGeneratorTest"` |
| Check that test code compiles (no run) | `.\mvnw.cmd test-compile` |

Expected result: `Tests run: 7, Failures: 0` and `BUILD SUCCESS`.

### Build without Docker

| Task | Command | Output |
|---|---|---|
| Backend jar (also runs the tests) | `cd backend` then `.\mvnw.cmd package` | `backend/target/shortener-0.0.1-SNAPSHOT.jar` |
| Run that jar | `java -jar target/shortener-0.0.1-SNAPSHOT.jar` | backend on :8080 |
| Frontend static files (also type-checks) | `cd frontend` then `npm run build` | `frontend/dist/` |
| Preview the built frontend | `npm run preview` | http://localhost:4173 |

### Database

| Task | Command |
|---|---|
| Open in MongoDB Compass | Connect to `mongodb://localhost:27017` → database `shortener` → collection `links` |
| MongoDB shell in the container | `docker exec -it shortener-mongo mongosh shortener` |
| Count links (inside mongosh) | `db.links.countDocuments()` |
| See the indexes (inside mongosh) | `db.links.getIndexes()` → `code_1` (unique) and `expiresAt_1` (TTL) |

### Ports

| Port | What | Open in browser |
|---|---|---|
| 3000 | Frontend | http://localhost:3000 |
| 8080 | Backend API + short links | http://localhost:8080/api/ping |
| 27017 | MongoDB | Compass only |

### Quick fixes

| Problem | Fix |
|---|---|
| `port is already allocated` / `Port 8080 was already in use` | Something else uses the port: stop the other mode (see the warning above) |
| `error during connect` / `Could not find a valid Docker environment` | Start Docker Desktop and wait for "Engine running" |
| `.\run.ps1 cannot be loaded because running scripts is disabled` | Run once: `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| Page shows **Backend offline** | Backend still starting (wait 20 s) or crashed: `.\run.ps1 logs`, read the first `ERROR` |
| Backend log: `Connection refused` to 27017 | Database not running: `docker compose up -d` |
| CORS error in the browser console | Open exactly `http://localhost:3000` (not `127.0.0.1:3000`) |
| `.\mvnw.cmd` / `./mvnw` "not recognized" | You're in the wrong folder: `cd backend` first |
| Code changes don't show up in Docker mode | `.\run.ps1 start` again; if still old, rebuild from scratch (Docker table above) |

---

## Features

- Paste a long URL and get a short link like `http://localhost:8080/r/aB3x9Kp`
- Opening a short link redirects (302) to the original URL and counts the click
- Sortable list of links with delete; a live stats page per link (refreshes every 5 s)
- Links can expire after 1, 7 or 30 days
- Dangerous URLs are rejected and link creation is rate-limited
- Responsive design with light and dark mode

## Interesting problems solved

- **No lost clicks under concurrency:** clicks are counted with MongoDB's atomic `$inc`
  (findAndModify). An integration test fires 50 parallel clicks and checks every one is counted.
- **Unique random codes without check-then-insert races:** a unique index plus retry on duplicate key.
- **Expiring links:** a TTL index cleans up; queries also filter expired links, because the TTL
  cleaner only runs about once a minute.
- **Abuse protection:** http/https allowlist, redirect-loop check, per-IP rate limiting, strict CORS.
- **Production containers:** multi-stage Docker builds (JRE-only backend image, nginx-served
  frontend with SPA fallback), started together with Docker Compose and one script.

## Architecture

```
Browser ── TanStack app (nginx, :3000)
   │
   └────── Spring Boot REST API (:8080)
              controller → service → repository
                                         │
                                      MongoDB (:27017)
```

## API

| Method | Path | Description |
|---|---|---|
| GET | /api/ping | Health check |
| POST | /api/links | Create a short link `{ "url": "...", "expiresInDays": 7 }` |
| GET | /api/links | List active links |
| GET | /api/links/{code} | One link's details and stats |
| DELETE | /api/links/{code} | Delete a link |
| GET | /r/{code} | Redirect (302) and count the click |

## Project structure

```
link-shortener/
├── run.ps1 / run.sh          one-command start / stop / logs / status
├── compose.yaml              MongoDB (always) + backend + frontend (profile "full")
├── backend/                  Spring Boot (Java 21)
│   ├── Dockerfile
│   └── src/
│       ├── main/java/com/example/shortener/
│       │   ├── config/       AppProperties, WebConfig (CORS, rate limiter)
│       │   ├── common/       ping, error handling, rate limiter
│       │   └── link/         entity, repository, service, controllers, DTOs
│       └── test/java/…       unit + integration tests (Testcontainers)
└── frontend/                 TanStack (React + Vite)
    ├── Dockerfile
    ├── nginx.conf
    └── src/
        ├── routes/           pages: home, stats/$code
        ├── components/       form, table, copy button, status pill
        └── lib/              API client, formatting helpers
```

## Known limitations / next steps

- No authentication yet: anyone who can reach the API can list and delete links.
- The rate limiter is in-memory (per server instance).
- Runs locally with Docker; not deployed to a public URL.

