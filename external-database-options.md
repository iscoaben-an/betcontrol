# 🗄️ Opciones de Base de Datos Externas Gratuitas

## 1. Neon (Recomendado)
- **URL**: https://neon.tech/
- **Plan gratuito**: 3 proyectos, 0.5GB storage
- **Pasos**:
  1. Regístrate en Neon
  2. Crea un nuevo proyecto
  3. Copia la connection string
  4. Úsala como `POSTGRES_URI` en Render

## 2. Supabase
- **URL**: https://supabase.com/
- **Plan gratuito**: 500MB database, 2GB bandwidth
- **Pasos**:
  1. Regístrate en Supabase
  2. Crea un nuevo proyecto
  3. Ve a Settings > Database
  4. Copia la connection string

## 3. Railway
- **URL**: https://railway.app/
- **Plan gratuito**: $5 credit mensual
- **Pasos**:
  1. Regístrate en Railway
  2. Crea un nuevo proyecto
  3. Agrega un servicio PostgreSQL
  4. Copia la connection string

## 4. ElephantSQL
- **URL**: https://www.elephantsql.com/
- **Plan gratuito**: 20MB database
- **Pasos**:
  1. Regístrate en ElephantSQL
  2. Crea una nueva instancia
  3. Copia la URL de conexión

---

## 🔧 Configuración en Render

Una vez que tengas la URL de conexión:

1. Ve a tu servicio de API en Render
2. Pestaña "Environment"
3. Agrega:
   - `POSTGRES_URI` = [tu URL de conexión]
   - `JWT_SECRET` = mi-secreto-super-seguro-2025
   - `NODE_ENV` = production

4. Guarda y espera que se reinicie
5. Verifica: `curl https://betcontrol-y3y6.onrender.com/api/init/diagnose`
6. Inicializa: `curl -X POST https://betcontrol-y3y6.onrender.com/api/init/init-database`
