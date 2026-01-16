"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import type { Turno } from "@/types/turno"
import { groupByDay } from "@/lib/helpers"

interface TimelineChartProps {
  data: Turno[]
}

export function TimelineChart({ data }: TimelineChartProps) {
  const chartData = useMemo(() => {
    const grouped = groupByDay(data)

    const normalized = grouped
      .map((d: any) => ({
        date: String(d.date),
        value: Number(d.value ?? 0), // ✅ asegura number
      }))
      .filter((d) => d.date && Number.isFinite(d.value)) // ✅ evita NaN

    // ✅ orden por fecha (clave)
    normalized.sort((a, b) => Date.parse(a.date) - Date.parse(b.date))

    return normalized
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Solicitudes en el tiempo</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
            <Tooltip />

            <Line
              type="step"
              dataKey="value"
              stroke="#000" // ✅ negro puro (visible)
              strokeWidth={3} // ✅ más gruesa
              dot={false}
              activeDot={{ r: 5 }}
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
