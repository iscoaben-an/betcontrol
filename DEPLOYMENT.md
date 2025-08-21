# Guía de Despliegue - BetControl

Esta guía te ayudará a desplegar BetControl en diferentes plataformas.

## 🚀 Opción 1: Render (Recomendada - Gratuita)

### Pasos:

1. **Crear cuenta en Render**
   - Ve a [render.com](https://render.com)
   - Regístrate con tu cuenta de GitHub

2. **Conectar el repositorio**
   - Haz clic en "New +"
   - Selecciona "Blueprint"
   - Conecta tu repositorio de GitHub: `https://github.com/iscoaben-an/casero.git`

3. **Configurar el despliegue**
   - Render detectará automáticamente el archivo `render.yaml`
   - Creará automáticamente:
     - Base de datos PostgreSQL
     - Servicio web para la API
     - Servicio estático para el cliente

4. **Variables de entorno**
   - Render configurará automáticamente las variables necesarias
   - `JWT_SECRET` se generará automáticamente
   - `POSTGRES_URI` se conectará a la base de datos

5. **Desplegar**
   - Haz clic en "Create Blueprint Instance"
   - Espera a que se complete el despliegue (5-10 minutos)

### URLs resultantes:
- **Frontend**: `https://betcontrol-client.onrender.com`
- **API**: `https://betcontrol-api.onrender.com`

---

## 🌐 Opción 2: Railway (Alternativa - Gratuita)

### Pasos:

1. **Crear cuenta en Railway**
   - Ve a [railway.app](https://railway.app)
   - Regístrate con GitHub

2. **Crear proyecto**
   - "New Project" → "Deploy from GitHub repo"
   - Selecciona tu repositorio

3. **Configurar servicios**
   - **Base de datos**: Add → Database → PostgreSQL
   - **API**: Add → Service → GitHub Repo → selecciona tu repo

4. **Variables de entorno para la API**:
   ```
   NODE_ENV=production
   PORT=3000
   JWT_SECRET=tu_secreto_super_seguro
   POSTGRES_URI=${{Postgres.DATABASE_URL}}
   ```

5. **Desplegar frontend**
   - Add → Service → Static Site
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/build`

---

## ☁️ Opción 3: Heroku (Pago - Más robusto)

### Pasos:

1. **Instalar Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Crear aplicación**
   ```bash
   heroku create betcontrol-app
   ```

3. **Agregar base de datos**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

4. **Configurar variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=tu_secreto_super_seguro
   ```

5. **Desplegar**
   ```bash
   git push heroku main
   ```

---

## 🔧 Configuración Manual

### Variables de entorno necesarias:

```env
# Producción
NODE_ENV=production
PORT=3000
JWT_SECRET=tu_secreto_super_seguro_aqui
POSTGRES_URI=postgres://usuario:contraseña@host:puerto/database

# Cliente (React)
REACT_APP_API_URL=https://tu-api-url.com
```

### Scripts de construcción:

```bash
# Instalar dependencias
npm run install-all

# Construir cliente
npm run build

# Iniciar servidor
npm start
```

---

## 📊 Monitoreo y Logs

### Render:
- Dashboard → Tu servicio → Logs
- Métricas automáticas incluidas

### Railway:
- Project → Service → Deployments → View Logs

### Heroku:
```bash
heroku logs --tail
```

---

## 🔒 Seguridad en Producción

1. **JWT Secret**: Usa un secreto fuerte y único
2. **CORS**: Configurado para permitir solo tu dominio
3. **Helmet**: Headers de seguridad automáticos
4. **Rate Limiting**: Considera agregar rate limiting
5. **HTTPS**: Automático en todas las plataformas

---

## 🐛 Troubleshooting

### Error común: "Cannot connect to database"
- Verifica que `POSTGRES_URI` esté configurada correctamente
- Asegúrate de que la base de datos esté activa

### Error común: "CORS error"
- Verifica que `CLIENT_URL` apunte al frontend correcto
- En desarrollo, usa `http://localhost:3000`

### Error común: "JWT malformed"
- Verifica que `JWT_SECRET` esté configurada
- No uses el secreto de desarrollo en producción

---

## 📞 Soporte

Si tienes problemas con el despliegue:
1. Revisa los logs de la plataforma
2. Verifica las variables de entorno
3. Asegúrate de que el repositorio esté actualizado

¡Tu aplicación estará en vivo en minutos! 🎉
