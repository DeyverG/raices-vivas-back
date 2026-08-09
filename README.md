# ⚙️ Raíces Vivas - Backend API REST

Documentación técnica del servicio backend para el proyecto Raíces Vivas.

## 🚀 Inicio Rápido

1. Copiar plantilla `.env`:
   ```bash
   cp .env.example .env
   ```

2. Poblar la base de datos PostgreSQL:

   **Opción A: Desde Terminal (`psql`)**
   - Si estás dentro de `back/db/`:
     ```bash
     psql -U postgres -d raices_vivas_db -h localhost -f schema.sql
     psql -U postgres -d raices_vivas_db -h localhost -f seeds.sql
     ```
   - Si estás dentro de `back/`:
     ```bash
     psql -U postgres -d raices_vivas_db -h localhost -f db/schema.sql
     psql -U postgres -d raices_vivas_db -h localhost -f db/seeds.sql
     ```

   **Opción B: Desde DBeaver u otro gestor visual**
   1. Crea la base de datos `raices_vivas_db`.
   2. Abre y ejecuta `db/schema.sql` en el Editor SQL (`Alt + X` o `F5`).
   3. Abre y ejecuta `db/seeds.sql` en el Editor SQL (`Alt + X` o `F5`).

3. Iniciar el servidor:
   ```bash
   npm start
   ```

4. Documentación Swagger:
   Navega a `http://localhost:5000/api-docs`

5. Pruebas Unitarias:
   ```bash
   npm test
   ```
