# 🌿 Raíces Vivas - Backend API REST

API REST backend para la plataforma de turismo comunitario **Raíces Vivas** (Caquetá y Putumayo). Construida con **Node.js**, **Express**, **PostgreSQL**, **Supabase** y desplegada en **Vercel Serverless**.

---

## 🛠️ Tecnologías y Arquitectura

* **Entorno de Ejecución:** Node.js (Express 5.x)
* **Base de Datos:** PostgreSQL (Soporte local y Supabase en la nube)
* **Despliegue Serverless:** Vercel Functions (`vercel.json`)
* **Documentación:** Swagger UI (OpenAPI 3.0) en `/api-docs`
* **Pruebas:** Jest & Supertest (Cobertura > 95%)

---

## ⚙️ Configuración del Entorno (`.env`)

Copia la plantilla de variables de entorno:

```bash
cp .env.example .env
```

### Variables admitidas:

| Variable | Descripción | Entorno |
| :--- | :--- | :--- |
| `PORT` | Puerto para el servidor local (Defecto: `5000`) | Local |
| `NODE_ENV` | Entorno de ejecución (`development`, `production`, `test`) | Todos |
| `JWT_SECRET` | Clave secreta para firmar tokens JWT | Todos |
| `PGHOST` / `POSTGRES_HOST` | Host del servidor PostgreSQL | Local / Vercel |
| `PGUSER` / `POSTGRES_USER` | Usuario de la base de datos | Local / Vercel |
| `PGPASSWORD` / `POSTGRES_PASSWORD` | Contraseña de la base de datos | Local / Vercel |
| `PGDATABASE` / `POSTGRES_DATABASE` | Nombre de la base de datos | Local / Vercel |
| `POSTGRES_URL` | URL de conexión del Pooler de Supabase (Puerto `6543`) | Vercel |
| `POSTGRES_URL_NON_POOLING` | URL directa de Supabase (Puerto `5432` / DBeaver) | DBeaver |

---

## 🚀 Inicio Rápido Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Configurar la Base de Datos PostgreSQL local:**
   * **Opción A (Terminal `psql`):**
     ```bash
     psql -U postgres -d raices_vivas_db -f db/schema.sql
     psql -U postgres -d raices_vivas_db -f db/seeds.sql
     ```
   * **Opción B (DBeaver u otro cliente gráfico):**
     1. Crea la base de datos `raices_vivas_db`.
     2. Ejecuta el script [`db/schema.sql`](file:///home/deiverg/Utb/raices-vivas-back/db/schema.sql).
     3. Ejecuta el script de datos iniciales [`db/seeds.sql`](file:///home/deiverg/Utb/raices-vivas-back/db/seeds.sql).

3. **Iniciar el Servidor:**
   ```bash
   npm start
   ```
   * Servidor corriendo en: `http://localhost:5000`
   * Documentación Swagger: `http://localhost:5000/api-docs`
   * Chequeo de Salud: `http://localhost:5000/health`

---

## 🐘 Conexión desde DBeaver a Supabase

Para conectarte a la base de datos de producción en Supabase utilizando DBeaver:

1. Crea una nueva conexión de tipo **PostgreSQL** en DBeaver.
2. Selecciona la opción **URL** y pega la variable `POSTGRES_URL_NON_POOLING`:
   `postgres://postgres.PROJECT_REF:PASSWORD@aws-0-us-east-1.pooler.supabase.com:5432/postgres`
3. En la pestaña **SSL**, activa la casilla **Use SSL** y selecciona modo **`require`**.
4. Haz clic en **Test Connection**.

> **Nota sobre el usuario en DBeaver:** Si ingresas los datos manualmente, el usuario para el pooler debe incluir la referencia de tu proyecto (ej: `postgres.bnorntgkpxuwsvulkpub`).

---

## 📌 Endpoints Principales de la API

| Método | Ruta | Descripción | Acceso |
| :--- | :--- | :--- | :--- |
| `GET` | `/` | Información del estado de la API y enlaces | Público |
| `GET` | `/health` | Chequeo de salud del servicio | Público |
| `GET` | `/api-docs` | Interfaz interactiva Swagger OpenAPI | Público |
| `GET` | `/api/v1/experiences` | Catálogo de experiencias comunitarias | Público |
| `POST` | `/api/v1/experiences` | Publicar nueva propuesta de experiencia | Autenticado |
| `PATCH` | `/api/v1/experiences/:id/status` | Aprobar o rechazar experiencia | Coordinador |
| `POST` | `/api/v1/auth/register` | Registro de usuarios (Ley 1581/2012) | Público |
| `POST` | `/api/v1/auth/login` | Iniciar sesión y obtener Token JWT | Público |
| `GET` | `/api/v1/reservations` | Lista de solicitudes de reserva | Autenticado |
| `GET` | `/api/v1/audit-log` | Bitácora inmutable de trazabilidad (RNF-010) | Coordinador |

---

## 🧪 Pruebas Unitarias e Integración

Para ejecutar la suite completa de pruebas automáticas con Jest:

```bash
npm test
```

---

## ☁️ Despliegue en Vercel

El proyecto cuenta con un archivo [`vercel.json`](file:///home/deiverg/Utb/raices-vivas-back/vercel.json) configurado para desplegar la API en Vercel Serverless Functions. Al vincular el repositorio con Vercel e instalar la integración de Supabase, las variables de entorno se inyectan automáticamente.
