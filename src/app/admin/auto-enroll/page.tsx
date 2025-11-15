'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Loader2, CheckCircle, Users } from 'lucide-react'

export default function AutoEnrollPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    message: string
    totalEnrolled: number
    classesUpdated: number
    details: Array<{
      className: string
      studentsEnrolled: number
      studentNames: string[]
    }>
  } | null>(null)
  const { toast } = useToast()

  const handleAutoEnroll = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/auto-enroll', {
        method: 'POST'
      })

      if (!response.ok) {
        throw new Error('Error al matricular estudiantes')
      }

      const data = await response.json()
      setResult(data)
      
      toast({
        title: 'Matriculación completada',
        description: `Se matricularon ${data.totalEnrolled} estudiantes en ${data.classesUpdated} clases`,
      })
    } catch (error) {
      console.error(error)
      toast({
        title: 'Error',
        description: 'No se pudo completar la matriculación automática',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-6 w-6" />
            Matriculación Automática de Estudiantes
          </CardTitle>
          <CardDescription>
            Este proceso matriculará automáticamente a todos los estudiantes en las clases que correspondan a su grado y sección.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>¿Cómo funciona?</strong>
              <br />
              El sistema buscará todas las clases activas y matriculará automáticamente a los estudiantes cuyo grado y sección coincidan con cada clase.
              Solo matriculará estudiantes que aún no estén inscritos.
            </p>
          </div>

          <Button 
            onClick={handleAutoEnroll} 
            disabled={loading}
            size="lg"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Procesando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                Iniciar Matriculación Automática
              </>
            )}
          </Button>

          {result && (
            <div className="mt-6 space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ✅ Matriculación Completada
                </h3>
                <p className="text-sm text-green-700">
                  Total de estudiantes matriculados: <strong>{result.totalEnrolled}</strong>
                  <br />
                  Clases actualizadas: <strong>{result.classesUpdated}</strong>
                </p>
              </div>

              {result.details.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold">Detalles por clase:</h4>
                  <div className="max-h-96 overflow-y-auto space-y-2">
                    {result.details.map((detail, index) => (
                      <Card key={index}>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-sm">{detail.className}</CardTitle>
                          <CardDescription>
                            {detail.studentsEnrolled} estudiante(s) matriculado(s)
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ul className="text-xs text-muted-foreground list-disc list-inside">
                            {detail.studentNames.map((name, i) => (
                              <li key={i}>{name}</li>
                            ))}
                          </ul>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {result.totalEnrolled === 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    No se encontraron estudiantes nuevos para matricular. Todos los estudiantes ya están inscritos en sus clases correspondientes.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
