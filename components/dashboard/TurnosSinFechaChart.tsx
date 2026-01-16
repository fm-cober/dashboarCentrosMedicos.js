"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import type { Turno } from "@/types/turno"

interface Props {
  data: Turno[]
}

// ✅ detecta si un string parece una fecha real
function looksLikeDate(value: unknown) {
  if (value === null || value === undefined) return false

  // si ya viene como ISO en fecha_turno_iso
  const s = String(value).trim()
  if (!s) return false

  // ISO: 2026-02-20T00:00:00.000Z
  if (/^\d{4}-\d{2}-\d{2}t/i.test(s)) return true

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return true

  // DD/MM/YYYY o DD-MM-YYYY (acepta 1-2 dígitos)
  if (/^\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}$/.test(s)) return true

  return false
}

function hasFechaTurnoReal(t: any) {
  // preferimos iso si existe
  if (t.fecha_turno_iso) return looksLikeDate(t.fecha_turno_iso)

  // fallback a lo que venga
  const raw = t.fecha_turno ?? t.fechaTurno ?? t["Fecha turno"] ?? t["fecha turno"]
  return looksLikeDate(raw)
}

export function TurnosSinFechaChart({ data }: Props) {
  const chartData = useMemo(() => {
    const counts = new Map<string, number>()

    for (const t of data as any[]) {
      const centro = String(t.centro || "Sin centro").trim()
      const sinFecha = !hasFechaTurnoReal(t)

      if (!sinFecha) continue

      counts.set(centro, (counts.get(centro) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([centro, value]) => ({ centro, value }))
      .sort((a, b) => b.value - a.value)
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Turnos sin fecha (por centro)</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="centro" tick={{ fontSize: 12 }} interval={0} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#000" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
