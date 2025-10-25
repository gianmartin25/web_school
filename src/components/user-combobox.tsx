"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
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

interface UserComboboxProps {
  users: User[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
  disabled?: boolean
}

export function UserCombobox({
  users,
  value,
  onValueChange,
  placeholder = "Seleccionar usuario...",
  emptyMessage = "No se encontraron usuarios.",
  disabled = false
}: UserComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selectedUser = users.find(user => user.id === value)

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'TEACHER': return 'Profesor/a'
      case 'PARENT': return 'Padre/Madre'
      case 'ADMIN': return 'Administrador'
      case 'STUDENT': return 'Estudiante'
      default: return role
    }
  }

  // Filtrar usuarios basándose en la búsqueda
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

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 px-3 py-2 text-sm"
          disabled={disabled}
        >
          {selectedUser ? (
            <div className="flex items-center gap-2 truncate text-left">
              <span className="truncate font-normal">{selectedUser.name}</span>
              <span className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                {getRoleLabel(selectedUser.role)}
              </span>
            </div>
          ) : (
            <span className="text-muted-foreground font-normal">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-80 overflow-auto" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Buscar usuario..." 
            className="h-9" 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filteredUsers.length === 0 ? (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">
                {emptyMessage}
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {filteredUsers.map((user) => (
                  <CommandItem
                    key={user.id}
                    value={user.id}
                    onSelect={() => {
                      onValueChange(user.id === value ? "" : user.id)
                      setOpen(false)
                    }}
                    className="flex items-center gap-2 p-2"
                  >
                    <Check
                      className={cn(
                        "h-4 w-4 shrink-0",
                        value === user.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate text-sm">{user.name}</span>
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                          {getRoleLabel(user.role)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground truncate block">
                        {user.email}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}