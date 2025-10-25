"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface MultiUserComboboxProps {
  users: User[]
  values: string[]
  onValuesChange: (values: string[]) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
  maxSelections?: number
}

export function MultiUserCombobox({
  users,
  values,
  onValuesChange,
  placeholder = "Seleccionar destinatarios...",
  emptyMessage = "No se encontraron usuarios.",
  disabled = false,
  maxSelections = 10
}: MultiUserComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selectedUsers = users.filter(user => values.includes(user.id))

  const getRoleLabel = (role: string) => {
    const roleLabels: { [key: string]: string } = {
      'ADMIN': 'Administrador',
      'TEACHER': 'Profesor',
      'PARENT': 'Padre/Madre',
      'STUDENT': 'Estudiante'
    }
    return roleLabels[role] || role
  }

  // Función para filtrar usuarios basado en la búsqueda
  const filteredUsers = users.filter(user => {
    if (!search) return true;
    const searchLower = search.toLowerCase();
    // Permitir búsqueda por nombre, apellido, nombre completo, email y rol
    const nameParts = user.name ? user.name.toLowerCase().split(' ') : [];
    return (
      nameParts.some(part => part.includes(searchLower)) ||
      (user.name && user.name.toLowerCase().includes(searchLower)) ||
      user.email.toLowerCase().includes(searchLower) ||
      getRoleLabel(user.role).toLowerCase().includes(searchLower)
    );
  });

  const handleSelect = (userId: string) => {
    if (values.includes(userId)) {
      // Remover si ya está seleccionado
      onValuesChange(values.filter(id => id !== userId))
    } else {
      // Agregar si no está seleccionado y no se ha alcanzado el máximo
      if (values.length < maxSelections) {
        onValuesChange([...values, userId])
      }
    }
  }

  const removeUser = (userId: string) => {
    onValuesChange(values.filter(id => id !== userId))
  }

  return (
    <div className="space-y-2">
      {/* Mostrar usuarios seleccionados como badges */}
      {selectedUsers.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedUsers.map(user => (
            <Badge
              key={user.id}
              variant="secondary"
              className="flex items-center gap-1 pr-1"
            >
              <span className="text-xs">
                {user.name} ({getRoleLabel(user.role)})
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto p-0.5 hover:bg-red-100"
                onClick={() => removeUser(user.id)}
                disabled={disabled}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          ))}
        </div>
      )}
      
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            disabled={disabled}
          >
            <span className="truncate">
              {selectedUsers.length === 0
                ? placeholder
                : `${selectedUsers.length} usuario${selectedUsers.length !== 1 ? 's' : ''} seleccionado${selectedUsers.length !== 1 ? 's' : ''}`
              }
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar por nombre, email o rol..."
              value={search}
              onValueChange={setSearch}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => handleSelect(user.id)}
                    className="cursor-pointer"
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        values.includes(user.id) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{user.name}</span>
                        <Badge variant="outline" className="ml-2 text-xs">
                          {getRoleLabel(user.role)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {/* Información adicional */}
      <div className="text-xs text-gray-500">
        {values.length}/{maxSelections} destinatarios seleccionados
      </div>
    </div>
  )
}