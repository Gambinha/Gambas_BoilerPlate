#!/bin/bash
set -e

echo '==> [1/6] Installing server dependencies...'
cd /workspace/server
npm install

echo '==> [2/6] Running Prisma migrations...'
npx prisma migrate deploy

echo '==> [3/6] Running Prisma Generate...'
npx prisma db push && npx prisma generate

echo '==> [4/6] Building server (required for seed)...'
npm run build

echo '==> [5/6] Running database seeds...'
npm run db:seed

echo '==> [6/6] Installing web dependencies...'
cd /workspace/web
npm install

echo ''
echo '✓ Setup complete!'
echo '  Server : cd server && npm run start:dev'
echo '  Web    : cd web && npm run dev'
