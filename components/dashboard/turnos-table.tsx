"use client"

import { useMemo, useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { Turno } from "@/types/turno"
import { formatDate, getEstadoColor } from "@/lib/helpers"
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"

interface TurnosTableProps {
  data: Turno[]
}

export function TurnosTable({ data }: TurnosTableProps) {
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 50

  const sortedData = useMemo(() => {
    return [...data].sort((a, b) => {
      const dateA = a.fecha_solicitud_iso || ""
      const dateB = b.fecha_solicitud_iso || ""
      return sortOrder === "asc" ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA)
    })
  }, [data, sortOrder])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return sortedData.slice(startIndex, startIndex + itemsPerPage)
  }, [sortedData, currentPage])

  const totalPages = Math.ceil(sortedData.length / itemsPerPage)

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
    setCurrentPage(1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Detalle de solicitudes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button variant="ghost" size="sm" onClick={toggleSort} className="-ml-3 h-8 text-xs">
                    Fecha solicitud
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Centro</TableHead>
                <TableHead>Especialidad</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha turno</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground">
                    No hay datos para mostrar
                  </TableCell>
                </TableRow>
              ) : (
                paginatedData.map((turno, index) => (
                  <TableRow key={index}>
                    <TableCell className="text-sm">{formatDate(turno.fecha_solicitud_iso)}</TableCell>
                    <TableCell className="text-sm">{turno.centro}</TableCell>
                    <TableCell className="text-sm">{turno.especialidad}</TableCell>
                    <TableCell>
                      <Badge className={getEstadoColor(turno.estado)} variant="secondary">
                        {turno.estado}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">{formatDate(turno.fecha_turno_iso)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Página {currentPage} de {totalPages} ({sortedData.length} registros)
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                Anterior
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
              >
                Siguiente
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
