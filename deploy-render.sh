#!/bin/bash

# Script para desplegar BetControl en Render
# Requiere: curl, jq, y un token de Render

echo "🚀 Configurando despliegue en Render..."

# Verificar si tienes el token de Render
if [ -z "$RENDER_TOKEN" ]; then
    echo "❌ Error: Necesitas configurar RENDER_TOKEN"
    echo "1. Ve a https://dashboard.render.com/account/tokens"
    echo "2. Crea un nuevo token"
    echo "3. Ejecuta: export RENDER_TOKEN=tu_token_aqui"
    exit 1
fi

# Configuración
REPO_URL="https://github.com/iscoaben-an/casero.git"
SERVICE_NAME="betcontrol-api"
DB_NAME="betcontrol-db"
CLIENT_NAME="betcontrol-client"

echo "📦 Creando base de datos PostgreSQL..."

# Crear base de datos PostgreSQL
DB_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $RENDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$DB_NAME\",
    \"database\": \"betcontrol\",
    \"user\": \"betcontrol_user\",
    \"plan\": \"free\"
  }" \
  "https://api.render.com/v1/services")

DB_ID=$(echo $DB_RESPONSE | jq -r '.service.id')
DB_URL=$(echo $DB_RESPONSE | jq -r '.service.serviceDetails.externalDatabaseUrl')

if [ "$DB_ID" = "null" ]; then
    echo "❌ Error al crear la base de datos"
    echo $DB_RESPONSE
    exit 1
fi

echo "✅ Base de datos creada: $DB_ID"

echo "🔧 Creando servicio de API..."

# Crear servicio web para la API
API_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $RENDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$SERVICE_NAME\",
    \"type\": \"web_service\",
    \"repoUrl\": \"$REPO_URL\",
    \"branch\": \"main\",
    \"buildCommand\": \"npm install\",
    \"startCommand\": \"npm start\",
    \"plan\": \"free\",
    \"envVars\": [
      {
        \"key\": \"NODE_ENV\",
        \"value\": \"production\"
      },
      {
        \"key\": \"JWT_SECRET\",
        \"generateValue\": true
      },
      {
        \"key\": \"POSTGRES_URI\",
        \"value\": \"$DB_URL\"
      }
    ]
  }" \
  "https://api.render.com/v1/services")

API_ID=$(echo $API_RESPONSE | jq -r '.service.id')

if [ "$API_ID" = "null" ]; then
    echo "❌ Error al crear el servicio de API"
    echo $API_RESPONSE
    exit 1
fi

echo "✅ Servicio de API creado: $API_ID"

echo "🌐 Creando servicio del cliente..."

# Crear servicio estático para el cliente
CLIENT_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $RENDER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"$CLIENT_NAME\",
    \"type\": \"static_site\",
    \"repoUrl\": \"$REPO_URL\",
    \"branch\": \"main\",
    \"buildCommand\": \"cd client && npm install && npm run build\",
    \"publishPath\": \"client/build\",
    \"plan\": \"free\",
    \"envVars\": [
      {
        \"key\": \"REACT_APP_API_URL\",
        \"value\": \"https://$SERVICE_NAME.onrender.com\"
      }
    ]
  }" \
  "https://api.render.com/v1/services")

CLIENT_ID=$(echo $CLIENT_RESPONSE | jq -r '.service.id')

if [ "$CLIENT_ID" = "null" ]; then
    echo "❌ Error al crear el servicio del cliente"
    echo $CLIENT_RESPONSE
    exit 1
fi

echo "✅ Servicio del cliente creado: $CLIENT_ID"

echo ""
echo "🎉 ¡Despliegue configurado exitosamente!"
echo ""
echo "📊 URLs de tu aplicación:"
echo "   API: https://$SERVICE_NAME.onrender.com"
echo "   Cliente: https://$CLIENT_NAME.onrender.com"
echo ""
echo "⏳ Los servicios están construyéndose..."
echo "   Esto puede tomar 5-10 minutos"
echo ""
echo "🔐 Credenciales de acceso:"
echo "   Email: admin@betcontrol.com"
echo "   Contraseña: 123456"
echo ""
echo "📝 Para crear el usuario de prueba, ejecuta en la consola de Render:"
echo "   node server/scripts/init-user.js"
