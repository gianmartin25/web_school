# Sistema de Gestión Escolar

Un sistema completo de gestión escolar desarrollado con Next.js 14, TypeScript, Prisma ORM y PostgreSQL.

## 🚀 Características Principales

### Para Padres
- **Dashboard personalizado** con resumen del progreso académico
- **Visualización de calificaciones** en tiempo real
- **Control de asistencia** de sus hijos
- **Mensajería directa** con profesores
- **Notificaciones automáticas** sobre ausencias y nuevas calificaciones
- **Observaciones del comportamiento** estudiantil

### Para Profesores
- **Gestión de clases** y estudiantes
- **Registro de calificaciones** por tipo (exámenes, tareas, participación)
- **Control de asistencia** diario
- **Sistema de observaciones** del comportamiento
- **Comunicación directa** con padres
- **Dashboard con estadísticas** de sus clases

### Para Administradores
- **Panel de control completo** del sistema
- **Gestión de usuarios** (profesores, padres, estudiantes)
- **Reportes y estadísticas** generales
- **Configuración del sistema**
- **Supervisión de actividades**

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui, Radix UI, Lucide React
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL con Prisma ORM
- **Autenticación**: NextAuth.js
- **Validación**: Zod, React Hook Form
- **Estado**: TanStack Query (React Query)
- **Estilos**: Tailwind CSS

## 📋 Requisitos Previos

- Node.js 18.0 o superior
- PostgreSQL 12 o superior
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar variables de entorno
Configura las siguientes variables en `.env.local`:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/school_db?schema=public"

# NextAuth.js
NEXTAUTH_SECRET="your-nextauth-secret-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (for notifications)
EMAIL_FROM="noreply@school.com"
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
```

### 3. Configurar la base de datos
```bash
# Generar el cliente de Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev --name init
```

### 4. Ejecutar el proyecto
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 🔐 Credenciales de Prueba

- **Administrador**: admin@school.com / admin123
- **Profesor**: teacher@school.com / teacher123
- **Padre**: parent@school.com / parent123

## 📝 Funcionalidades Implementadas

✅ Autenticación multi-rol  
✅ Dashboard personalizado por rol  
✅ Gestión de estudiantes  
✅ Sistema de calificaciones  
✅ Control de asistencia  
✅ Sistema de mensajería  
✅ Notificaciones  
✅ Observaciones del comportamiento  
✅ Diseño responsivo  
✅ Validación de formularios  

## 🔄 Próximas Funcionalidades

- [ ] Sistema de reportes avanzados
- [ ] Calendario académico
- [ ] Gestión de tareas y asignaciones
- [ ] Sistema de evaluaciones en línea
- [ ] Integración con email
- [ ] Aplicación móvil

## 📁 Estructura del Proyecto

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   ├── auth/              # Páginas de autenticación
│   └── dashboard/         # Dashboard principal
├── components/            # Componentes React
│   └── ui/               # Componentes de UI (shadcn/ui)
├── lib/                  # Utilidades y configuraciones
│   ├── auth.ts           # Configuración de NextAuth
│   └── prisma.ts         # Cliente de Prisma
└── types/                # Definiciones de tipos TypeScript
prisma/
└── schema.prisma         # Esquema de la base de datos
```

El proyecto está listo para desarrollo. Ejecuta `npm run dev` para comenzar.
