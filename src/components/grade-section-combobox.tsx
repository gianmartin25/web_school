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
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between h-10 px-3 py-2 text-sm">
          {selected ? `${selected.grade.name} - Sección ${selected.section.name}` : <span className="text-muted-foreground">{placeholder}</span>}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput placeholder="Buscar grado o sección..." className="h-9" value={search} onValueChange={setSearch} />
          <CommandList>
            {filtered.length === 0 ? (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">No se encontraron combinaciones</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map(gs => (
                  <CommandItem key={gs.id} value={gs.id} onSelect={() => { onValueChange(gs.id === value ? '' : gs.id); setOpen(false) }} className="p-2">
                    <Check className={cn("h-4 w-4 shrink-0", value === gs.id ? "opacity-100" : "opacity-0")} />
                    <div className="ml-2">
                      <div className="font-medium">{gs.grade.name}</div>
                      <div className="text-xs text-muted-foreground">Sección {gs.section.name}</div>
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
