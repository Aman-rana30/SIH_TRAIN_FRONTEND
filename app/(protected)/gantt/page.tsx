"use client"

import { useMemo, useRef, useState } from "react"
import { scaleTime, scaleBand } from "@visx/scale"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Group } from "@visx/group"
import { Reorder } from "framer-motion"
import { useSchedule } from "@/hooks/use-train-data"
import { useMutation } from "@tanstack/react-query"
import api from "@/lib/api"
import { formatHM } from "@/lib/day"

function timeDomainFromSchedule(schedule: any) {
  const starts: Date[] = []
  const ends: Date[] = []
  schedule?.trains?.forEach((t: any) => {
    t.segments?.forEach((s: any) => {
      starts.push(new Date(s.start))
      ends.push(new Date(s.end))
    })
  })
  const min = starts.length ? new Date(Math.min(...starts.map((d) => d.getTime()))) : new Date()
  const max = ends.length
    ? new Date(Math.max(...ends.map((d) => d.getTime())))
    : new Date(Date.now() + 2 * 60 * 60 * 1000)
  return [min, max] as const
}

export default function GanttPage() {
  const { data: schedule } = useSchedule()
  const initOrder = schedule?.trains?.map((t: any) => t.id) || []
  const [order, setOrder] = useState<string[]>(initOrder)
  const svgRef = useRef<SVGSVGElement | null>(null)

  const orderedTrains = useMemo(() => {
    const ids = order?.length ? order : initOrder
    const map = new Map((schedule?.trains || []).map((t: any) => [t.id, t]))
    return ids.map((id) => map.get(id)).filter(Boolean)
  }, [schedule, order, initOrder])

  const margin = { top: 20, right: 20, bottom: 40, left: 120 }
  const width = 1200
  const rowHeight = 34
  const height = (orderedTrains.length || 6) * rowHeight + margin.top + margin.bottom

  const [minTime, maxTime] = timeDomainFromSchedule(schedule)
  const xScale = scaleTime({ domain: [minTime, maxTime], range: [margin.left, width - margin.right] })
  const yScale = scaleBand({
    domain: orderedTrains.map((t: any) => t.name),
    range: [margin.top, height - margin.bottom],
    padding: 0.2,
  })

  const overrideMutation = useMutation({
    mutationFn: async (newOrder: string[]) => api.post("/api/override", { order: newOrder }).then((r) => r.data),
  })

  function applyOverride() {
    if (!orderedTrains.length) return
    overrideMutation.mutate(orderedTrains.map((t: any) => t.id))
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gantt — Train Schedule</h2>
        <div className="flex items-center gap-2">
          <button
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/50"
            onClick={() => setOrder(initOrder)}
          >
            Reset
          </button>
          <button
            className="rounded-md bg-[hsl(var(--chart-2))] px-3 py-1.5 text-sm font-medium text-primary-foreground hover:opacity-90"
            onClick={applyOverride}
          >
            Save Order
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-2 shadow-lg overflow-x-auto">
        <svg ref={svgRef} width={width} height={height} role="img" aria-label="Train Schedule Gantt">
          <AxisBottom
            top={height - margin.bottom}
            scale={xScale}
            tickFormat={(d: any) => formatHM(d)}
            stroke="hsl(var(--border))"
            tickStroke="hsl(var(--border))"
            tickLabelProps={() => ({ fill: "hsl(var(--muted-foreground))", fontSize: 12 })}
          />
          <AxisLeft
            left={margin.left}
            scale={yScale}
            stroke="hsl(var(--border))"
            tickStroke="hsl(var(--border))"
            tickLabelProps={() => ({ fill: "hsl(var(--muted-foreground))", fontSize: 12 })}
          />

          <Group>
            {orderedTrains.map((t: any) => {
              const y = yScale(t.name)!
              return (
                <g key={t.id}>
                  {t.segments?.map((s: any, i: number) => {
                    const x1 = xScale(new Date(s.start))
                    const x2 = xScale(new Date(s.end))
                    const w = Math.max(2, x2 - x1)
                    const delayed = (t.delayMinutes || 0) > 0
                    return (
                      <rect
                        key={i}
                        x={x1}
                        y={y}
                        width={w}
                        height={yScale.bandwidth()}
                        rx={6}
                        fill={delayed ? "#ef4444" : "hsl(var(--chart-2))"}
                        opacity={0.9}
                      />
                    )
                  })}
                </g>
              )
            })}
          </Group>
        </svg>

        <div className="mt-4 border-t border-border pt-3">
          <div className="mb-2 text-sm text-muted-foreground">Reorder Trains (vertical drag)</div>
          <Reorder.Group
            axis="y"
            values={orderedTrains}
            onReorder={(items) => setOrder(items.map((t: any) => t.id))}
            className="space-y-2"
          >
            {orderedTrains.map((t: any) => (
              <Reorder.Item
                key={t.id}
                value={t}
                className="flex cursor-grab items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 active:cursor-grabbing"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      (t.delayMinutes || 0) > 0 ? "bg-red-500" : "bg-[hsl(var(--chart-2))]"
                    }`}
                  />
                  <div className="font-medium">{t.name}</div>
                </div>
                <div className="text-sm text-muted-foreground">
                  Delay: {t.delayMinutes || 0}m • Segments: {t.segments?.length || 0}
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        </div>
      </div>
    </div>
  )
}
