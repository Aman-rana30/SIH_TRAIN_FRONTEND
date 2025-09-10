"use client"

import { useMemo, useState, useRef, useEffect } from "react"
import { scaleTime, scaleBand } from "@visx/scale"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Group } from "@visx/group"
import { Reorder } from "framer-motion"
import dayjs from "./_dayjs-lite" // lightweight local helper below
import { useSchedule } from "../hooks/useTrainData"
import { useMutation } from "@tanstack/react-query"
import api from "../services/api"

// --- START FIX: Process schedule data correctly ---
function processScheduleForGantt(schedule) {
  if (!schedule) return [];

  const BUFFER_MINUTES = 12; // green box duration after departure

  return schedule.map((t) => {
    const planned = new Date(t.planned_time);
    const optimized = new Date(t.optimized_time);
    const delayMinutes = Number(t.delay_minutes) || 0;

    // If delayed, draw red delay [planned -> optimized], then green buffer [optimized -> optimized+12m]
    // If on time, draw only green buffer [planned -> planned+12m]
    const segments = [];

    if (delayMinutes > 0) {
      segments.push({ start: planned, end: optimized, kind: "delay" });
    }

    const greenStart = delayMinutes > 0 ? optimized : planned;
    const greenEnd = new Date(greenStart.getTime() + BUFFER_MINUTES * 60 * 1000);
    segments.push({ start: greenStart, end: greenEnd, kind: "buffer" });

    return {
      id: t.schedule_id,
      name: `Train ${t.train_id}`,
      delayMinutes,
      segments,
    };
  });
}
// --- END FIX ---

function timeDomainFromSchedule(schedule) {
  const starts = []
  const ends = []
  schedule?.forEach((t) => {
    t.segments?.forEach((s) => {
      starts.push(new Date(s.start))
      ends.push(new Date(s.end))
    })
  })
  const min = starts.length ? new Date(Math.min(...starts)) : new Date()
  const max = ends.length ? new Date(Math.max(...ends)) : new Date(Date.now() + 2 * 60 * 60 * 1000)
  return [min, max]
}

export default function GanttChartView() {
  const { data: schedule } = useSchedule()
  const processedData = useMemo(() => processScheduleForGantt(schedule), [schedule]);
  
  const [order, setOrder] = useState([]);

  useEffect(() => {
    if (processedData) {
      setOrder(processedData.map(t => t.id));
    }
  }, [processedData]);
  
  const svgRef = useRef(null)

  // sync order when schedule loads
  const orderedTrains = useMemo(() => {
    const map = new Map((processedData || []).map((t) => [t.id, t]))
    return order.map((id) => map.get(id)).filter(Boolean)
  }, [processedData, order])

  const margin = { top: 20, right: 20, bottom: 40, left: 120 }
  const width = 1200
  const rowHeight = 34
  const height = (orderedTrains.length || 6) * rowHeight + margin.top + margin.bottom

  const [minTime, maxTime] = timeDomainFromSchedule(orderedTrains)
  const xScale = scaleTime({ domain: [minTime, maxTime], range: [margin.left, width - margin.right] })
  const yScale = scaleBand({
    domain: orderedTrains.map((t) => t.name),
    range: [margin.top, height - margin.bottom],
    padding: 0.2,
  })

  const overrideMutation = useMutation({
    mutationFn: async (newOrder) => api.post("/api/override", { order: newOrder }).then((r) => r.data),
  })

  function applyOverride() {
    if (!orderedTrains.length) return
    overrideMutation.mutate(orderedTrains.map((t) => t.id))
  }

  return (
    <div className="mx-auto max-w-[1400px] space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Gantt — Train Schedule</h2>
        <div className="flex items-center gap-2">
          <button className="btn btn-secondary" onClick={() => setOrder(processedData.map(t => t.id) || [])}>
            Reset
          </button>
          <button className="btn btn-primary" onClick={applyOverride}>
            Save Order
          </button>
        </div>
      </div>

      <div className="card overflow-x-auto p-2">
        <svg ref={svgRef} width={width} height={height} role="img" aria-label="Train Schedule Gantt">
          <AxisBottom
            top={height - margin.bottom}
            scale={xScale}
            tickFormat={(d) => dayjs(d).format("HH:mm")}
            stroke="#334155"
            tickStroke="#334155"
            tickLabelProps={() => ({ fill: "#94a3b8", fontSize: 12 })}
          />
          <AxisLeft
            left={margin.left}
            scale={yScale}
            stroke="#334155"
            tickStroke="#334155"
            tickLabelProps={() => ({ fill: "#94a3b8", fontSize: 12 })}
          />

          <Group>
            {orderedTrains.map((t) => {
              const y = yScale(t.name)
              if (y == null) return null
              return (
                <g key={t.id}>
                  {t.segments?.map((s, i) => {
                    const x1 = xScale(new Date(s.start))
                    const x2 = xScale(new Date(s.end))
                    const w = Math.max(2, x2 - x1)
                    const fill = s.kind === "delay" ? "#dc2626" : "#22c55e"; // red for delay, green for buffer
                    return (
                      <rect
                        key={i}
                        x={x1}
                        y={y}
                        width={w}
                        height={yScale.bandwidth()}
                        rx={6}
                        fill={fill}
                        opacity={0.9}
                      />
                    )
                  })}
                </g>
              )
            })}
          </Group>
        </svg>

        <div className="mt-4 border-t border-slate-800 pt-3">
          <div className="mb-2 text-sm text-slate-300">Reorder Trains (vertical drag)</div>
          <Reorder.Group
            axis="y"
            values={orderedTrains}
            onReorder={(items) => setOrder(items.map((t) => t.id))}
            className="space-y-2"
          >
            {orderedTrains.map((t) => (
              <Reorder.Item
                key={t.id}
                value={t}
                className="flex cursor-grab items-center justify-between rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 active:cursor-grabbing"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${(t.delayMinutes || 0) > 0 ? "bg-red-500" : "bg-brand"}`} />
                  <div className="font-medium">{t.name}</div>
                </div>
                <div className="text-sm text-slate-300">
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

// lightweight dayjs-like formatting helper (avoid extra deps)
export function formatHM(d) {
  const dt = new Date(d)
  return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`
}
