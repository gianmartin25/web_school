'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface DashboardMetrics {
  overview?: {
    [key: string]: number | string
  }
  [key: string]: unknown
}

export function useDashboardMetrics() {
  const { data: session } = useSession()
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchMetrics = async () => {
    if (!session) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const response = await fetch('/api/dashboard/metrics')
      
      if (!response.ok) {
        throw new Error('Failed to fetch metrics')
      }
      
      const data = await response.json()
      setMetrics(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMetrics()
  }, [session])

  return { metrics, loading, error, refetch: fetchMetrics }
}