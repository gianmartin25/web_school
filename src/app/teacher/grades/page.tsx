import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TeacherGrades() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Calificaciones</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Calificaciones</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            Aquí podrás registrar y gestionar las calificaciones de tus estudiantes.
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Esta funcionalidad está en desarrollo.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}