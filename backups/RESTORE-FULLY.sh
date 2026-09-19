#!/bin/bash
# ============================================================
#  RESTORE-FULLY.sh  —  Recall the site to the "fully" version
#  Created: 2026-09-11  (state: post-rollback, hero 88vh+9px)
#
#  Usage:
#    bash RESTORE-FULLY.sh              # FULL restore (every file:
#                                       #   code, db, photos, videos,
#                                       #   fonts, styles, node_modules,
#                                       #   build) — exact byte copy
#    bash RESTORE-FULLY.sh --code-only  # only source/assets/db via git
# ============================================================
set -e
SRC="$(cd "$(dirname "$0")" && pwd)"   # folder containing this script + archives
PROJ="/home/z/my-project"

# Prefer whichever backup location still exists
TAR="$SRC/fully-full.tar.gz"
[ -f "$TAR" ] || TAR="/home/z/backups/fully-full.tar.gz"
[ -f "$TAR" ] || TAR="/home/z/my-project/backups/fully-full.tar.gz"
BUNDLE="$SRC/fully.bundle"
[ -f "$BUNDLE" ] || BUNDLE="/home/z/backups/fully.bundle"
[ -f "$BUNDLE" ] || BUNDLE="/home/z/my-project/backups/fully.bundle"

if [ "$1" = "--code-only" ]; then
  echo "==> Code-only restore from bundle: $BUNDLE"
  cd "$PROJ"
  git fetch "$BUNDLE" 'refs/heads/*:refs/remotes/fully/*' --tags --force
  git reset --hard fully
  git clean -fd src public prisma db research
  echo "==> Done. If node_modules was changed since, run: bun install"
  echo "==> Restart dev server, or run this script without arguments."
  exit 0
fi

echo "==> FULL restore from: $TAR"
echo "==> Stopping dev server..."
pkill -f next-server 2>/dev/null || true
pkill -f "bun run dev" 2>/dev/null || true
sleep 2

cd /home/z
echo "==> Wiping current project and extracting exact copy..."
rm -rf my-project
tar xzf "$TAR"

echo "==> Starting dev server (detached, survives session end)..."
cd "$PROJ"
python3 - <<'PYEOF'
import os
pid = os.fork()
if pid == 0:
    os.setsid()
    if os.fork() == 0:
        os.close(0)
        f = os.open('/home/z/my-project/dev.log', os.O_WRONLY | os.O_APPEND | os.O_CREAT)
        os.dup2(f, 1); os.dup2(f, 2)
        os.chdir('/home/z/my-project')
        os.execvp('/usr/local/bin/bun', ['bun', 'run', 'dev'])
    os._exit(0)
os.waitpid(pid, 0)
PYEOF

sleep 10
CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo 000)
echo "==> Server status: $CODE"
echo "==> DONE — site recalled to 'fully' version (exact full copy)."
