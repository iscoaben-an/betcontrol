#!/bin/bash

echo "🚀 Iniciando instalación de BetControl..."
echo "=========================================="

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js v14 o superior."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm no está instalado. Por favor instala npm."
    exit 1
fi

echo "✅ Node.js y npm encontrados"

# Instalar dependencias del backend
echo "📦 Instalando dependencias del backend..."
npm install

# Instalar dependencias del frontend
echo "📦 Instalando dependencias del frontend..."
cd client
npm install
cd ..

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "🔧 Creando archivo de configuración .env..."
    cp env.example .env
    echo "✅ Archivo .env creado. Por favor edítalo con tus configuraciones de base de datos."
fi

echo ""
echo "🎉 Instalación completada!"
echo ""
echo "📋 Próximos pasos:"
echo "1. Configura tu base de datos PostgreSQL"
echo "2. Edita el archivo .env con tus credenciales"
echo "3. Ejecuta: npm run dev"
echo ""
echo "📖 Para más información, consulta el README.md" 