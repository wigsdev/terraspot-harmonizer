# 🛡️ AGENTS.md — Gobernanza de Agentes e Ingeniería (TerraSpot Harmonizer)

Este documento define las reglas operativas estrictas que todo agente de IA (Gemini, Claude o subagentes en Antigravity) debe cumplir al trabajar en el repositorio **`wigsdev/terraspot-harmonizer`** (**TerraSpot Harmonizer — NASA Space Apps Challenge 2026**).

---

## 1. Idioma y Comunicación

- **Respuestas al Usuario:** Toda interacción, explicación y reporte hacia el desarrollador (**Wilmer Gulcochía `@wigsdev`**) debe ser **100% en español**.
- **Interfaz de la Aplicación y Entregables NASA:** Por exigencia obligatoria de la _Project Submission Guide_ para el _Global Judging_, la interfaz de usuario de la aplicación web, etiquetas de gráficos y textos del formulario de postulación deben estar en **inglés** (con soporte bilingüe `EN / ES` en la UI).

---


## 2. Desarrollo, Entorno, SDD (Spec Kit) y Aislamiento de Referencias

- **Gestor de Paquetes Node:** Utilizar **`pnpm` exclusivamente** (`pnpm install`, `pnpm dev`, `pnpm build`) sobre Node.js `v24.x` (`pnpm 12.21.0`). **Prohibido usar `npm` o `yarn`**.
- **Metodología SDD (Spec-Driven Development) con Spec Kit:**
  - El proyecto utiliza **Spec Kit (`specify-cli`)** bajo el flujo SDD: `constitution` $\rightarrow$ `specify` $\rightarrow$ `clarify` $\rightarrow$ `plan` $\rightarrow$ `tasks` $\rightarrow$ `analyze` $\rightarrow$ `implement`.
- **Git Hooks Profesionales con Husky:**
  - Uso de **Husky** (`.husky/pre-commit` y `.husky/commit-msg`) para validar formato, compilación/tipado y cumplimiento estricto de _Conventional Commits_.
- **Pipeline Científico Python:** Utilizar `python3` (`Python 3.13.x`) / `uv` para ejecutar `scripts/build_harmonized_cubes.py` y `scripts/create_github_issues.py`.
- **Aislamiento Estricto de `.reference/`:**
  - El directorio `.reference/` contiene los documentos de consulta general del hackathon y apuntes internos. Está excluido en `.gitignore`.
  - **NUNCA** incluir `.reference/` en commits de Git, ni referenciarlo en archivos públicos de producción.
  - En el directorio `docs/` de la raíz del proyecto residen **únicamente** los documentos técnicos e ingenieriles utilizados directamente en el proyecto (`01-prd` a `06-tools`, `backlog.md`, `design-system.md`, `workflow.md`, `operational-work-plan.md`).

---

## 3. Reglas de Gobernanza, Git Flow y Commits

1. **Estrategia de Ramas (GitHub Flow Unipersonal):**
   - No realizar commits de código sin validar en `main`.
   - Trabajar por tareas atómicas del Backlog (`docs/backlog.md`) usando ramas `feat/T-XX-descripcion` o `fix/T-XX-descripcion`.
   - Seguir estrictamente el formato **Conventional Commits v1.0.0**:
     `<tipo>(<alcance>): <descripción en imperativo> (T-XX)`
     _(Tipos válidos: `feat`, `fix`, `style`, `docs`, `chore`, `refactor`)_.
   - Vincular el Issue correspondiente al cerrar la tarea (`Closes #XX`).

2. **Versionado Semántico (SemVer 2.0.0) y Protocolo de Changelog:**
   - El proyecto inicia en `0.1.0` (`T-01`) y alcanza `1.0.0` (`T-12`) al completar el despliegue público y el paquete de entrega a la NASA.
   - Al concluir cada tarea del backlog, evaluar el impacto: incrementar `MINOR` (`0.X.0`) para nuevas funcionalidades/módulos/pipelines, o `PATCH` (`0.X.Y`) para correcciones, ajustes de estilo o refactorizaciones.
   - Sincronizar el campo `"version"` en `package.json` y documentar todos los cambios en `CHANGELOG.md` bajo el formato _Keep a Changelog 1.1.0_ (`Añadido`, `Modificado`, `Corregido`).

3. **Definition of Done (DoD) y Autorización Estricta de Commits:**
   - Antes de dar por terminada cualquier tarea de código, ejecutar `pnpm build` para verificar compilación limpia sin errores de TypeScript ni advertencias críticas.
   - **REGLA OBLIGATORIA:** **NUNCA ejecutar `git commit` ni `git push` de forma automática.** Siempre presentar el resumen de los cambios realizados y la entrada actualizada en `CHANGELOG.md` al usuario, colocarse en espera y ejecutar el commit **ÚNICAMENTE** tras recibir su aprobación explícita (_"visto bueno"_).

---

## 4. Arquitectura, Rigor Científico y Reglas de la NASA

1. **Rigor en la Armonización MODIS + VIIRS:**
   - Conservar siempre la trazabilidad entre los conteos crudos de **MODIS Collection 6.1** ($1\text{ km}$, 2000–2026) y **VIIRS Collection 2** ($375\text{ m}$, 2012–2026), las celdas-día activas en grilla de $0.01^\circ$ (_AFCD_), el factor estacional $\beta_m$ y el conteo armonizado final ($H_{y,m}$).
2. **Accesibilidad Visual (WCAG 2.1 AA + Colorblind-Safe):**
   - El _Burning Activity Calendar_ debe utilizar exclusivamente rampas cromáticas accesibles (**Inferno**, **Viridis**, **Cividis** y **Divergente Azul-Blanco-Rojo**).
3. **Cumplimiento de Super Intelligence (SI) de la NASA:**
   - Prohibido generar, incluir o modificar logotipos, insignias o banderas oficiales de la NASA mediante herramientas de IA.
   - Mantener documentado el uso de asistencia de IA en los metadatos y en `docs/05-plan-entrega-pitch-rubrica.md`.
4. **Ahorro Estratégico de Cuota entre Modelos:**
   - Ejecutar toda la carga de comandos, scripts de datos, arquitectura y desarrollo general con la familia **Gemini (Pro)**.
   - Reservar **Claude Sonnet 5.5** y **Claude Opus 5.5** únicamente para intervenciones puntuales de pulido visual y auditoría final del pitch.

---

## 5. Documentación Técnica del Proyecto (`docs/`)

Antes de abordar cualquier tarea del Backlog, consultar:

- [Product Backlog Granular (`docs/backlog.md`)](docs/backlog.md)
- [Workflow de Desarrollo y SemVer (`docs/workflow.md`)](docs/workflow.md)
- [Plan de Trabajo Operativo Integral (`docs/operational-work-plan.md`)](docs/operational-work-plan.md)
- [Sistema de Diseño, Tokens y Wireframes ASCII (`docs/design-system.md`)](docs/design-system.md)
- [PRD — Requisitos del Producto (`docs/01-prd-terraspot-harmonizer.md`)](docs/01-prd-terraspot-harmonizer.md)
- [Metodología Matemática de Armonización (`docs/02-modis-viirs-harmonization-methodology.md`)](docs/02-modis-viirs-harmonization-methodology.md)
- [Arquitectura Técnica del Sistema (`docs/03-system-technical-architecture.md`)](docs/03-system-technical-architecture.md)
- [Especificación de Datos NASA FIRMS (`docs/04-firms-data-specification.md`)](docs/04-firms-data-specification.md)
- [Plan de Entrega, Formulario en Inglés y Pitch (`docs/05-submission-pitch-rubric-plan.md`)](docs/05-submission-pitch-rubric-plan.md)
- [Stack Tecnológico y Herramientas (`docs/06-technology-stack-tools.md`)](docs/06-technology-stack-tools.md)
