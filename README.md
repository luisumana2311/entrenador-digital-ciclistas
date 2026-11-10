# Entrenador Digital para Ciclistas

Backend (Node + Express + MongoDB) que genera la semana de entrenamiento de un
ciclista según su disponibilidad, su objetivo principal y cómo se siente cada día.
Las reglas del motor están documentadas en [`docs/`](docs/).

## Requisitos

- Node.js 20 o superior
- MongoDB (local o Atlas)

## Puesta en marcha

```bash
npm install
cp .env.example .env   # ajustar MONGO_URI y poner un JWT_SECRET propio
npm run dev            # o: npm start
npm test               # pruebas del motor (no necesitan MongoDB)
```

Para correr también las pruebas de la API hace falta un MongoDB de pruebas
(la base indicada se borra al terminar):

```bash
MONGO_URI_TEST=mongodb://127.0.0.1:27017/entrenador-test npm test
```

GitHub Actions corre todas las pruebas (Node 20 y 22, con MongoDB) en cada PR
y en cada push a `main`.

## Frontend

La app web está en [`frontend/`](frontend/) (React + Vite). Con el backend
corriendo en el puerto 4000:

```bash
cd frontend
npm install
npm run dev            # http://localhost:5173
```

En desarrollo, Vite redirige `/api` al backend, así que no hace falta
configurar CORS. Para publicarla, `npm run build` genera `frontend/dist/`; si
la API vive en otro dominio, define `VITE_API_URL` (por ejemplo
`https://api.midominio.com/api`) antes del build y agrega ese dominio del
frontend a `CORS_ORIGIN` en el backend.

Pantallas: acceso (login y registro), **Mi semana** (plan, mensaje del
entrenador e indicadores), **Hoy** (registro diario), **Objetivos**,
**Historial** y **Perfil** (datos, disponibilidad y borrar cuenta).

## Autenticación

1. `POST /api/auth/registro` con `{ email, password, nombre, ...datos del perfil }`
   crea la cuenta y su perfil de atleta, y devuelve un `token`.
2. `POST /api/auth/login` con `{ email, password }` devuelve un `token` nuevo.
3. El resto de la API exige el encabezado `Authorization: Bearer <token>`.

Cada usuario solo ve y modifica sus propios datos: el `atletaId` se toma del
token, nunca del body. Pedir datos de otro atleta devuelve 403 (o 404 para
objetivos y registros ajenos). Los intentos de registro y login están limitados
a 20 cada 15 minutos por IP.

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/auth/registro` | Crear cuenta y perfil |
| POST | `/api/auth/login` | Iniciar sesión |
| GET | `/api/auth/yo` | Usuario y perfil actuales |
| GET · PATCH · DELETE | `/api/perfiles/yo` | Mi perfil (DELETE borra la cuenta y todos sus datos) |
| GET · PATCH · DELETE | `/api/perfiles/:id` | Igual, solo con el id propio |
| POST · GET | `/api/objetivos` | Crear / listar mis objetivos |
| PATCH · DELETE | `/api/objetivos/:id` | Actualizar / eliminar un objetivo propio |
| POST · GET | `/api/registros-diarios` | Registrar cómo me siento (actualiza la fatiga) / listar |
| PATCH · DELETE | `/api/registros-diarios/:id` | Actualizar / eliminar un registro propio |
| GET | `/api/semanas/actual` | Generar mi semana y guardarla en el historial |
| GET | `/api/historial` | Mi historial de semanas |

Las rutas anteriores con id (`/api/semanas/atleta/:id`,
`/api/historial/:atletaId`, `/api/registros-diarios/atleta/:atletaId`) siguen
funcionando con el id propio.

Generar la semana varias veces dentro de la misma semana (lunes a domingo)
actualiza el mismo registro del historial en lugar de duplicarlo.

## Cómo decide el motor

1. **Fase** según las semanas hasta el objetivo: Base (>16), Construcción (>8),
   Especialización (>3), Puesta a punto.
2. **Sesiones clave** (Fondo Largo, VO2, Umbral) con duraciones según la disciplina
   (MTB Marathon, XCO, Ruta, Gravel, Indoor, Mixto). VO2 y Umbral nunca en días
   consecutivos ni pegados al fondo, que va en el día de mayor disponibilidad.
   La recuperación no se alarga para llenar tiempo libre.
3. **Volumen extra según fatiga** (0-10, calculada del último registro diario):
   baja → rellena con Z2 y extiende sesiones; moderada → Z2 de máximo 60 min;
   alta → solo sesiones esenciales.
4. **Adaptación** con el último registro: *Reducir carga* quita complementos Z2 y
   recorta 25% lo aeróbico; *Descanso recomendado* elimina VO2/Umbral y recorta 40%.
   Solo cambia los días que faltan: lo ya pasado (y hoy, si ya entrenaste) se respeta.
5. **Cumplimiento** de las sesiones que ya tocaban esta semana y **perfil
   dinámico** de las últimas 4 semanas.
