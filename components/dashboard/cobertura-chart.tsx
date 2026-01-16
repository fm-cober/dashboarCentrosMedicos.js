"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts"
import type { Turno } from "@/types/turno"

function normalizeText(s: any) {
  return String(s || "")
    .trim()
    .toLowerCase()
}

export function CoberturaChart({ data }: { data: Turno[] }) {
  const chartData = useMemo(() => {
    const counts = new Map<string, number>()

    for (const t of data as any[]) {
      const raw = t.cobertura
      const cobertura = String(raw || "Sin cobertura").trim()

      // opcional: filtrar basura
      if (!cobertura) continue

      counts.set(cobertura, (counts.get(cobertura) ?? 0) + 1)
    }

    return Array.from(counts.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Top 10 coberturas</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={chartData} margin={{ left: 8, right: 8 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} interval={0} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="value" fill="#000" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
