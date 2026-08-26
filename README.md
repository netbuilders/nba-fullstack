# Base Monorepo Node.js + Express + Vite (Despliegue en Hostinger)

Estructura de proyecto monorepo lista para producción, optimizada para desplegarse fácilmente en **Hostinger** mediante integración continua con Git o Node.js Web Application Manager.

---

## 📁 Estructura del Proyecto

```
nba-fullstack/
├── .env.example          # Plantilla de variables de entorno (SMTP, Puerto)
├── .gitignore            # Exclusiones de Git (node_modules, dist, .env)
├── package.json          # Raíz: scripts de construcción y dependencias del backend
├── README.md             # Guía de uso y despliegue
├── server.js             # Servidor Express (ESM), API /api/contacto y static fallback
└── client/               # Aplicación Frontend con Vite
    ├── package.json      # Dependencias del cliente
    ├── vite.config.js    # Configuración de Vite y proxy local
    ├── index.html        # HTML principal con Honeypot antispam
    └── src/
        ├── main.js       # Lógica de envío fetch y manejo de estados UI
        └── style.css     # Estilos CSS modernos (Glassmorphism & Responsivo)
```

---

## 🛠️ Requisitos Previos

- **Node.js**: v18.0.0 o superior (ESM nativo).
- **npm**: v9.0.0 o superior.

---

## 🚀 Instalación y Desarrollo Local

1. **Clonar el repositorio y preparar entorno:**
   ```bash
   cp .env.example .env
   ```
   *Edita `.env` con tus credenciales SMTP reales para probar el envío de correos.*

2. **Instalar dependencias del proyecto raíz y del cliente:**
   ```bash
   npm install
   npm --prefix client install
   ```

3. **Compilar el frontend de Vite:**
   ```bash
   npm run build
   ```
   *Esto ejecutará `npm --prefix client install && npm --prefix client run build` generando los archivos de producción en `client/dist`.*

4. **Iniciar el servidor backend:**
   ```bash
   npm start
   ```
   *Abre en tu navegador `http://localhost:3000` para probar el formulario de contacto y las rutas estáticas.*

---

## 🌐 Configuración y Despliegue en Hostinger

Hostinger permite desplegar aplicaciones Node.js mediante el **Node.js Application Manager** o despliegue automático por **Git**.

### Pasos en hPanel de Hostinger:

1. **Crear o conectar el repositorio Git:**
   - En hPanel, ve a **Git** y vincula tu repositorio (GitHub, GitLab, etc.).
   - Configura la rama principal (ej. `main` o `master`).

2. **Configurar la Aplicación Node.js:**
   - Ve a **Sitios web > Administrar > Aplicación Node.js**.
   - **Versión de Node.js**: Selecciona Node.js 18.x o 20.x.
   - **Modo de aplicación**: Producción (`production`).
   - **Raíz de la aplicación**: `/` (Raíz del proyecto).
   - **Archivo de inicio**: `server.js`.
   - **Comando de construcción (Build Command)**:
     ```bash
     npm run build
     ```
   - **Comando de inicio (Start Command)**:
     ```bash
     npm start
     ```

3. **Configurar Variables de Entorno en Hostinger:**
   En la sección de Variables de Entorno de hPanel, agrega:
   - `PORT`: (Asignado automáticamente por Hostinger o 3000).
   - `SMTP_HOST`: `smtp.hostinger.com` (o tu proveedor SMTP).
   - `SMTP_PORT`: `465`
   - `SMTP_SECURE`: `true`
   - `SMTP_USER`: `tu_correo@tudominio.com`
   - `SMTP_PASS`: `tu_contraseña_smtp`
   - `CONTACT_EMAIL`: `destino@tudominio.com`

4. **Desplegar:**
   Haz clic en **Desplegar / Implementar**. Hostinger instalará las dependencias, ejecutará `npm run build` compilando Vite en `client/dist`, e iniciará `server.js`.

---

## 🔒 Características de Seguridad Incluidas

- **Rate Limiting (`express-rate-limit`)**: Máximo 5 peticiones cada 15 minutos por dirección IP en el endpoint `POST /api/contacto`.
- **Trust Proxy (`app.set('trust proxy', 1)`)**: Permite obtener la IP real del visitante detrás del proxy de Nginx de Hostinger.
- **Campo Trampa Antispam (Honeypot)**: El formulario contiene el campo oculto `website_url`. Si un bot rellena este campo, el servidor responde con HTTP 200 ficticio sin procesar el envío por SMTP.
- **SPA Fallback**: Expresión `app.get('*')` para manejar rutas dinámicas en el frontend sin errores 404.
