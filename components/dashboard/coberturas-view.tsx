"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Loader2, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"

const API_BASE =
  "https://script.google.com/macros/s/AKfycbzUJc2K-LlehWWPYi9qZyRE-C7sGXN0o_67ZIQwBh8xI4DYHrQyKL_ab8XW60-g-TL08g/exec"

type RowObj = Record<string, any>

function toStr(v: any) {
  if (v === null || v === undefined) return ""
  if (typeof v === "string") return v
  if (typeof v === "number" || typeof v === "boolean") return String(v)
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

function pickColumns(rows: RowObj[]) {
  const first = rows?.[0]
  if (!first) return []
  return Object.keys(first)
}

export function CoberturasView() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<RowObj[]>([])
  const [query, setQuery] = useState("")
  const [page, setPage] = useState(1)
  const pageSize = 25

  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError(null)
      try {
        const res = await fetch(`${API_BASE}?view=coberturas`, { cache: "no-store" })
        const json = await res.json()
        if (!json.ok) throw new Error(json.error || "Error al cargar coberturas")
        setRows(Array.isArray(json.data) ? json.data : [])
      } catch (e: any) {
        setError(e?.message || "Error desconocido")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [])

  const columns = useMemo(() => pickColumns(rows), [rows])

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return rows
    return rows.filter((r) =>
      columns.some((c) => toStr(r[c]).toLowerCase().includes(q))
    )
  }, [rows, query, columns])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    const copy = [...filtered]
    copy.sort((a, b) => {
      const av = toStr(a[sortKey]).toLowerCase()
      const bv = toStr(b[sortKey]).toLowerCase()
      if (av < bv) return sortDir === "asc" ? -1 : 1
      if (av > bv) return sortDir === "asc" ? 1 : -1
      return 0
    })
    return copy
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))

  const pageRows = useMemo(() => {
    const p = Math.min(Math.max(page, 1), totalPages)
    const start = (p - 1) * pageSize
    return sorted.slice(start, start + pageSize)
  }, [sorted, page, totalPages])

  useEffect(() => {
    setPage(1)
  }, [query])

  const toggleSort = (col: string) => {
    if (sortKey !== col) {
      setSortKey(col)
      setSortDir("asc")
      return
    }
    setSortDir((d) => (d === "asc" ? "desc" : "asc"))
  }

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Coberturas</CardTitle>
          <div className="text-xs text-muted-foreground">
            {loading ? "Cargando..." : `${filtered.length.toLocaleString()} registros`}
          </div>
        </div>

        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar..."
          className="max-w-md"
        />
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : error ? (
          <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
            <p className="text-destructive text-sm">{error}</p>
          </div>
        ) : rows.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay datos en IMPORT_coberturas.</p>
        ) : (
          <>
            <div className="overflow-auto rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns.map((c) => (
                      <TableHead key={c} className="whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 px-2"
                          onClick={() => toggleSort(c)}
                        >
                          {c}
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        </Button>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {pageRows.map((r, idx) => (
                    <TableRow key={idx}>
                      {columns.map((c) => (
                        <TableCell key={c} className="align-top whitespace-nowrap">
                          {toStr(r[c])}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                Página {page} de {totalPages}
              </div>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Anterior
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                >
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
