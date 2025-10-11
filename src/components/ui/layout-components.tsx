import React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { Plus, Search } from 'lucide-react'

interface PageHeaderProps {
  title: string
  description?: string
  icon?: React.ComponentType<{ className?: string }>
  children?: React.ReactNode
  className?: string
}

export function PageHeader({ title, description, icon: Icon, children, className }: PageHeaderProps) {
  return (
    <div className={cn("flex flex-col space-y-4 pb-6", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            {Icon && <Icon className="h-8 w-8 text-primary" />}
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">
              {title}
            </h1>
          </div>
          {description && (
            <p className="text-sm text-muted-foreground max-w-2xl">
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className="flex flex-col sm:flex-row gap-2">
            {children}
          </div>
        )}
      </div>
      <Separator />
    </div>
  )
}

interface StatsGridProps {
  stats: Array<{
    title: string
    value: string | number
    description?: string
    trend?: {
      value: number
      isPositive: boolean
    }
    icon?: React.ComponentType<{ className?: string }>
    color?: 'blue' | 'green' | 'orange' | 'red' | 'purple'
  }>
  className?: string
}

export function StatsGrid({ stats, className }: StatsGridProps) {
  const getColorClasses = (color: string = 'blue') => {
    const colors = {
      blue: 'bg-blue-50 border-blue-200 text-blue-700',
      green: 'bg-green-50 border-green-200 text-green-700',
      orange: 'bg-orange-50 border-orange-200 text-orange-700',
      red: 'bg-red-50 border-red-200 text-red-700',
      purple: 'bg-purple-50 border-purple-200 text-purple-700'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-4", className)}>
      {stats.map((stat, index) => (
        <Card key={index} className="transition-all hover:shadow-md">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <p className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </p>
                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">
                    {stat.value}
                  </p>
                  {stat.trend && (
                    <Badge 
                      variant={stat.trend.isPositive ? "default" : "destructive"}
                      className="text-xs"
                    >
                      {stat.trend.isPositive ? '+' : '-'}{Math.abs(stat.trend.value)}%
                    </Badge>
                  )}
                </div>
                {stat.description && (
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                )}
              </div>
              {stat.icon && (
                <div className={cn(
                  "rounded-full p-3",
                  getColorClasses(stat.color)
                )}>
                  <stat.icon className="h-6 w-6" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

interface ActionToolbarProps {
  searchPlaceholder?: string
  onSearch?: (value: string) => void
  filters?: Array<{
    label: string
    value: string
    options: Array<{ label: string; value: string }>
    onChange: (value: string) => void
  }>
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'outline' | 'secondary'
    icon?: React.ComponentType<{ className?: string }>
  }>
  selectedCount?: number
  bulkActions?: Array<{
    label: string
    onClick: () => void
    icon?: React.ComponentType<{ className?: string }>
    variant?: 'default' | 'destructive'
  }>
  className?: string
}

export function ActionToolbar({ 
  searchPlaceholder = "Buscar...", 
  onSearch,
  filters = [],
  actions = [],
  selectedCount = 0,
  bulkActions = [],
  className 
}: ActionToolbarProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between", className)}>
      <div className="flex flex-col sm:flex-row gap-3 flex-1">
        {onSearch && (
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="pl-10 pr-4 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent w-full"
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
        
        {filters.map((filter, index) => (
          <select
            key={index}
            className="px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[140px]"
            onChange={(e) => filter.onChange(e.target.value)}
            defaultValue=""
          >
            <option value="" disabled>{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>

      <div className="flex gap-2">
        {selectedCount > 0 && bulkActions.map((action, index) => (
          <Button
            key={`bulk-${index}`}
            variant={action.variant || 'outline'}
            size="sm"
            onClick={action.onClick}
            className="flex items-center gap-2"
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label} ({selectedCount})
          </Button>
        ))}
        
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant || 'default'}
            onClick={action.onClick}
            className="flex items-center gap-2"
          >
            {action.icon && <action.icon className="h-4 w-4" />}
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center py-12 px-4 text-center", className)}>
      {Icon && (
        <div className="mb-4 text-muted-foreground">
          <Icon className="h-12 w-12 mx-auto" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && (
        <Button onClick={action.onClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          {action.label}
        </Button>
      )}
    </div>
  )
}

interface LoadingStateProps {
  message?: string
  text?: string
  className?: string
}

export function LoadingState({ message, text = "Cargando...", className }: LoadingStateProps) {
  const displayText = message || text
  return (
    <div className={cn("flex flex-col items-center justify-center py-12", className)}>
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
      <p className="text-sm text-muted-foreground">{displayText}</p>
    </div>
  )
}

interface SectionProps {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  headerActions?: React.ReactNode
}

export function Section({ title, description, children, className, headerActions }: SectionProps) {
  return (
    <div className={cn("space-y-4", className)}>
      {(title || description || headerActions) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h2 className="text-lg font-semibold text-gray-900">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-sm text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {headerActions && headerActions}
        </div>
      )}
      {children}
    </div>
  )
}