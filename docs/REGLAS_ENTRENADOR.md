# REGLAS DEL ENTRENADOR DIGITAL

## REGLA 001 - Prioridad fisiológica

La recuperación entre sesiones clave tiene prioridad sobre la disponibilidad horaria.

Ejemplo:

Incorrecto:

- Miércoles: VO2
- Jueves: Umbral

Correcto:

- Martes: VO2
- Jueves: Umbral

---

## REGLA 002 - El tiempo disponible es una restricción

El tiempo disponible define los límites del plan.

No determina automáticamente qué sesión debe realizarse.

Ejemplo:

Tener 4 horas disponibles un miércoles no implica que deba colocarse la sesión más importante ese día.

---

## REGLA 003 - Sesiones clave

Las sesiones clave son las que generan la mayor adaptación fisiológica.

Lista inicial:

- VO2 Max
- Umbral
- Fondo Largo

Estas sesiones tienen prioridad de protección.

---

## REGLA 004 - Sesiones sacrificables

Las sesiones sacrificables pueden eliminarse cuando exista falta de tiempo, fatiga o conflictos de agenda.

Lista inicial:

- Rodaje suave
- Recuperación
- Core
- Técnica

---

## REGLA 005 - Fondo Largo

El Fondo Largo debe ubicarse preferiblemente en el día de mayor disponibilidad horaria.

Excepciones:

- Competencias
- Viajes
- Restricciones del atleta

---

## REGLA 006 - Objetivo principal

El entrenador siempre planifica en función del objetivo principal activo.

Si existen múltiples objetivos, uno debe estar marcado como objetivo principal.

---

## REGLA 007 - Adaptación continua

El plan semanal no es fijo.

Puede modificarse según:

- Fatiga
- Cumplimiento
- Tiempo disponible
- Enfermedad
- Competencias
- Cambios laborales o personales
  REGLA 008 - Protección del Fondo Largo

No se debe colocar una sesión clave
el día inmediatamente anterior
al Fondo Largo.

Ejemplo:

Incorrecto:

- Sábado: Umbral
- Domingo: Fondo Largo

Correcto:

- Jueves: Umbral
- Domingo: Fondo Largo

# Reglas de Planificación Implementadas y Pendientes

## Regla 009 – No colocar dos sesiones el mismo día

### Objetivo

Garantizar que cada día del calendario contenga como máximo una sesión de entrenamiento.

### Descripción

Antes de asignar una nueva sesión, el motor debe verificar si el día ya posee una sesión programada. En caso afirmativo, deberá buscar otro día disponible.

### Justificación

Un atleta amateur normalmente dispone de una única ventana de entrenamiento por día. Colocar dos sesiones simultáneamente genera conflictos de planificación y reduce la adherencia al plan.

### Ejemplo

Incorrecto:

- Viernes – Umbral
- Viernes – Recuperación

Correcto:

- Viernes – Umbral
- Martes – Recuperación

---

## Regla 010 – Calcular volumen semanal generado

### Objetivo

Determinar la cantidad total de entrenamiento programado por el motor.

### Descripción

El volumen semanal generado se obtiene sumando la duración de todas las sesiones planificadas durante la semana.

### Unidad

Minutos.

### Ejemplo

- Fondo Largo: 270 min
- VO2: 90 min
- Umbral: 90 min
- Recuperación: 60 min

Volumen generado:

510 minutos semanales.

---

## Regla 011 – Calcular volumen semanal disponible

### Objetivo

Determinar el tiempo real que el atleta puede dedicar al entrenamiento durante una semana.

### Descripción

El sistema suma todas las horas de disponibilidad declaradas por el atleta y las convierte a minutos.

### Unidad

Minutos.

### Ejemplo

Disponibilidad:

- Martes: 2.5 h
- Miércoles: 4 h
- Jueves: 2.5 h
- Viernes: 1 h
- Sábado: 2 h
- Domingo: 4.5 h

Total disponible:

16.5 horas = 990 minutos.

---

## Regla 012 – Calcular utilización del tiempo disponible

### Objetivo

Medir qué porcentaje del tiempo disponible está siendo utilizado por la planificación generada.

### Descripción

Se compara el volumen generado por el sistema contra el volumen disponible declarado por el atleta.

### Fórmula

Utilización (%) = (Volumen Generado / Volumen Disponible) × 100

### Ejemplo

- Volumen generado: 510 min
- Volumen disponible: 990 min

Resultado:

51.5% ≈ 52% de utilización.

### Beneficio

Permite identificar si el plan está aprovechando adecuadamente el tiempo disponible del atleta.

---

## Regla 013 – Completar volumen restante con sesiones Z2

### Objetivo

Aprovechar automáticamente el tiempo disponible que no ha sido utilizado por las sesiones clave.

### Descripción

Una vez generadas las sesiones principales (VO2, Umbral y Fondo Largo), el motor analizará el tiempo disponible restante y agregará sesiones de resistencia aeróbica en Zona 2 (Z2) en los días libres.

### Principio

Las sesiones clave tienen prioridad absoluta sobre las sesiones complementarias.

### Clasificación de sesiones

#### Sesiones clave

- VO2
- Umbral
- Fondo Largo

#### Sesiones sacrificables

- Recuperación
- Z2

### Ejemplo

Tiempo disponible:

990 minutos.

Tiempo planificado inicialmente:

510 minutos.

Tiempo restante:

480 minutos.

El motor puede agregar:

- Jueves – Z2 – 120 min
- Sábado – Z2 – 120 min

Hasta aproximarse al volumen disponible del atleta.

### Beneficio

Permite que el plan aproveche la disponibilidad real del atleta sin comprometer la calidad de las sesiones clave.

## Regla 014 – Extender sesiones existentes con bloques complementarios Z2

### Objetivo

Aprovechar el tiempo disponible restante dentro de un día que ya posee una sesión asignada, sin romper la regla de una sola sesión por día.

### Descripción

Cuando un día tiene más disponibilidad que la duración base de la sesión asignada, el motor puede extender la sesión agregando un bloque complementario de Zona 2.

Esto aplica especialmente para sesiones como:

- VO2
- Umbral

En estos casos, no se aumenta la duración de la intensidad principal, sino que se agrega un bloque adicional de trabajo aeróbico.

### Justificación

No es lógico convertir una sesión de VO2 o Umbral en una sesión excesivamente larga de alta intensidad. Por eso, el motor conserva el bloque principal y utiliza el tiempo restante como Z2 complementario.

### Ejemplo

Disponibilidad del miércoles:

- 4 horas = 240 minutos

Sesión inicial:

- Miércoles – VO2 – 90 minutos

Sesión ajustada:

- Miércoles – VO2 + Z2 – 240 minutos

Bloques internos:

- VO2 – 90 minutos
- Z2 Complementario – 150 minutos

### Resultado esperado

El sistema mantiene una sola sesión por día, pero aprovecha mejor la disponibilidad real del atleta.

### Relación con reglas anteriores

Esta regla complementa:

- Regla 009: No colocar dos sesiones el mismo día.
- Regla 013: Completar volumen restante con Z2.
