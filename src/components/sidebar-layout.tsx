"use client"

import { useSession, signOut } from "next-auth/react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { InstitutionLogoMini } from "@/components/institution-logo"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  BookOpen,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  Home,
  GraduationCap,
  Calendar,
  Menu,
  X,
  BarChart3,
  UserCheck,
  ClipboardList,
  Cog,
} from "lucide-react"

interface SidebarLayoutProps {
  children: React.ReactNode
}

interface NavigationItem {
  href: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  badge?: number
}

export function SidebarLayout({ children }: SidebarLayoutProps) {
  const { data: session } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  if (!session) {
    return null
  }

  const getNavigationItems = (): NavigationItem[] => {
    const role = session.user.role

    const commonItems = [
      { href: "/dashboard", label: "Inicio", icon: Home },
    ]

    if (role === "PARENT") {
      return [
        ...commonItems,
        { href: "/parent/children", label: "Mis Hijos", icon: Users },
        { href: "/parent/grades", label: "Calificaciones", icon: BookOpen },
        { href: "/parent/attendance", label: "Asistencia", icon: Calendar },
      ]
    }

    if (role === "TEACHER") {
      return [
        ...commonItems,
        { href: "/teacher", label: "Dashboard", icon: Home },
        // { href: "/teacher/classes", label: "Mis Clases", icon: GraduationCap },
        // { href: "/teacher/students", label: "Mis Estudiantes", icon: Users },
        { href: "/teacher/attendance", label: "Asistencia", icon: UserCheck },
        { href: "/teacher/grades", label: "Calificaciones", icon: BookOpen },
        // { href: "/teacher/schedule", label: "Mi Horario", icon: Calendar },
      ]
    }

    if (role === "ADMIN") {
      return [
        ...commonItems,
        // Gestión de Entidades Principales
        { href: "/admin/students", label: "Estudiantes", icon: Users },
        { href: "/admin/teachers", label: "Profesores", icon: GraduationCap },
        { href: "/admin/subjects", label: "Materias", icon: BookOpen },
        { href: "/admin/classes", label: "Clases", icon: Settings },
        { href: "/admin/grades", label: "Grados y Secciones", icon: GraduationCap },
        // Módulos Administrativos Avanzados
        // { href: "/admin/academic-config", label: "Configuración Académica", icon: Cog },
        // { href: "/admin/reports", label: "Reportes y Dashboard", icon: BarChart3 },
      ]
    }

    if (role === "STUDENT") {
      return [
        ...commonItems,
        { href: "/student/grades", label: "Mis Calificaciones", icon: BookOpen },
        // { href: "/student/attendance", label: "Mi Asistencia", icon: Calendar },
        // { href: "/student/schedule", label: "Mi Horario", icon: UserCheck },
        // { href: "/student/homework", label: "Mis Tareas", icon: ClipboardList },
        // { href: "/student/reports", label: "Reportes", icon: BarChart3 },
      ]
    }

    return commonItems
  }

  const navigationItems = getNavigationItems()

  const SidebarContent = () => (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Logo */}
      <div className="flex h-16 items-center border-b px-4 flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700">
        <Link href="/dashboard" className="flex items-center space-x-2 text-white">
          <InstitutionLogoMini className="flex-shrink-0" />
          <div className="flex flex-col">
            <span className="text-sm font-bold leading-tight">I.E. 3024</span>
            <span className="text-xs opacity-90 leading-tight">José A. Encinas</span>
          </div>
        </Link>
      </div>

      {/* User info */}
      <div className="border-b p-6 flex-shrink-0">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
            <AvatarFallback>
              {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {session.user.name}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {session.user.role === "PARENT" ? "Padre/Madre" : 
               session.user.role === "TEACHER" ? "Profesor/a" : 
               session.user.role === "ADMIN" ? "Administrador" : 
               session.user.role === "STUDENT" ? "Estudiante" : session.user.role}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
              )}
              onClick={() => setSidebarOpen(false)}
            >
              <div className="flex items-center space-x-3">
                <item.icon className="h-5 w-5" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <Badge variant="destructive" className="h-5 w-5 rounded-full p-0 text-xs">
                  {item.badge}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom section */}
      <div className="border-t p-4 space-y-2 flex-shrink-0">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex w-full items-center space-x-3 rounded-lg px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-5 w-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 lg:z-40 lg:bg-white">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-lg overflow-hidden">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-white">
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-30 flex h-16 bg-white border-b border-gray-200 shadow-sm">
          <button
            type="button"
            className="border-r border-gray-200 px-4 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          <div className="flex flex-1 justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex flex-1 items-center">
              <h1 className="text-xl font-semibold text-gray-900">
                {navigationItems.find(item => item.href === pathname)?.label || "Panel de Control"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              {/* Profile dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={session.user.image || ""} alt={session.user.name || ""} />
                      <AvatarFallback>
                        {session.user.name ? session.user.name.charAt(0).toUpperCase() : "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      Configuración
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="text-red-600"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="min-h-[calc(100vh-4rem)]">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}