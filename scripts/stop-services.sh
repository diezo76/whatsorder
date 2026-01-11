#!/bin/bash

# Script pour arrêter PostgreSQL et Redis
# Usage: ./scripts/stop-services.sh

set -e

echo "🛑 Arrêt des services..."
echo ""

# Ajouter PostgreSQL au PATH
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"

# Arrêter PostgreSQL
echo "📦 Arrêt de PostgreSQL..."
if pg_isready -h localhost -p 5432 > /dev/null 2>&1; then
    pg_ctl -D /usr/local/var/postgresql@15 stop
    echo "   ✅ PostgreSQL arrêté"
else
    echo "   ℹ️  PostgreSQL n'est pas démarré"
fi

# Arrêter Redis
echo "📦 Arrêt de Redis..."
if redis-cli ping > /dev/null 2>&1; then
    redis-cli shutdown
    echo "   ✅ Redis arrêté"
else
    echo "   ℹ️  Redis n'est pas démarré"
fi

echo ""
echo "✅ Services arrêtés !"
echo ""
