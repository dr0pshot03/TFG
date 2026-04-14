#!/bin/sh
set -e

echo "🔄 Aguardando PostgreSQL..."
while ! nc -z postgres 5432; do
  sleep 0.1
done
echo "✅ PostgreSQL está listo"

echo "🚀 Ejecutando migraciones de Prisma..."
npm run prisma:migrate || true

echo "🎯 Iniciando Backend..."
exec npm run dev
