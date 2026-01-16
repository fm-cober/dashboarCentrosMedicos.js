"use client"

import { useEffect, useState, useMemo } from "react"
import type { ApiResponse, FilterParams, Turno } from "@/types/turno"
import { FiltersBar } from "@/components/dashboard/filters-bar"
import { KpiCard } from "@/components/dashboard/kpi-card"
import { EstadoChart } from "@/components/dashboard/estado-chart"
import { TimelineChart } from "@/components/dashboard/timeline-chart"
import { CentroChart } from "@/components/dashboard/centro-chart"
import { EspecialidadChart } from "@/components/dashboard/especialidad-chart"
import { CoberturaChart } from "@/components/dashboard/cobertura-chart"
import { TurnosTable } from "@/components/dashboard/turnos-table"
import { uniqueValues } from "@/lib/helpers"
import { FileText, CheckCircle, TrendingUp, Stethoscope, Loader2 } from "lucide-react"

const API_URL =
  "https://script.google.com/macros/s/AKfycbzhiojoUmJ4rmkDkDLyMPOxZ21J8vfVXFHF9BEi1y8k2gIOqn_Ci8PyxFMtbLFDI-1IZg/exec"

function shiftMonth(ymd: string, deltaMonths: number) {
  // ymd: YYYY-MM-DD
  const [y, m, d] = ymd.split("-").map(Number)
  const date = new Date(y, m - 1 + deltaMonths, d)

  const yy = date.getFullYear()
  const mm = String(date.getMonth() + 1).padStart(2, "0")
  const dd = String(date.getDate()).padStart(2, "0")
  return `${yy}-${mm}-${dd}`
}

function percentChange(curr: number, prev: number) {
  if (!Number.isFinite(curr) || !Number.isFinite(prev)) return null
  if (prev === 0) return null // evitamos infinito; no mostramos comparación
  return ((curr - prev) / prev) * 100
}

export default function DashboardPage() {
  const [data, setData] = useState<Turno[]>([])
  const [prevData, setPrevData] = useState<Turno[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterParams>({})

  const buildUrl = (filterParams: FilterParams = {}) => {
    const params = new URLSearchParams()

    if (filterParams.from) params.set("from", filterParams.from)
    if (filterParams.to) params.set("to", filterParams.to)

    // ✅ Backend espera CSV (no repetir query params)
    if (filterParams.centro?.length) params.set("centro", filterParams.centro.join(","))
    if (filterParams.especialidad?.length) params.set("especialidad", filterParams.especialidad.join(","))
    if (filterParams.estado?.length) params.set("estado", filterParams.estado.join(","))

    return params.toString() ? `${API_URL}?${params.toString()}` : API_URL
  }

  const fetchData = async (filterParams: FilterParams = {}) => {
    setLoading(true)
    setError(null)

    try {
      // 1) período actual
      const url = buildUrl(filterParams)
      const response = await fetch(url)

      if (!response.ok) throw new Error("Error al cargar los datos")

      const result: ApiResponse = await response.json()
      if (!result.ok) throw new Error("La respuesta del servidor no fue exitosa")

      setData(result.data)

      // 2) período anterior (mismo rango -1 mes) SOLO si hay from + to
      if (filterParams.from && filterParams.to) {
        const prevFilters: FilterParams = {
          ...filterParams,
          from: shiftMonth(filterParams.from, -1),
          to: shiftMonth(filterParams.to, -1),
        }

        const prevUrl = buildUrl(prevFilters)
        const prevResp = await fetch(prevUrl)
        if (!prevResp.ok) throw new Error("Error al cargar datos del mes anterior")

        const prevResult: ApiResponse = await prevResp.json()
        if (!prevResult.ok) throw new Error("La respuesta del mes anterior no fue exitosa")

        setPrevData(prevResult.data)
      } else {
        setPrevData(null)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido")
      setPrevData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  const allData = useMemo(() => data, [data])

  // Opciones de filtros (se recalculan sobre data actual)
  const centros = useMemo(() => uniqueValues(allData, "centro"), [allData])
  const especialidades = useMemo(() => uniqueValues(allData, "especialidad"), [allData])
  const estados = useMemo(() => uniqueValues(allData, "estado"), [allData])

  const kpis = useMemo(() => {
    // actuales
    const totalSolicitudes = data.length
    const turnosConfirmados = data.filter((t) => (t.estado || "").toLowerCase().includes("asignado")).length
    const tasaConversionNum = totalSolicitudes > 0 ? (turnosConfirmados / totalSolicitudes) * 100 : 0
    const especialidadesActivas = uniqueValues(data, "especialidad").length

    // prev si corresponde
    const hasComparison = !!(filters.from && filters.to && prevData)

    const prevTotal = prevData ? prevData.length : 0
    const prevConfirmados = prevData
      ? prevData.filter((t) => (t.estado || "").toLowerCase().includes("asignado")).length
      : 0
    const prevConversionNum = prevTotal > 0 ? (prevConfirmados / prevTotal) * 100 : 0
    const prevEspActivas = prevData ? uniqueValues(prevData, "especialidad").length : 0

    return {
      totalSolicitudes,
      turnosConfirmados,
      tasaConversion: tasaConversionNum.toFixed(1), // para mostrar
      tasaConversionNum, // para comparar
      especialidadesActivas,
      hasComparison,
      comparisons: {
        totalSolicitudes: hasComparison ? percentChange(totalSolicitudes, prevTotal) : null,
        turnosConfirmados: hasComparison ? percentChange(turnosConfirmados, prevConfirmados) : null,
        tasaConversion: hasComparison ? percentChange(tasaConversionNum, prevConversionNum) : null,
        especialidadesActivas: hasComparison ? percentChange(especialidadesActivas, prevEspActivas) : null,
      },
    }
  }, [data, prevData, filters.from, filters.to])

  const handleApplyFilters = (newFilters: FilterParams) => {
    setFilters(newFilters)
    fetchData(newFilters)
  }

  const handleClearFilters = () => {
    setFilters({})
    fetchData()
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center p-8">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-6 text-center">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto space-y-6 p-6 lg:p-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            Gestión de <span className="text-primary">Centros Médicos</span>
          </h1>
          <p className="text-muted-foreground">Gestión y análisis de solicitudes de turnos médicos</p>
        </div>

        <FiltersBar
          centros={centros}
          especialidades={especialidades}
          estados={estados}
          onApplyFilters={handleApplyFilters}
          onClearFilters={handleClearFilters}
        />

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                title="Total de solicitudes"
                value={kpis.totalSolicitudes.toLocaleString()}
                icon={FileText}
                comparison={
                  kpis.hasComparison && kpis.comparisons.totalSolicitudes !== null
                    ? { percentChange: kpis.comparisons.totalSolicitudes, label: "vs mes anterior" }
                    : null
                }
              />

              <KpiCard
                title="Turnos confirmados"
                value={kpis.turnosConfirmados.toLocaleString()}
                icon={CheckCircle}
                comparison={
                  kpis.hasComparison && kpis.comparisons.turnosConfirmados !== null
                    ? { percentChange: kpis.comparisons.turnosConfirmados, label: "vs mes anterior" }
                    : null
                }
              />

              <KpiCard
                title="Tasa de conversión"
                value={`${kpis.tasaConversion}%`}
                icon={TrendingUp}
                comparison={
                  kpis.hasComparison && kpis.comparisons.tasaConversion !== null
                    ? { percentChange: kpis.comparisons.tasaConversion, label: "vs mes anterior" }
                    : null
                }
              />

              <KpiCard
                title="Especialidades activas"
                value={kpis.especialidadesActivas}
                icon={Stethoscope}
              />
            </div>

              {/* Charts */}
              <div className="grid gap-4 lg:grid-cols-2">
                <CentroChart data={data} />
                <EstadoChart data={data} />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <CoberturaChart data={data} />
                <EspecialidadChart data={data} />
              </div>

              {/* ✅ Full width: Timeline */}
              <div className="grid gap-4">
                <TimelineChart data={data} />
              </div>

              {/* Tabla */}
              <TurnosTable data={data} />

          </>
        )}
      </div>
    </div>
  )
}
