# BetControl

BetControl es una aplicación web para gestionar y analizar apuestas deportivas. Permite a los usuarios realizar un seguimiento de sus apuestas, analizar su rendimiento y recibir sugerencias basadas en IA.

## Características

- 📊 **Dashboard Interactivo**: Visualización en tiempo real de estadísticas y rendimiento
- 💰 **Gestión de Saldo**: Control de fondos disponibles y movimientos
- 📈 **Estadísticas Detalladas**: Análisis por deporte, categoría y más
- 🤖 **Sugerencias de IA**: Recomendaciones inteligentes para apuestas
- 📱 **Diseño Responsivo**: Interfaz moderna y adaptable a todos los dispositivos

## Tecnologías

### Frontend
- React
- Axios
- Recharts
- React Router
- Lucide React
- React Hot Toast

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcryptjs

## Requisitos

- Node.js (v16 o superior)
- PostgreSQL (v12 o superior)
- npm o yarn

## Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/[tu-usuario]/betcontrol.git
   cd betcontrol
   ```

2. **Instalar dependencias del servidor**
   ```bash
   npm install
   ```

3. **Instalar dependencias del cliente**
   ```bash
   cd client
   npm install
   ```

4. **Configurar variables de entorno**
   - Crear archivo `.env` en la raíz del proyecto
   ```env
   PORT=5000
   JWT_SECRET=tu_secreto_jwt
   POSTGRES_URI=postgres://usuario:contraseña@localhost:5432/betcontrol
   ```

5. **Inicializar la base de datos**
   ```bash
   psql -U tu_usuario -d postgres
   CREATE DATABASE betcontrol;
   \c betcontrol
   \i server/config/init-db.sql
   ```

## Uso

1. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```
   Esto iniciará tanto el servidor backend (puerto 5000) como el frontend (puerto 3000).

2. **Acceder a la aplicación**
   - Frontend: http://localhost:3000
   - API: http://localhost:5000

## Tests

```bash
# Ejecutar todos los tests
npm test

# Ejecutar tests del servidor
npm run test:server

# Ejecutar tests del cliente
npm run test:client
```

## Estructura del Proyecto

```
betcontrol/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes React
│   │   ├── contexts/      # Contextos (Auth, etc.)
│   │   ├── styles/        # Estilos CSS
│   │   └── utils/         # Utilidades
│   └── public/            # Archivos estáticos
├── server/                # Backend Node.js
│   ├── config/           # Configuración
│   ├── middleware/       # Middleware Express
│   ├── routes/          # Rutas API
│   └── utils/           # Utilidades
└── tests/               # Tests
```

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## Contacto

Tu Nombre - [@tu_twitter](https://twitter.com/tu_twitter) - email@example.com

Link del Proyecto: [https://github.com/[tu-usuario]/betcontrol](https://github.com/[tu-usuario]/betcontrol)