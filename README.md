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
cp .env.example .env   # y ajustar MONGO_URI si hace falta
npm run dev            # o: npm start
npm test               # pruebas del motor (no necesitan MongoDB)
```

## API

| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/api/perfiles` | Crear perfil de atleta |
| GET | `/api/perfiles` · `/api/perfiles/:id` | Listar / obtener perfil |
| PATCH · DELETE | `/api/perfiles/:id` | Actualizar / eliminar (borra también sus datos) |
| POST | `/api/objetivos` | Crear objetivo (`atletaId` obligatorio) |
| GET | `/api/objetivos?atletaId=` | Listar objetivos, opcionalmente de un atleta |
| PATCH · DELETE | `/api/objetivos/:id` | Actualizar / eliminar objetivo |
| POST | `/api/registros-diarios` | Registrar cómo se siente el atleta (actualiza la fatiga del perfil) |
| GET | `/api/registros-diarios/atleta/:atletaId` | Registros del atleta |
| PATCH · DELETE | `/api/registros-diarios/:id` | Actualizar / eliminar registro |
| GET | `/api/semanas/atleta/:id` | Generar la semana actual y guardarla en el historial |
| GET | `/api/historial/:atletaId` | Historial de semanas |

Generar la semana varias veces dentro de la misma semana (lunes a domingo)
actualiza el mismo registro del historial en lugar de duplicarlo.

## Cómo decide el motor

1. **Fase** según las semanas hasta el objetivo: Base (>16), Construcción (>8),
   Especialización (>3), Puesta a punto.
2. **Sesiones clave** (Fondo Largo, VO2, Umbral) con duraciones según la disciplina
   (MTB Marathon, XCO, Ruta, Gravel, Indoor, Mixto). VO2 y Umbral nunca en días
   consecutivos; el fondo va en el día de mayor disponibilidad.
3. **Volumen extra según fatiga** (0-10, calculada del último registro diario):
   baja → rellena con Z2 y extiende sesiones; moderada → Z2 de máximo 60 min;
   alta → solo sesiones esenciales.
4. **Adaptación** con el último registro: *Reducir carga* quita complementos Z2 y
   recorta 25% lo aeróbico; *Descanso recomendado* elimina VO2/Umbral y recorta 40%.
5. **Cumplimiento** de la semana actual y **perfil dinámico** de las últimas 4 semanas.
