Un atleta puede tener varios objetivos.

Solo uno puede ser principal.

Los objetivos tienen prioridad:
A > B > C

El objetivo principal gobierna el plan.

# Regla 015 – Objetivo Principal Activo

## Objetivo

Determinar automáticamente cuál objetivo debe gobernar la planificación semanal del atleta cuando existen múltiples objetivos registrados.

---

## Descripción

Un atleta puede tener varios objetivos simultáneos dentro del sistema.

Ejemplos:

- MTB Marathon
- XCM Nacional
- Fondo de Ruta
- Gran Fondo
- Competencia de Gravel

Sin embargo, el motor de planificación solamente puede construir una semana alrededor de un único objetivo principal.

Por esta razón, antes de generar cualquier sesión, el sistema debe identificar cuál es el objetivo activo.

---

## Criterios de Selección

### 1. Estado

Solamente participan objetivos con estado:

- Activo

Se excluyen automáticamente:

- Completado
- Cancelado
- Archivado

---

### 2. Prioridad

Las prioridades se ordenan de la siguiente manera:

1. Alta
2. Media
3. Baja

Un objetivo de prioridad Alta siempre prevalece sobre uno de prioridad Media o Baja.

---

### 3. Fecha Objetivo

Si dos objetivos tienen la misma prioridad, el sistema seleccionará el que tenga la fecha más próxima.

---

## Ejemplo

Objetivos registrados:

### Objetivo A

- Nombre: MTB Marathon Jacó
- Prioridad: Alta
- Fecha: 15 octubre 2026

### Objetivo B

- Nombre: Gran Fondo Ruta
- Prioridad: Media
- Fecha: 20 agosto 2026

Resultado:

Objetivo Principal Activo:

- MTB Marathon Jacó

Motivo:

- Tiene mayor prioridad.

---

## Segundo Ejemplo

### Objetivo A

- Prioridad: Alta
- Fecha: 15 octubre 2026

### Objetivo B

- Prioridad: Alta
- Fecha: 20 agosto 2026

Resultado:

Objetivo Principal Activo:

- Objetivo B

Motivo:

- Misma prioridad.
- Fecha más cercana.

---

## Resultado Esperado

El motor debe devolver un único objetivo principal que será utilizado por el generador de semanas.

Todas las decisiones posteriores de:

- volumen
- intensidad
- distribución de sesiones
- periodización

deberán construirse alrededor de dicho objetivo.

---

## Relación con otras reglas

Esta regla actúa antes de:

- Regla 001 – Prioridad fisiológica sobre disponibilidad.
- Regla 003 – Sesiones clave.
- Regla 005 – Fondo Largo.
- Regla 013 – Completar volumen con Z2.

Es la puerta de entrada del proceso de planificación.
