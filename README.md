<p align="center">
  <img src="frontend/public/favicon.svg" width="80" height="80" alt="Euromania logo">
</p>

<h1 align="center">🍔 Euromania — Pedidos Colaborativos</h1>

<p align="center">
  <strong>Aplicación web para hacer pedidos en grupo en tiempo real.</strong><br>
  Crea una sesión, comparte el código QR con tus amigos y haced el pedido juntos.<br>
  Sin registros, sin complicaciones.
</p>

<p align="center">
  <a href="https://euromania.cabrasky.net/">🌐 Web</a>
  ·
  <a href="https://github.com/cabrasky/euromania-pedidos/issues">🐛 Reportar un bug</a>
  ·
  <a href="https://github.com/cabrasky/euromania-pedidos/issues/new?template=feature_request.md">✨ Sugerir mejora</a>
</p>

<p align="center">
  <img src="https://img.shields.io/github/license/cabrasky/euromania-pedidos" alt="License">
  <img src="https://img.shields.io/github/last-commit/cabrasky/euromania-pedidos" alt="Last commit">
  <img src="https://img.shields.io/github/issues/cabrasky/euromania-pedidos" alt="Issues">
  <img src="https://img.shields.io/badge/React-18-blue?logo=react" alt="React">
  <img src="https://img.shields.io/badge/FastAPI-Python-success?logo=fastapi" alt="FastAPI">
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" alt="PostgreSQL">
</p>

---

## ✨ Características

| Característica | Descripción |
|---|---|
| **Pedidos en grupo** | Cada persona añade sus montaditos en su propio perfil. Todo en una misma sesión. |
| **Tiempo real** | Los cambios se ven al instante gracias a WebSockets. Nada de recargar la página. |
| **Código QR** | Comparte la sesión al instante. Escanea y únete sin escribir códigos largos. |
| **Resumen consolidado** | Agrupa todos los pedidos por producto para hacer el pedido al restaurante de un vistazo. |
| **Sin registro** | Solo necesitas un nombre. No pedimos email, teléfono ni contraseñas. |
| **Menú oficial Marzo 2026** | 10 categorías de montaditos + bebidas + extras con precios actualizados. |
| **Estadísticas anónimas** | Panel admin con métricas de uso totalmente anonimizadas. |
| **SSR (Server-Side Rendering)** | SEO optimizado con renderizado en servidor Node.js. |

## 🚀 Stack técnico

| Capa | Tecnología |
|---|---|
| **Frontend** | React 18 + TypeScript + Vite 6 |
| **Backend** | FastAPI (Python 3.11) + asyncpg |
| **SSR** | Node.js Express con React 18 server-side |
| **Base de datos** | PostgreSQL 16 con pgvector |
| **Tiempo real** | WebSockets (FastAPI nativo) |
| **Proxy** | nginx + Let's Encrypt SSL |
| **Host** | Servidor Linux, systemd |

## 📦 Estructura del proyecto

```
euromania-pedidos/
├── frontend/                  # React + Vite
│   ├── src/
│   │   ├── components/        # Componentes React
│   │   │   ├── LandingPage.tsx
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── Header.tsx
│   │   │   ├── PersonBar.tsx
│   │   │   ├── MenuGrid.tsx
│   │   │   ├── OrderPanel.tsx
│   │   │   ├── AdminPanel.tsx
│   │   │   ├── QRModal.tsx
│   │   │   ├── PrivacyModal.tsx
│   │   │   └── ToastContainer.tsx
│   │   ├── types.ts           # Tipos y menú
│   │   ├── api.ts             # API client
│   │   ├── websocket.ts       # WebSocket client
│   │   ├── App.tsx            # Router
│   │   ├── OrderApp.tsx       # App principal
│   │   ├── entry-client.tsx   # Client entry
│   │   └── entry-server.tsx   # SSR entry
│   ├── public/                # Static assets
│   ├── ssr-server.mjs         # SSR server (Node.js)
│   ├── vite.config.ts
│   └── package.json
├── server.py                  # FastAPI backend
├── robots.txt
├── sitemap.xml
├── banned_ips.json
└── README.md
```

## 🛠️ Desarrollo local

### Requisitos

- Python 3.11+
- Node.js 18+
- PostgreSQL 16+
- Redis (opcional, para rate limiting avanzado)

### Backend

```bash
# Clonar el repositorio
git clone https://github.com/cabrasky/euromania-pedidos.git
cd euromania-pedidos

# Crear entorno virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependencias
pip install -r requirements.txt

# Configurar base de datos
createdb euromania
psql euromania < schema.sql

# Configurar variables de entorno
export EUROMANIA_DB="postgresql://tu_usuario@localhost:5432/euromania"
export EUROMANIA_ADMIN_PASSWORD="tu_contraseña_admin"

# Iniciar servidor
python server.py
```

### Frontend

```bash
cd frontend
npm install
npm run dev        # Desarrollo (hot reload)
npm run build      # Producción
```

### SSR (opcional, para SEO)

```bash
cd frontend
npm run build                    # Primero construir el bundle
node ssr-server.mjs              # Iniciar SSR server (puerto 8120)
```

## 🌐 API

### Sesiones

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/session` | Crear nueva sesión |
| `POST` | `/api/session/{code}/join` | Obtener datos de sesión |
| `POST` | `/api/session/{code}/person` | Añadir persona |
| `DELETE` | `/api/session/{code}/person/{name}` | Eliminar persona |
| `PUT` | `/api/session/{code}/person/{name}/item` | Añadir/actualizar artículo |
| `DELETE` | `/api/session/{code}/person/{name}/item/{key}` | Eliminar artículo |
| `DELETE` | `/api/session/{code}/person/{name}/clear` | Vaciar pedido de persona |
| `GET` | `/api/sessions` | Listar sesiones activas (admin) |

### WebSocket

| Ruta | Descripción |
|---|---|
| `ws://host/ws/{code}` | Conectarse a una sesión. Recibe eventos en tiempo real. |

### Admin (requiere token Bearer)

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/api/admin/login` | Autenticarse (recibe token) |
| `GET` | `/api/admin/stats` | Estadísticas anonimizadas |
| `GET` | `/api/admin/bans` | Listar IPs bloqueadas |
| `POST` | `/api/admin/bans` | Bloquear IP |
| `DELETE` | `/api/admin/bans/{ip}` | Desbloquear IP |

## 🔒 Seguridad

- Rate limiting por IP (120 req/min)
- Auto-ban por violaciones de rate limit
- Límites de WebSocket por IP/sesión/global
- Validación y sanitización de entrada
- Cabeceras de seguridad (HSTS, CSP, XSS Protection)
- Contraseña admin configurable vía variable de entorno
- Protección contra path traversal

## 🤝 Contribuir

¡Las contribuciones son bienvenidas!

1. Abre un [issue](https://github.com/cabrasky/euromania-pedidos/issues) para discutir cambios grandes
2. Haz fork del repo
3. Crea una rama: `git checkout -b feature/mi-mejora`
4. Haz commit: `git commit -m 'Añade mi mejora'`
5. Push: `git push origin feature/mi-mejora`
6. Abre un Pull Request

## 📄 Licencia

Este proyecto es **código abierto** bajo la licencia MIT.

## ⚠️ Aviso

Esta aplicación es un **proyecto independiente y no oficial**. No está vinculada, patrocinada ni aprobada por **100 Montaditos®** ni por **Euromania®**. Todos los nombres de productos y marcas registradas pertenecen a sus respectivos propietarios.

---

<p align="center">
  <a href="https://euromania.cabrasky.net/">🌐 Probar la app</a>
  ·
  <a href="https://github.com/cabrasky/euromania-pedidos/issues">💬 Dejar feedback</a>
  ·
  <a href="https://github.com/cabrasky">👤 Desarrollado por cabrasky</a>
</p>
