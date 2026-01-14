"use client"

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DateRangePickerProps {
  value: { from?: string; to?: string }
  onChange: (value: { from?: string; to?: string }) => void
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-medium">Rango de fechas</Label>
      <div className="flex gap-2">
        <Input
          type="date"
          value={value.from || ""}
          onChange={(e) => onChange({ ...value, from: e.target.value || undefined })}
          placeholder="Desde"
          className="text-sm"
        />
        <Input
          type="date"
          value={value.to || ""}
          onChange={(e) => onChange({ ...value, to: e.target.value || undefined })}
          placeholder="Hasta"
          className="text-sm"
        />
      </div>
    </div>
  )
}
