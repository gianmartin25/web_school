import React from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { MoreHorizontal, Edit, Trash2, Eye, ChevronUp, ChevronDown } from 'lucide-react'

interface Column<T> {
  key: keyof T | string
  label: string
  sortable?: boolean
  width?: string
  render?: (value: unknown, item: T) => React.ReactNode
  className?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  selectable?: boolean
  selectedItems?: Set<string>
  onSelectionChange?: (selectedIds: Set<string>) => void
  onSort?: (column: string, direction: 'asc' | 'desc') => void
  sortColumn?: string
  sortDirection?: 'asc' | 'desc'
  actions?: Array<{
    label: string
    icon?: React.ReactNode
    onClick: (item: T) => void
    variant?: 'default' | 'destructive'
  }>
  className?: string
  emptyMessage?: string
}

export function DataTable<T extends { id: string }>({
  data,
  columns,
  loading = false,
  selectable = false,
  selectedItems = new Set(),
  onSelectionChange,
  onSort,
  sortColumn,
  sortDirection,
  actions = [],
  className,
  emptyMessage = "No hay datos disponibles"
}: DataTableProps<T>) {
  const handleSelectAll = (checked: boolean) => {
    if (!onSelectionChange) return
    
    if (checked) {
      onSelectionChange(new Set(data.map(item => item.id)))
    } else {
      onSelectionChange(new Set())
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    if (!onSelectionChange) return
    
    const newSelection = new Set(selectedItems)
    if (checked) {
      newSelection.add(itemId)
    } else {
      newSelection.delete(itemId)
    }
    onSelectionChange(newSelection)
  }

  const handleSort = (column: string) => {
    if (!onSort) return
    
    const newDirection = sortColumn === column && sortDirection === 'asc' ? 'desc' : 'asc'
    onSort(column, newDirection)
  }

  const renderCellValue = (column: Column<T>, item: T) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getValue = (obj: any, path: string | keyof T): unknown => {
      if (typeof path === 'string' && path.includes('.')) {
        return path.split('.').reduce((o, key) => o?.[key], obj)
      }
      return obj[path]
    }

    if (column.render) {
      const value = getValue(item, column.key)
      return column.render(value, item)
    }

    const value = getValue(item, column.key)

    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'default' : 'secondary'}>
          {value ? 'Activo' : 'Inactivo'}
        </Badge>
      )
    }

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>
    }

    return String(value)
  }

  const isAllSelected = data.length > 0 && selectedItems.size === data.length

  if (loading) {
    return (
      <div className="w-full">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {selectable && <TableHead className="w-[50px]"></TableHead>}
                {columns.map((column, index) => (
                  <TableHead key={index} className={column.className}>
                    {column.label}
                  </TableHead>
                ))}
                {actions.length > 0 && <TableHead className="w-[100px]">Acciones</TableHead>}
              </TableRow>
            </TableHeader>
          </Table>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-muted/50">
              {selectable && (
                <TableHead className="w-[50px]">
                  <Checkbox
                    checked={isAllSelected}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todo"
                  />
                </TableHead>
              )}
              {columns.map((column, index) => (
                <TableHead 
                  key={index} 
                  className={cn(column.className, column.sortable && "cursor-pointer select-none")}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(String(column.key))}
                >
                  <div className="flex items-center space-x-2">
                    <span>{column.label}</span>
                    {column.sortable && (
                      <div className="flex flex-col">
                        <ChevronUp 
                          className={cn(
                            "h-3 w-3",
                            sortColumn === column.key && sortDirection === 'asc' 
                              ? "text-primary" 
                              : "text-muted-foreground"
                          )}
                        />
                        <ChevronDown 
                          className={cn(
                            "h-3 w-3 -mt-1",
                            sortColumn === column.key && sortDirection === 'desc' 
                              ? "text-primary" 
                              : "text-muted-foreground"
                          )}
                        />
                      </div>
                    )}
                  </div>
                </TableHead>
              ))}
              {actions.length > 0 && (
                <TableHead className="w-[100px] text-right">Acciones</TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell 
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions.length > 0 ? 1 : 0)}
                  className="h-24 text-center text-muted-foreground"
                >
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item, index) => (
                <TableRow 
                  key={item.id} 
                  className={cn(
                    "hover:bg-muted/50 transition-colors",
                    selectedItems.has(item.id) && "bg-muted/30"
                  )}
                >
                  {selectable && (
                    <TableCell>
                      <Checkbox
                        checked={selectedItems.has(item.id)}
                        onCheckedChange={(checked) => handleSelectItem(item.id, checked as boolean)}
                        aria-label={`Seleccionar fila ${index + 1}`}
                      />
                    </TableCell>
                  )}
                  {columns.map((column, colIndex) => (
                    <TableCell key={colIndex} className={column.className}>
                      {renderCellValue(column, item)}
                    </TableCell>
                  ))}
                  {actions.length > 0 && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.map((action, actionIndex) => (
                            <DropdownMenuItem
                              key={actionIndex}
                              onClick={() => action.onClick(item)}
                              className={cn(
                                "flex items-center space-x-2",
                                action.variant === 'destructive' && "text-destructive focus:text-destructive"
                              )}
                            >
                              {action.icon}
                              <span>{action.label}</span>
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

// Componentes de acción predefinidos para consistencia
export const tableActions = {
  view: (onClick: () => void) => ({
    label: "Ver detalles",
    icon: <Eye className="h-4 w-4" />,
    onClick
  }),
  edit: (onClick: () => void) => ({
    label: "Editar",
    icon: <Edit className="h-4 w-4" />,
    onClick
  }),
  delete: (onClick: () => void) => ({
    label: "Eliminar",
    icon: <Trash2 className="h-4 w-4" />,
    onClick,
    variant: 'destructive' as const
  })
}

// Utilidades para formateo común
export const formatters = {
  date: (date: string | Date) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  },
  
  currency: (amount: number) => {
    if (amount === null || amount === undefined) return '-'
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN'
    }).format(amount)
  },
  
  status: (status: boolean, labels = { active: 'Activo', inactive: 'Inactivo' }) => (
    <Badge variant={status ? 'default' : 'secondary'}>
      {status ? labels.active : labels.inactive}
    </Badge>
  ),
  
  priority: (priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT') => {
    const variants = {
      LOW: { variant: 'secondary' as const, label: 'Baja' },
      MEDIUM: { variant: 'default' as const, label: 'Media' },
      HIGH: { variant: 'destructive' as const, label: 'Alta' },
      URGENT: { variant: 'destructive' as const, label: 'Urgente' }
    }
    const config = variants[priority] || variants.MEDIUM
    return <Badge variant={config.variant}>{config.label}</Badge>
  }
}