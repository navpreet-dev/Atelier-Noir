# SNAPSHOT "fully" — Complete Version Backup

**Created:** 2026-09-11 19:23
**State:** Working site after Task-13 rollback. Approved hero fix (88vh+9px), CategoryCards pt-[74px], all 18 pages, 33 products, 6 journal posts, full DB, all photos/videos/fonts.
**Verified at snapshot time:** server 200, lint clean, rendered in browser at 1440×900.

## What is saved (3 layers)

| Layer | File | Size | Contains |
|---|---|---|---|
| 1. Git tag | tag `fully` inside project `.git` | — | All source, public assets, db, research |
| 2. Git bundle | `fully.bundle` (in `backups/` + `/home/z/backups/`) | 45 MB | Complete history + tag, one portable file |
| 3. FULL archive | `fully-full.tar.gz` (in `backups/` + `/home/z/backups/`) | 817 MB | **EVERYTHING: 70,001 files — every page, db, photos, videos, fonts, styles, text, layout, node_modules, build cache** |

Both copies live in TWO locations:
- `/home/z/backups/` (outside the project — survives project damage)
- `/home/z/my-project/backups/` (inside the project — survives home-dir damage)

## How to recall this version

```bash
# FULL restore — exact byte-for-byte copy of everything:
bash /home/z/backups/RESTORE-FULLY.sh
# (or the copy inside the project: bash /home/z/my-project/backups/RESTORE-FULLY.sh)

# Code-only restore (faster, keeps running process):
bash /home/z/backups/RESTORE-FULLY.sh --code-only
```

The script stops the server, wipes the project folder, extracts the exact
snapshot, restarts the server detached, and health-checks port 3000.

## Integrity (verified at creation)
- Archive lists 70,001 files; test-extraction of db/custom.db matched live MD5
  `62011cb8b4d9479174e18763a7967b8a`
- `git bundle verify fully.bundle` → "records a complete history"
- Archive extraction includes: `db/custom.db`, `src/`, `public/` (45 MB media),
  `prisma/`, `research/`, `node_modules/`, `.next/`, configs, `.git`
