"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Calendar,
  Clock,
  MapPin,
  User,
} from "lucide-react"

export default function StudentSchedule() {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== "STUDENT") {
    redirect("/auth/signin")
  }

  // Horario de ejemplo
  const schedule = [
    {
      day: "Lunes",
      classes: [
        { time: "08:00 - 08:45", subject: "Matemáticas", teacher: "Prof. María García", room: "Aula 201" },
        { time: "08:45 - 09:30", subject: "Lengua Española", teacher: "Prof. Carlos López", room: "Aula 102" },
        { time: "09:45 - 10:30", subject: "Ciencias Naturales", teacher: "Prof. Ana Rodríguez", room: "Lab. Ciencias" },
        { time: "10:30 - 11:15", subject: "Historia", teacher: "Prof. Luis Fernández", room: "Aula 105" },
        { time: "11:30 - 12:15", subject: "Educación Física", teacher: "Prof. Carmen Silva", room: "Gimnasio" },
      ]
    },
    {
      day: "Martes",
      classes: [
        { time: "08:00 - 08:45", subject: "Lengua Española", teacher: "Prof. Carlos López", room: "Aula 102" },
        { time: "08:45 - 09:30", subject: "Matemáticas", teacher: "Prof. María García", room: "Aula 201" },
        { time: "09:45 - 10:30", subject: "Arte", teacher: "Prof. Carmen Silva", room: "Taller Arte" },
        { time: "10:30 - 11:15", subject: "Ciencias Naturales", teacher: "Prof. Ana Rodríguez", room: "Lab. Ciencias" },
        { time: "11:30 - 12:15", subject: "Música", teacher: "Prof. David Ruiz", room: "Aula Música" },
      ]
    },
    {
      day: "Miércoles",
      classes: [
        { time: "08:00 - 08:45", subject: "Matemáticas", teacher: "Prof. María García", room: "Aula 201" },
        { time: "08:45 - 09:30", subject: "Historia", teacher: "Prof. Luis Fernández", room: "Aula 105" },
        { time: "09:45 - 10:30", subject: "Lengua Española", teacher: "Prof. Carlos López", room: "Aula 102" },
        { time: "10:30 - 11:15", subject: "Educación Física", teacher: "Prof. Carmen Silva", room: "Gimnasio" },
        { time: "11:30 - 12:15", subject: "Inglés", teacher: "Prof. Sarah Johnson", room: "Aula 301" },
      ]
    },
    {
      day: "Jueves",
      classes: [
        { time: "08:00 - 08:45", subject: "Ciencias Naturales", teacher: "Prof. Ana Rodríguez", room: "Lab. Ciencias" },
        { time: "08:45 - 09:30", subject: "Matemáticas", teacher: "Prof. María García", room: "Aula 201" },
        { time: "09:45 - 10:30", subject: "Inglés", teacher: "Prof. Sarah Johnson", room: "Aula 301" },
        { time: "10:30 - 11:15", subject: "Arte", teacher: "Prof. Carmen Silva", room: "Taller Arte" },
        { time: "11:30 - 12:15", subject: "Lengua Española", teacher: "Prof. Carlos López", room: "Aula 102" },
      ]
    },
    {
      day: "Viernes",
      classes: [
        { time: "08:00 - 08:45", subject: "Historia", teacher: "Prof. Luis Fernández", room: "Aula 105" },
        { time: "08:45 - 09:30", subject: "Educación Física", teacher: "Prof. Carmen Silva", room: "Gimnasio" },
        { time: "09:45 - 10:30", subject: "Matemáticas", teacher: "Prof. María García", room: "Aula 201" },
        { time: "10:30 - 11:15", subject: "Música", teacher: "Prof. David Ruiz", room: "Aula Música" },
        { time: "11:30 - 12:15", subject: "Proyecto Integrador", teacher: "Varios Profesores", room: "Aula 201" },
      ]
    }
  ]

  const getCurrentDaySchedule = () => {
    const today = new Date().toLocaleDateString('es-ES', { weekday: 'long' })
    const dayMap: { [key: string]: string } = {
      'lunes': 'Lunes',
      'martes': 'Martes',
      'miércoles': 'Miércoles',
      'jueves': 'Jueves',
      'viernes': 'Viernes'
    }
    return schedule.find(day => day.day === dayMap[today.toLowerCase()])
  }

  const todaySchedule = getCurrentDaySchedule()

  const getSubjectColor = (subject: string) => {
    const colors: { [key: string]: string } = {
      'Matemáticas': 'bg-blue-100 text-blue-800',
      'Lengua Española': 'bg-green-100 text-green-800',
      'Ciencias Naturales': 'bg-purple-100 text-purple-800',
      'Historia': 'bg-orange-100 text-orange-800',
      'Arte': 'bg-pink-100 text-pink-800',
      'Educación Física': 'bg-red-100 text-red-800',
      'Música': 'bg-yellow-100 text-yellow-800',
      'Inglés': 'bg-indigo-100 text-indigo-800',
      'Proyecto Integrador': 'bg-gray-100 text-gray-800'
    }
    return colors[subject] || 'bg-gray-100 text-gray-800'
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Mi Horario</h1>
          <p className="text-indigo-100">
            Consulta tu horario de clases semanal
          </p>
        </div>

        {/* Horario de Hoy */}
        {todaySchedule && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Clases de Hoy - {todaySchedule.day}</span>
              </CardTitle>
              <CardDescription>
                Tu horario para el día de hoy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaySchedule.classes.map((classItem, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-1" />
                        {classItem.time}
                      </div>
                      <Badge className={getSubjectColor(classItem.subject)}>
                        {classItem.subject}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-1" />
                        {classItem.teacher}
                      </div>
                      <div className="flex items-center text-sm text-gray-500">
                        <MapPin className="h-4 w-4 mr-1" />
                        {classItem.room}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Horario Completo */}
        <Card>
          <CardHeader>
            <CardTitle>Horario Semanal Completo</CardTitle>
            <CardDescription>
              Tu horario de clases para toda la semana
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {schedule.map((day, dayIndex) => (
                <div key={dayIndex}>
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 border-b pb-2">
                    {day.day}
                  </h3>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[150px]">Hora</TableHead>
                        <TableHead>Materia</TableHead>
                        <TableHead>Profesor</TableHead>
                        <TableHead>Aula</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {day.classes.map((classItem, classIndex) => (
                        <TableRow key={classIndex}>
                          <TableCell className="font-medium">{classItem.time}</TableCell>
                          <TableCell>
                            <Badge className={getSubjectColor(classItem.subject)}>
                              {classItem.subject}
                            </Badge>
                          </TableCell>
                          <TableCell>{classItem.teacher}</TableCell>
                          <TableCell>{classItem.room}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Información de Contacto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <h4 className="font-medium">Coordinador Académico</h4>
                <p className="text-sm text-gray-600">Lic. Roberto Méndez</p>
                <p className="text-sm text-gray-600">coordinacion@school.com</p>
                <p className="text-sm text-gray-600">Ext. 201</p>
              </div>
              <div>
                <h4 className="font-medium">Secretaría Académica</h4>
                <p className="text-sm text-gray-600">secretaria@school.com</p>
                <p className="text-sm text-gray-600">Ext. 100</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notas Importantes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>Recreo:</strong> 09:30 - 09:45 y 11:15 - 11:30
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Almuerzo:</strong> 12:15 - 13:00
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Biblioteca:</strong> Abierta de 07:30 - 16:00
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarLayout>
  )
}