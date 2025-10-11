"use client"

import { useSession } from "next-auth/react"
import { redirect } from "next/navigation"
import { SidebarLayout } from "@/components/sidebar-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
} from "lucide-react"

export default function StudentAttendance() {
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

  // Datos de ejemplo de asistencia
  const attendanceStats = {
    totalDays: 150,
    presentDays: 144,
    absentDays: 6,
    lateDays: 3,
    attendanceRate: 96.0
  }

  const recentAttendance = [
    { date: "2024-10-07", status: "present", subject: "Matemáticas", time: "08:00" },
    { date: "2024-10-07", status: "present", subject: "Español", time: "09:00" },
    { date: "2024-10-07", status: "late", subject: "Ciencias", time: "10:15" },
    { date: "2024-10-06", status: "present", subject: "Historia", time: "08:00" },
    { date: "2024-10-06", status: "present", subject: "Arte", time: "11:00" },
    { date: "2024-10-05", status: "absent", subject: "Matemáticas", time: "08:00" },
    { date: "2024-10-05", status: "present", subject: "Español", time: "09:00" },
  ]

  const monthlyAttendance = [
    { month: "Enero", present: 20, absent: 1, late: 0, total: 21 },
    { month: "Febrero", present: 19, absent: 1, late: 1, total: 21 },
    { month: "Marzo", present: 22, absent: 0, late: 0, total: 22 },
    { month: "Abril", present: 19, absent: 2, late: 1, total: 22 },
    { month: "Mayo", present: 21, absent: 1, late: 0, total: 22 },
    { month: "Junio", present: 20, absent: 1, late: 1, total: 22 },
    { month: "Julio", present: 15, absent: 0, late: 0, total: 15 },
    { month: "Agosto", present: 21, absent: 0, late: 0, total: 21 },
    { month: "Septiembre", present: 21, absent: 0, late: 0, total: 21 },
    { month: "Octubre", present: 6, absent: 0, late: 0, total: 6 },
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "absent":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "late":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "present":
        return <Badge variant="default" className="bg-green-600">Presente</Badge>
      case "absent":
        return <Badge variant="destructive">Falta</Badge>
      case "late":
        return <Badge variant="secondary" className="bg-yellow-600 text-white">Tardanza</Badge>
      default:
        return null
    }
  }

  return (
    <SidebarLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-xl p-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Mi Asistencia</h1>
          <p className="text-green-100">
            Consulta tu record de asistencia y puntualidad
          </p>
        </div>

        {/* Estadísticas Generales */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Asistencia Total</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {attendanceStats.attendanceRate}%
              </div>
              <Progress value={attendanceStats.attendanceRate} className="mt-2" />
              <p className="text-xs text-muted-foreground mt-1">
                Excelente asistencia
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Días Presentes</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {attendanceStats.presentDays}
              </div>
              <p className="text-xs text-muted-foreground">
                de {attendanceStats.totalDays} días
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Faltas</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {attendanceStats.absentDays}
              </div>
              <p className="text-xs text-muted-foreground">
                Faltas justificadas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tardanzas</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {attendanceStats.lateDays}
              </div>
              <p className="text-xs text-muted-foreground">
                Llegadas tarde
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Asistencia Reciente */}
        <Card>
          <CardHeader>
            <CardTitle>Asistencia Reciente</CardTitle>
            <CardDescription>
              Registro de asistencia de los últimos días
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Materia</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead className="text-center">Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentAttendance.map((record, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">
                      {new Date(record.date).toLocaleDateString('es-ES', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </TableCell>
                    <TableCell>{record.subject}</TableCell>
                    <TableCell>{record.time}</TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center space-x-2">
                        {getStatusIcon(record.status)}
                        {getStatusBadge(record.status)}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Asistencia Mensual */}
        <Card>
          <CardHeader>
            <CardTitle>Asistencia por Mes</CardTitle>
            <CardDescription>
              Resumen mensual de tu asistencia durante el año escolar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Mes</TableHead>
                  <TableHead className="text-center">Días Totales</TableHead>
                  <TableHead className="text-center">Presente</TableHead>
                  <TableHead className="text-center">Faltas</TableHead>
                  <TableHead className="text-center">Tardanzas</TableHead>
                  <TableHead className="text-center">% Asistencia</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyAttendance.map((month, index) => {
                  const attendancePercentage = ((month.present / month.total) * 100).toFixed(1)
                  return (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell className="text-center">{month.total}</TableCell>
                      <TableCell className="text-center">
                        <span className="text-green-600 font-medium">{month.present}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-red-600 font-medium">{month.absent}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <span className="text-yellow-600 font-medium">{month.late}</span>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge 
                          variant={parseFloat(attendancePercentage) >= 95 ? "default" : 
                                   parseFloat(attendancePercentage) >= 85 ? "secondary" : "destructive"}
                        >
                          {attendancePercentage}%
                        </Badge>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </SidebarLayout>
  )
}