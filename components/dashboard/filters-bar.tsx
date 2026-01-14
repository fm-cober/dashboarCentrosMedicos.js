"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import type { FilterParams } from "@/types/turno"
import { Calendar, X } from "lucide-react"
import { MultiSelect } from "@/components/dashboard/multi-select"
import { DateRangePicker } from "@/components/dashboard/date-range-picker"

interface FiltersBarProps {
  centros: string[]
  especialidades: string[]
  estados: string[]
  onApplyFilters: (filters: FilterParams) => void
  onClearFilters: () => void
}

export function FiltersBar({ centros, especialidades, estados, onApplyFilters, onClearFilters }: FiltersBarProps) {
  const [selectedCentros, setSelectedCentros] = useState<string[]>([])
  const [selectedEspecialidades, setSelectedEspecialidades] = useState<string[]>([])
  const [selectedEstados, setSelectedEstados] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({})

  const handleApply = () => {
    onApplyFilters({
      from: dateRange.from,
      to: dateRange.to,
      centro: selectedCentros.length > 0 ? selectedCentros : undefined,
      especialidad: selectedEspecialidades.length > 0 ? selectedEspecialidades : undefined,
      estado: selectedEstados.length > 0 ? selectedEstados : undefined,
    })
  }

  const handleClear = () => {
    setSelectedCentros([])
    setSelectedEspecialidades([])
    setSelectedEstados([])
    setDateRange({})
    onClearFilters()
  }

  return (
    <div className="space-y-4 rounded-lg border bg-card p-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Filtros</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DateRangePicker value={dateRange} onChange={setDateRange} />

        <MultiSelect label="Centro" options={centros} selected={selectedCentros} onChange={setSelectedCentros} />

        <MultiSelect
          label="Especialidad"
          options={especialidades}
          selected={selectedEspecialidades}
          onChange={setSelectedEspecialidades}
        />

        <MultiSelect label="Estado" options={estados} selected={selectedEstados} onChange={setSelectedEstados} />
      </div>

      <div className="flex gap-2">
        <Button onClick={handleApply} size="sm">
          Aplicar filtros
        </Button>
        <Button onClick={handleClear} variant="outline" size="sm">
          <X className="mr-2 h-4 w-4" />
          Limpiar
        </Button>
      </div>
    </div>
  )
}
