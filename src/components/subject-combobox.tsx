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

interface Subject {
  id: string
  name: string
  code: string
}

interface SubjectComboboxProps {
  subjects: Subject[]
  value: string
  onValueChange: (value: string) => void
  placeholder?: string
  emptyMessage?: string
}

export function SubjectCombobox({
  subjects,
  value,
  onValueChange,
  placeholder = "Seleccionar materia...",
  emptyMessage = "No se encontraron materias."
}: SubjectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selected = subjects.find(s => s.id === value)

  const filtered = subjects.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
  })

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between h-10 px-3 py-2 text-sm"
        >
          {selected ? (
            <div className="flex items-center gap-2 truncate text-left">
              <span className="truncate font-normal">{selected.name}</span>
              <span className="text-xs text-muted-foreground">{selected.code}</span>
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
            placeholder="Buscar materia..."
            className="h-9"
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            {filtered.length === 0 ? (
              <CommandEmpty className="py-6 text-center text-sm text-muted-foreground">{emptyMessage}</CommandEmpty>
            ) : (
              <CommandGroup>
                {filtered.map((s) => (
                  <CommandItem
                    key={s.id}
                    value={s.id}
                    onSelect={() => {
                      onValueChange(s.id === value ? "" : s.id)
                      setOpen(false)
                    }}
                    className="flex items-center gap-2 p-2"
                  >
                    <Check className={cn("h-4 w-4 shrink-0", value === s.id ? "opacity-100" : "opacity-0")} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium truncate text-sm">{s.name}</span>
                        <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">{s.code}</span>
                      </div>
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
