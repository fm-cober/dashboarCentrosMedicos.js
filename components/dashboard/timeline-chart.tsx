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

    // ✅ orden por fecha asc (clave para que "una" con linea bien)
    return [...grouped].sort((a, b) => {
      const ta = Date.parse(a.date)
      const tb = Date.parse(b.date)
      return ta - tb
    })
  }, [data])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Solicitudes en el tiempo</CardTitle>
      </CardHeader>

      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="date" tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <YAxis tick={{ fontSize: 12 }} className="text-muted-foreground" />
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--background))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
            />

            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--foreground))" // ✅ negro (según tema)
              strokeWidth={2}
              dot={false} // ✅ sin puntos
              activeDot={{ r: 4 }} // ✅ solo al hover
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
