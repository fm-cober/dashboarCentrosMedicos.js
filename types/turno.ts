export type Turno = {
  centro: string
  fecha_solicitud: string | null
  fecha_solicitud_iso: string | null
  estado: string
  especialidad: string
  fecha_turno: string | null
  fecha_turno_iso: string | null
  dni?: string
  cobertura?: string
}

export type ApiResponse = {
  ok: boolean
  count: number
  params: {
    from?: string
    to?: string
    centro?: string[]
    especialidad?: string[]
    estado?: string[]
  }
  data: Turno[]
}

export type FilterParams = {
  from?: string
  to?: string
  centro?: string[]
  especialidad?: string[]
  estado?: string[]
}
