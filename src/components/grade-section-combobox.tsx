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

interface GradeSection {
  id: string
  grade: { id: string, name: string }
  section: { id: string, name: string }
}

interface GradeSectionComboboxProps {
  items: GradeSection[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
}

export function GradeSectionCombobox({ items, value, onValueChange, placeholder = 'Seleccionar grado - sección' }: GradeSectionComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const selected = items.find(i => i.id === value)

  const filtered = items.filter(i => {
    if (!search) return true
    const q = search.toLowerCase()
    return i.grade.name.toLowerCase().includes(q) || i.section.name.toLowerCase().includes(q)
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 px-3 text-sm rounded-md"
        >
          {selected ? (
            <span className="truncate">{`${selected.grade.name} - Sección ${selected.section.name}`}</span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-2 max-h-72 overflow-hidden rounded-lg border shadow-lg bg-popover" align="start">
        <div className="px-1">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder="Buscar grado o sección..."
              className="h-10 px-3 rounded-md text-sm border"
              value={search}
              onValueChange={setSearch}
            />
            <CommandList className="mt-2">
              {filtered.length === 0 ? (
                <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No se encontraron combinaciones</CommandEmpty>
              ) : (
                <CommandGroup>
                  {filtered.map(gs => (
                    <CommandItem
                      key={gs.id}
                      value={gs.id}
                      onSelect={() => { onValueChange(gs.id === value ? '' : gs.id); setOpen(false) }}
                      className="flex items-center gap-3 p-3 rounded-md hover:bg-accent/10 focus:bg-accent/10"
                    >
                      <Check
                        className={cn("h-4 w-4 shrink-0 text-muted-foreground", value === gs.id ? "opacity-100" : "opacity-0")}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <span className="font-medium truncate text-sm">{gs.grade.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">{`Sección ${gs.section.name}`}</span>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </div>
      </PopoverContent>
    </Popover>
  )
}
