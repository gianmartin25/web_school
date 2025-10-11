# School Management System - Copilot Instructions

## Project Overview
Complete school management system built with Next.js 14, TypeScript, Prisma ORM, and PostgreSQL.

## Key Features
- Student grade management
- Attendance tracking
- Parent-teacher messaging
- Notifications for parents
- Role-based authentication (teachers, parents, administrators)
- Dashboard for parents and teachers

## Technology Stack
- Frontend: Next.js 14 (App Router), TypeScript, Tailwind CSS, shadcn/ui
- Backend: Next.js API Routes, Prisma ORM
- Database: PostgreSQL
- Authentication: NextAuth.js
- Testing: Jest, Testing Library

## Development Guidelines
- Use TypeScript for all code
- Follow Next.js App Router patterns
- Implement proper error handling
- Use Prisma for database operations
- Follow mobile-first responsive design
- Implement comprehensive testing

## Project Structure
- `/src/app` - Next.js app router pages and API routes
- `/src/components` - Reusable UI components
- `/src/lib` - Utility functions and configurations
- `/src/types` - TypeScript type definitions
- `/prisma` - Database schema and migrations
- `/tests` - Test files

## Quick Start
1. Install dependencies: `npm install`
2. Configure environment variables in `.env.local`
3. Set up database: `npx prisma generate && npx prisma migrate dev`
4. Run development server: `npm run dev`

## Test Credentials
- Admin: admin@school.com / admin123
- Teacher: teacher@school.com / teacher123
- Parent: parent@school.com / parent123
- Student: pedro.perez@student.school.com / student123