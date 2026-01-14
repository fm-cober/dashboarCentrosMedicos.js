import type { Turno } from "@/types/turno"

export function normalizeText(text: string): string {
  return text.toLowerCase().trim()
}

const INVALID_CENTRO_NAMES = [
  "copia de resumen",
  "resumen_per",
  "coberturas",
  "especialidades",
  "especialidades select",
  "estados",
]

export function isValidCentro(centro: string): boolean {
  const normalized = normalizeText(centro)
  return !INVALID_CENTRO_NAMES.includes(normalized) && centro.trim() !== ""
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>,
  )
}

export function countBy<T>(array: T[], key: keyof T): Record<string, number> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      result[groupKey] = (result[groupKey] || 0) + 1
      return result
    },
    {} as Record<string, number>,
  )
}

export function uniqueValues<T>(array: T[], key: keyof T): string[] {
  const values = array.map((item) => String(item[key]))
  let uniqueSet = Array.from(new Set(values)).sort()

  // Filter out invalid centro names if the key is "centro"
  if (key === "centro") {
    uniqueSet = uniqueSet.filter(isValidCentro)
  }

  return uniqueSet
}

export function formatDate(dateString: string | null): string {
  if (!dateString) return "—"
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })
  } catch {
    return dateString
  }
}

export function getEstadoColor(estado: string): string {
  const estadoLower = estado.toLowerCase()
  if (estadoLower.includes("asignado")) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
  if (estadoLower.includes("pendiente"))
    return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
  if (estadoLower.includes("cancelado")) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
}

export function groupByDay(turnos: Turno[]): Array<{ date: string; value: number }> {
  const grouped: Record<string, number> = {}

  turnos.forEach((turno) => {
    // Ignore records with null fecha_solicitud_iso
    if (turno.fecha_solicitud_iso) {
      // Extract YYYY-MM-DD format
      const date = turno.fecha_solicitud_iso.split("T")[0]
      grouped[date] = (grouped[date] || 0) + 1
    }
  })

  // Convert to array format and sort by date ascending
  return Object.entries(grouped)
    .map(([date, value]) => ({ date, value }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function groupCount<T>(
  array: T[],
  key: keyof T,
  filterFn?: (value: string) => boolean,
): Array<{ name: string; value: number }> {
  const counts = countBy(array, key)

  return Object.entries(counts)
    .filter(([name]) => !filterFn || filterFn(name))
    .map(([name, value]) => ({ name, value }))
}
