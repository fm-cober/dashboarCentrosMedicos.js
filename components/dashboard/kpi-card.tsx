import { Card, CardContent } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

type Comparison = {
  /** Ej: +12.4 o -8.1 (en %) */
  percentChange: number
  /** Texto aclaratorio: "vs mes anterior" o "vs período anterior" */
  label?: string
}

interface KpiCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  description?: string
  comparison?: Comparison | null
}

export function KpiCard({ title, value, icon: Icon, description, comparison }: KpiCardProps) {
  const showComparison = comparison && Number.isFinite(comparison.percentChange)

  const isUp = showComparison ? comparison!.percentChange > 0 : false
  const isDown = showComparison ? comparison!.percentChange < 0 : false

  const cmpText = showComparison
    ? `${comparison!.percentChange > 0 ? "+" : ""}${comparison!.percentChange.toFixed(1)}%`
    : ""

  const cmpClass = isUp
    ? "text-emerald-600"
    : isDown
      ? "text-red-600"
      : "text-muted-foreground"

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>

            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-balance">{value}</p>

              {showComparison && (
                <div className={`flex items-center gap-1 text-sm font-medium ${cmpClass}`}>
                  {isUp && <ArrowUpRight className="h-4 w-4" />}
                  {isDown && <ArrowDownRight className="h-4 w-4" />}
                  <span>{cmpText}</span>
                  <span className="text-xs font-normal text-muted-foreground">
                    {comparison?.label ?? "vs mes anterior"}
                  </span>
                </div>
              )}
            </div>

            {description && <p className="text-xs text-muted-foreground">{description}</p>}
          </div>

          <div className="rounded-lg bg-primary/10 p-3">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
