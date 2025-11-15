# Guía de Despliegue - Sistema de Gestión Escolar

## Opción 1: Vercel (Recomendado) ✅

### Paso 1: Preparar el repositorio
```bash
# Asegúrate de que todo esté commiteado
git add .
git commit -m "Preparar para deployment"
git push origin main
```

### Paso 2: Configurar Vercel
1. Ve a https://vercel.com
2. Haz clic en "Sign Up" y elige "Continue with GitHub"
3. Autoriza Vercel para acceder a tu GitHub
4. Haz clic en "Import Project"
5. Busca tu repositorio `web_school`
6. Haz clic en "Import"

### Paso 3: Configurar Variables de Entorno
En el dashboard de Vercel, ve a Settings → Environment Variables y agrega:

```env
# Database
DATABASE_URL="tu_url_de_postgresql"

# NextAuth
NEXTAUTH_SECRET="genera_un_secreto_aleatorio"
NEXTAUTH_URL="https://tu-app.vercel.app"

# Si usas otras APIs
# API_KEY="tu_api_key"
```

**Generar NEXTAUTH_SECRET:**
```bash
openssl rand -base64 32
```

### Paso 4: Configurar Base de Datos

#### Opción A: Vercel Postgres (Gratis - Recomendado)
1. En tu proyecto de Vercel, ve a "Storage" → "Create Database"
2. Selecciona "Postgres"
3. Elige "Hobby" (gratis: 256 MB, 60 horas de compute)
4. La variable `DATABASE_URL` se configurará automáticamente

#### Opción B: Neon (Gratis - 3GB)
1. Ve a https://neon.tech
2. Crea una cuenta
3. Crea un nuevo proyecto
4. Copia la `DATABASE_URL`
5. Agrégala en Vercel

#### Opción C: Supabase (Gratis - 500MB)
1. Ve a https://supabase.com
2. Crea un proyecto
3. Ve a Settings → Database
4. Copia la "Connection string"
5. Agrégala en Vercel

### Paso 5: Ejecutar Migraciones
```bash
# Instala Vercel CLI
npm i -g vercel

# Inicia sesión
vercel login

# Conecta tu proyecto
vercel link

# Ejecuta las migraciones
vercel env pull .env.local
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

### Paso 6: Deploy
Vercel desplegará automáticamente cada vez que hagas push a `main`.

Para deploy manual:
```bash
vercel --prod
```

---

## Opción 2: Railway (Gratis - $5/mes de crédito)

### Paso 1: Crear cuenta
1. Ve a https://railway.app
2. Regístrate con GitHub

### Paso 2: Crear nuevo proyecto
1. Haz clic en "New Project"
2. Selecciona "Deploy from GitHub repo"
3. Selecciona `web_school`

### Paso 3: Agregar PostgreSQL
1. Haz clic en "+ New" → "Database" → "PostgreSQL"
2. Railway generará automáticamente `DATABASE_URL`

### Paso 4: Configurar Variables
1. Ve a tu servicio Next.js
2. Click en "Variables"
3. Agrega:
```env
NEXTAUTH_SECRET=tu_secreto_aleatorio
NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
```

### Paso 5: Ejecutar Migraciones
En la pestaña "Settings" → "Deploy":
```bash
npx prisma migrate deploy && npx prisma db seed
```

---

## Opción 3: Render (Gratis con limitaciones)

### Paso 1: Crear cuenta
1. Ve a https://render.com
2. Regístrate con GitHub

### Paso 2: Crear Base de Datos
1. Click en "New +" → "PostgreSQL"
2. Elige plan "Free" (90 días, luego expira)
3. Copia la "Internal Database URL"

### Paso 3: Crear Web Service
1. Click en "New +" → "Web Service"
2. Conecta tu repo `web_school`
3. Configuración:
   - **Build Command:** `npm install && npm run build && npx prisma migrate deploy`
   - **Start Command:** `npm start`

### Paso 4: Variables de Entorno
```env
DATABASE_URL=tu_postgres_url
NEXTAUTH_SECRET=tu_secreto
NEXTAUTH_URL=https://tu-app.onrender.com
NODE_VERSION=18.17.0
```

---

## Comparación de Opciones

| Característica | Vercel | Railway | Render |
|----------------|--------|---------|--------|
| **Precio** | Gratis | $5 crédito/mes | Gratis (limitado) |
| **Base de Datos** | 256 MB | 500 MB | 1 GB (90 días) |
| **Build Time** | 6000 min/mes | Incluido | 500 hrs/mes |
| **Dominio** | ✅ Gratis | ✅ Gratis | ✅ Gratis |
| **SSL** | ✅ Automático | ✅ Automático | ✅ Automático |
| **CI/CD** | ✅ Automático | ✅ Automático | ✅ Automático |
| **Next.js** | ⭐ Optimizado | ✅ Bueno | ✅ Bueno |
| **Recomendado** | ⭐⭐⭐ | ⭐⭐ | ⭐ |

---

## Comandos Útiles Post-Deploy

### Ver logs
```bash
# Vercel
vercel logs

# Railway
railway logs

# Render
Ver en dashboard
```

### Revertir deployment
```bash
# Vercel
vercel rollback

# Railway/Render
Usar dashboard
```

### Ejecutar seed data
```bash
# Después del primer deploy
vercel env pull
npx prisma db seed
```

---

## Checklist Pre-Deploy ✅

- [ ] Variables de entorno configuradas
- [ ] Base de datos creada
- [ ] Migraciones ejecutadas
- [ ] `npm run build` funciona localmente
- [ ] Tests pasando
- [ ] `.env` en `.gitignore`
- [ ] Credenciales de prueba documentadas

---

## Variables de Entorno Requeridas

```env
# Database
DATABASE_URL="postgresql://..."

# NextAuth
NEXTAUTH_SECRET="secreto_aleatorio_seguro"
NEXTAUTH_URL="https://tu-dominio.vercel.app"

# Opcional: Email (si implementas notificaciones)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT=587
EMAIL_SERVER_USER="tu@email.com"
EMAIL_SERVER_PASSWORD="tu_password"
EMAIL_FROM="noreply@tu-app.com"
```

---

## Troubleshooting

### Error: "Module not found"
```bash
npm install
npm run build
```

### Error: Prisma Client
```bash
npx prisma generate
npx prisma migrate deploy
```

### Error: 500 Internal Server Error
- Verifica variables de entorno
- Revisa logs: `vercel logs`
- Verifica conexión a DB

### Build timeout
- Verifica que `next.config.ts` tenga:
```typescript
{
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true }
}
```
