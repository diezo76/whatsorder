#!/bin/bash

# Script de build pour production

echo "🔨 Building API for production..."

cd "$(dirname "$0")"

# Installer les dépendances
echo "📦 Installing dependencies..."
pnpm install --frozen-lockfile

# Générer Prisma Client
echo "🗄️ Generating Prisma Client..."
pnpm prisma generate

# Build TypeScript
echo "⚙️ Building TypeScript..."
pnpm build

echo "✅ Build completed!"
