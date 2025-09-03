"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { scaleTime, scaleBand } from "@visx/scale"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Group } from "@visx/group"
import { Reorder } from "framer-motion"
import { useSchedule } from "@/hooks/use-train-data"
import { useMutation } from "@tanstack/react-query"
import api from "@/lib/api"
import { formatHM } from "@/lib/day"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Helper to process the schedule data into a format the Gantt chart can use
function processScheduleForGantt(schedule: any[]) {
  if (!schedule) return [];
  return schedule.map((t: any) => ({
    id: t.schedule_id,
    // Use the train_id from the nested train object for the display name
    name: t.train?.train_id || `Train ${t.train_id}`, 
    delayMinutes: t.delay_minutes,
    // Pass the full train details object to be used by the modal
    details: t.train, 
    // Create a visual segment from planned to optimized time
    segments: [
      {
        start: new Date(t.planned_time),
        end: new Date(t.optimized_time),
      },
    ],
  }));
}

// Helper to calculate the time domain for the chart's X-axis
function timeDomainFromProcessedData(data: any[]) {
  const starts: Date[] = [];
  const ends: Date[] = [];
  data?.forEach((t: any) => {
    t.segments?.forEach((s: any) => {
      starts.push(new Date(s.start));
      ends.push(new Date(s.end));
    });
  });

  if (starts.length === 0) {
    const now = new Date();
    return [now, new Date(now.getTime() + 2 * 60 * 60 * 1000)] as const;
  }

  const min = new Date(Math.min(...starts.map((d) => d.getTime())));
  const max = new Date(Math.max(...ends.map((d) => d.getTime())));
  return [min, max] as const;
}

export default function GanttPage() {
  const { data: schedule } = useSchedule();
  const processedData = useMemo(() => processScheduleForGantt(schedule), [schedule]);
  
  const [order, setOrder] = useState<string[]>([]);
  // State to manage the visibility and content of the train details modal
  const [selectedTrain, setSelectedTrain] = useState<any | null>(null);
  
  useEffect(() => {
    if (processedData.length > 0) {
      setOrder(processedData.map((t: any) => t.id));
    }
  }, [processedData]);

  const svgRef = useRef<SVGSVGElement | null>(null);

  const orderedTrains = useMemo(() => {
    const map = new Map((processedData || []).map((t: any) => [t.id, t]));
    return order.map((id) => map.get(id)).filter(Boolean);
  }, [processedData, order]);

  // Chart dimensions and scales
  const margin = { top: 20, right: 20, bottom: 40, left: 120 };
  const width = 1200;
  const rowHeight = 34;
  const height = (orderedTrains.length || 6) * rowHeight + margin.top + margin.bottom;

  const [minTime, maxTime] = timeDomainFromProcessedData(orderedTrains);
  const xScale = scaleTime({ domain: [minTime, maxTime], range: [margin.left, width - margin.right] });
  const yScale = scaleBand({
    domain: orderedTrains.map((t: any) => t.name),
    range: [margin.top, height - margin.bottom],
    padding: 0.2,
  });

  const overrideMutation = useMutation({
    mutationFn: async (newOrder: string[]) => api.post("/api/schedule/override", { order: newOrder }).then((r) => r.data),
  });

  function applyOverride() {
    if (!orderedTrains.length) return;
    overrideMutation.mutate(orderedTrains.map((t: any) => t.id));
  }

  return (
    <>
      <div className="mx-auto max-w-[1400px] space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Gantt — Train Schedule</h2>
          <div className="flex items-center gap-2">
            <button
              className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted/50"
              onClick={() => setOrder(processedData.map((t: any) => t.id))}
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
              tickLabelProps={() => ({ fill: "hsl(var(--muted-foreground))", fontSize: 12, textAnchor: 'end', dx: '-0.5em' })}
            />

            <Group>
              {orderedTrains.map((t: any) => {
                const y = yScale(t.name);
                if (y === undefined) return null;
                return (
                  <g key={t.id}>
                    {t.segments?.map((s: any, i: number) => {
                      const x1 = xScale(new Date(s.start));
                      const x2 = xScale(new Date(s.end));
                      const w = Math.max(2, x2 - x1);
                      const delayed = (t.delayMinutes || 0) > 0;
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
                      );
                    })}
                  </g>
                );
              })}
            </Group>
          </svg>

          <div className="mt-4 border-t border-border pt-3">
            <div className="mb-2 text-sm text-muted-foreground">Reorder Trains (vertical drag) - Click any train for details</div>
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
                  onClick={() => setSelectedTrain(t)}
                  className="flex cursor-grab items-center justify-between rounded-lg border border-border bg-muted/30 px-3 py-2 active:cursor-grabbing hover:bg-muted/50 transition-colors"
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
                    Delay: {t.delayMinutes || 0}m • Type: {t.details?.type || 'N/A'}
                  </div>
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </div>
        </div>
      </div>

      {/* Train Details Modal/Dialog */}
      <Dialog open={!!selectedTrain} onOpenChange={(isOpen) => !isOpen && setSelectedTrain(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Train Details: {selectedTrain?.details?.train_id}</DialogTitle>
            <DialogDescription>
              Detailed information for train {selectedTrain?.details?.train_id}.
            </DialogDescription>
          </DialogHeader>
          {selectedTrain?.details && (
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-4">
              <div className="font-semibold text-muted-foreground">Type</div>
              <div>{selectedTrain.details.type}</div>

              <div className="font-semibold text-muted-foreground">Priority</div>
              <div>{selectedTrain.details.priority}</div>

              <div className="font-semibold text-muted-foreground">Origin</div>
              <div>{selectedTrain.details.origin}</div>

              <div className="font-semibold text-muted-foreground">Destination</div>
              <div>{selectedTrain.details.destination}</div>

              <div className="font-semibold text-muted-foreground">Capacity</div>
              <div>{selectedTrain.details.capacity}</div>
              
              <div className="font-semibold text-muted-foreground">Platform Need</div>
              <div>{selectedTrain.details.platform_need}</div>

              <div className="font-semibold text-muted-foreground">Scheduled Arrival</div>
              <div>
                {(() => {
                  const val = selectedTrain.details.arrival_time;
                  if (!val) return "N/A";
                  const date = new Date(val);
                  return isNaN(date.getTime()) ? val : date.toLocaleString();
                })()}
              </div>

              <div className="font-semibold text-muted-foreground">Scheduled Departure</div>
              <div>
                {(() => {
                  const val = selectedTrain.details.departure_time;
                  if (!val) return "N/A";
                  const date = new Date(val);
                  return isNaN(date.getTime()) ? val : date.toLocaleString();
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
