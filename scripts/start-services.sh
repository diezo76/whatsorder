#!/bin/bash

# Script pour démarrer PostgreSQL et Redis
# Usage: ./scripts/start-services.sh

set -e

echo "🚀 Démarrage des services..."
echo ""

# Ajouter PostgreSQL au PATH
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
export LC_ALL="en_US.UTF-8"

# Démarrer PostgreSQL
echo "📦 Démarrage de PostgreSQL..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL est déjà démarré"
else
    pg_ctl -D /usr/local/var/postgresql@15 start > /dev/null 2>&1
    sleep 2
    echo "   ✅ PostgreSQL démarré"
fi

# Démarrer Redis
echo "📦 Démarrage de Redis..."
if redis-cli ping > /dev/null 2>&1; then
    echo "   ✅ Redis est déjà démarré"
else
    redis-server /usr/local/etc/redis.conf --daemonize yes > /dev/null 2>&1
    sleep 1
    echo "   ✅ Redis démarré"
fi

echo ""
echo "✅ Tous les services sont démarrés !"
echo ""
