"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  BookOpen, 
  Users, 
  MessageSquare, 
  Bell, 
  Settings, 
  LogOut,
  Home,
  GraduationCap,
  Calendar,
  FileText
} from "lucide-react"

export function Navigation() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return <div>Cargando...</div>
  }

  if (!session) {
    return null
  }

  const getNavigationItems = () => {
    const role = session.user.role

    const commonItems = [
      { href: "/dashboard", label: "Inicio", icon: Home },
      { href: "/messages", label: "Mensajes", icon: MessageSquare },
      { href: "/notifications", label: "Notificaciones", icon: Bell },
    ]

    if (role === "PARENT") {
      return [
        ...commonItems,
        { href: "/students", label: "Mis Hijos", icon: Users },
        { href: "/grades", label: "Notas", icon: BookOpen },
        { href: "/attendance", label: "Asistencia", icon: Calendar },
        { href: "/observations", label: "Observaciones", icon: FileText },
      ]
    }

    if (role === "TEACHER") {
      return [
        ...commonItems,
        { href: "/students", label: "Estudiantes", icon: Users },
        { href: "/classes", label: "Clases", icon: GraduationCap },
        { href: "/grades", label: "Calificaciones", icon: BookOpen },
        { href: "/attendance", label: "Asistencia", icon: Calendar },
        { href: "/observations", label: "Observaciones", icon: FileText },
      ]
    }

    if (role === "ADMIN") {
      return [
        ...commonItems,
        { href: "/students", label: "Estudiantes", icon: Users },
        { href: "/teachers", label: "Profesores", icon: GraduationCap },
        { href: "/classes", label: "Clases", icon: BookOpen },
        { href: "/reports", label: "Reportes", icon: FileText },
        { href: "/settings", label: "Configuración", icon: Settings },
      ]
    }

    return commonItems
  }

  const navigationItems = getNavigationItems()

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                Sistema Escolar
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-900 hover:text-blue-600"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex items-center">
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
                    <p className="text-xs leading-none text-muted-foreground">
                      {session.user.role}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <Settings className="mr-2 h-4 w-4" />
                    Perfil
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
    </nav>
  )
}