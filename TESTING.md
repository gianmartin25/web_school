# Testing Documentation - Sistema de Gestión Escolar

## 📋 Resumen de Pruebas

Este proyecto incluye pruebas unitarias e de integración para las funcionalidades más críticas del sistema de gestión escolar.

## 🎯 Cobertura de Pruebas

### 1. **Componentes UI** (`src/__tests__/components/`)

#### SubjectCombobox (`subject-combobox.test.tsx`)
- ✅ Renderizado del componente
- ✅ Visualización de materia seleccionada
- ✅ Filtrado de materias al buscar
- ✅ Callback onChange al seleccionar
- ✅ Mensaje "No se encontraron materias"
- ✅ Visualización de badges de código

#### MultiSubjectCombobox (`multi-subject-combobox.test.tsx`)
- ✅ Renderizado con selección vacía
- ✅ Badge con contador de materias seleccionadas
- ✅ Visualización de materias seleccionadas
- ✅ Agregar materias
- ✅ Remover materias clickeando de nuevo
- ✅ Remover via botón X
- ✅ Filtrado de búsqueda
- ✅ Checkmarks para items seleccionados

### 2. **APIs Críticas** (`src/__tests__/api/`)

#### Attendance API (`attendance.test.ts`)
Pruebas para `/api/teacher/attendance/bulk`:

**POST - Registro de Asistencia:**
- ✅ Rechazo de usuarios no autenticados (401)
- ✅ Rechazo de usuarios no profesores (403)
- ✅ Validación de campos requeridos (400)
- ✅ Creación exitosa de registros de asistencia

**GET - Consulta de Asistencia:**
- ✅ Rechazo de usuarios no autenticados (401)
- ✅ Validación de parámetros requeridos (400)
- ✅ Retorno de estudiantes con datos de asistencia

#### Grades API (`grades.test.ts`)
- ✅ Autorización por rol
- ✅ Validación de calificaciones (0-20)
- ✅ Validación de campos requeridos
- ✅ Cálculo de promedios
- ✅ Determinación de aprobado/reprobado
- ✅ Cálculo de nota final ponderada
- ✅ Estructura de datos de submission

### 3. **Utilidades** (`src/__tests__/lib/`)

#### Authentication (`auth.test.ts`)
- ✅ Hash de contraseñas con bcrypt
- ✅ Verificación de contraseñas correctas
- ✅ Rechazo de contraseñas incorrectas
- ✅ Control de acceso basado en roles (TEACHER, STUDENT, ADMIN, PARENT)
- ✅ Verificación de permisos por recurso
- ✅ Validación de sesión
- ✅ Detección de sesión expirada
- ✅ Validación de perfiles (teacher, student)
- ✅ Validación de formato de email

#### Date Utilities (`date-utils.test.ts`)
- ✅ Formateo de fechas (YYYY-MM-DD, español, HH:mm, 12h)
- ✅ Parsing de strings ISO
- ✅ Comparaciones de fechas (isAfter, isBefore)
- ✅ Cálculo de diferencia en días
- ✅ Obtención de día de la semana
- ✅ Verificación de día hábil
- ✅ Obtención de inicio/fin de día
- ✅ Suma de días hábiles (skip weekends)
- ✅ Verificación de fecha en periodo académico
- ✅ Cálculo de duración de periodo

## 🚀 Ejecutar Pruebas

### Ejecutar todas las pruebas
```bash
npm test
```

### Ejecutar en modo watch (desarrollo)
```bash
npm run test:watch
```

### Ejecutar con cobertura
```bash
npm run test:coverage
```

### Ejecutar pruebas específicas
```bash
# Solo pruebas de componentes
npm test -- components

# Solo pruebas de API
npm test -- api

# Solo pruebas de utilidades
npm test -- lib

# Archivo específico
npm test -- attendance.test
```

## 📊 Estadísticas Actuales

- **Total de Suites:** 6
- **Total de Tests:** 50
- **Tests Exitosos:** 36+
- **Cobertura:**
  - Componentes UI: 2 archivos
  - APIs: 2 archivos
  - Utilidades: 2 archivos

## 🔑 Áreas Críticas Cubiertas

### 1. **Seguridad y Autenticación**
- Hash y verificación de contraseñas
- Control de acceso por roles
- Validación de sesiones
- Autorización en endpoints

### 2. **Gestión Académica**
- Registro de asistencia (CRUD completo)
- Sistema de calificaciones
- Validación de notas (0-20)
- Cálculos académicos (promedios, aprobación)

### 3. **Componentes Reutilizables**
- Autocomplete de materias
- Multi-select con búsqueda
- Validación de inputs

### 4. **Lógica de Negocio**
- Manejo de fechas y horarios
- Días hábiles escolares
- Periodos académicos
- Formateo español

## 🛠️ Configuración

### Jest Config (`jest.config.js`)
- Soporte para Next.js
- Mapeo de rutas con `@/`
- Entorno jsdom para tests de React
- Setup automático con `jest.setup.js`

### Setup Global (`jest.setup.js`)
- Testing Library DOM extensions
- Mock de ResizeObserver (para Popover/Command)
- Mock de IntersectionObserver

## 📝 Mejores Prácticas Implementadas

1. **AAA Pattern (Arrange-Act-Assert):** Tests estructurados claramente
2. **Descriptive Names:** Nombres de tests que explican qué se prueba
3. **Isolation:** Cada test es independiente
4. **Mocking:** Mocks de dependencias externas (Prisma, NextAuth)
5. **Edge Cases:** Pruebas de casos límite y errores
6. **Integration:** Tests que verifican flujos completos

## 🎓 Tipos de Pruebas

### Unitarias
- Funciones puras (cálculos, validaciones)
- Componentes individuales
- Utilidades aisladas

### Integración
- APIs con múltiples capas (auth, db, business logic)
- Flujos de usuario completos
- Interacciones entre componentes

### Funcionales
- Validación de reglas de negocio
- Comportamiento esperado del sistema
- Casos de uso reales

## 📖 Documentación Adicional

Para agregar nuevas pruebas:

1. **Componentes:** Crear archivo en `src/__tests__/components/[nombre].test.tsx`
2. **APIs:** Crear archivo en `src/__tests__/api/[nombre].test.ts`
3. **Utilidades:** Crear archivo en `src/__tests__/lib/[nombre].test.ts`

Convención de nombres:
- Archivos de test: `*.test.ts` o `*.test.tsx`
- Describe blocks: Nombre del componente/función
- Test cases: "should [comportamiento esperado]"

## 🔄 Integración Continua

Estas pruebas están listas para integrarse en pipelines CI/CD:
- Pre-commit hooks
- GitHub Actions
- GitLab CI
- Jenkins

Ejemplo comando para CI:
```bash
npm test -- --ci --coverage --maxWorkers=2
```

---

**Última actualización:** Noviembre 2025  
**Versión:** 1.0.0  
**Mantenido por:** Equipo de Desarrollo
