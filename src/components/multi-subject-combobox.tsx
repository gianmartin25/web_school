"use client"

import * as React from "react"
import { Check, ChevronsUpDown, X } from "lucide-react"
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

interface MultiSubjectComboboxProps {
  subjects: Subject[]
  selectedIds: string[]
  onSelectionChange: (selectedIds: string[]) => void
  placeholder?: string
  emptyMessage?: string
}

export function MultiSubjectCombobox({
  subjects,
  selectedIds,
  onSelectionChange,
  placeholder = "Seleccionar materias...",
  emptyMessage = "No se encontraron materias."
}: MultiSubjectComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState("")

  const selectedSubjects = subjects.filter(s => selectedIds.includes(s.id))

  const filtered = subjects.filter(s => {
    if (!search) return true
    const q = search.toLowerCase()
    return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
  })

  const toggleSubject = (subjectId: string) => {
    if (selectedIds.includes(subjectId)) {
      onSelectionChange(selectedIds.filter(id => id !== subjectId))
    } else {
      onSelectionChange([...selectedIds, subjectId])
    }
  }

  const removeSubject = (subjectId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    onSelectionChange(selectedIds.filter(id => id !== subjectId))
  }

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between h-auto min-h-10 px-3 py-2 text-sm"
          >
            <div className="flex flex-wrap gap-1 flex-1 text-left">
              {selectedSubjects.length === 0 ? (
                <span className="text-muted-foreground font-normal">{placeholder}</span>
              ) : (
                selectedSubjects.map((subject) => (
                  <div
                    key={subject.id}
                    className="inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 bg-secondary text-secondary-foreground hover:bg-secondary/80"
                  >
                    <span>{subject.name}</span>
                    <span
                      onClick={(e) => removeSubject(subject.id, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          removeSubject(subject.id, e as unknown as React.MouseEvent)
                        }
                      }}
                      role="button"
                      tabIndex={0}
                      className="ml-1 ring-offset-background rounded-full outline-none hover:bg-secondary-foreground/10 focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer"
                      aria-label={`Remover ${subject.name}`}
                    >
                      <X className="h-3 w-3" />
                    </span>
                  </div>
                ))
              )}
            </div>
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
                  {filtered.map((subject) => {
                    const isSelected = selectedIds.includes(subject.id)
                    return (
                      <CommandItem
                        key={subject.id}
                        value={subject.id}
                        onSelect={() => toggleSubject(subject.id)}
                        className="flex items-center gap-2 p-2 cursor-pointer"
                      >
                        <div className={cn(
                          "h-4 w-4 shrink-0 border rounded-sm flex items-center justify-center",
                          isSelected ? "bg-primary border-primary" : "border-input"
                        )}>
                          {isSelected && <Check className="h-3 w-3 text-primary-foreground" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium truncate text-sm">{subject.name}</span>
                            <span className="text-xs bg-muted px-1.5 py-0.5 rounded text-muted-foreground shrink-0">
                              {subject.code}
                            </span>
                          </div>
                        </div>
                      </CommandItem>
                    )
                  })}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      {selectedSubjects.length > 0 && (
        <div className="text-xs text-muted-foreground">
          {selectedSubjects.length} {selectedSubjects.length === 1 ? 'materia seleccionada' : 'materias seleccionadas'}
        </div>
      )}
    </div>
  )
}
