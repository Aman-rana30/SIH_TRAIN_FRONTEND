"use client"

import { useMemo, useRef, useState, useEffect } from "react"
import { scaleTime, scaleBand } from "@visx/scale"
import { AxisBottom, AxisLeft } from "@visx/axis"
import { Group } from "@visx/group"
import { Reorder } from "framer-motion"
import { useSchedule, useSections } from "@/hooks/use-train-data"
import { useMutation } from "@tanstack/react-query"
import api from "@/lib/api"
import { formatHM } from "@/lib/day"
import { cn } from "@/lib/utils"
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

  const BUFFER_MINUTES = 12; // green box duration after departure

  return schedule.map((t: any) => {
    const planned = new Date(t.planned_time);
    const optimized = new Date(t.optimized_time);
    const delayMinutes = Number(t.delay_minutes) || 0;

    const segments: Array<{ start: Date; end: Date; kind: "delay" | "buffer" }> = [];

    // Red delay segment: scheduled -> optimized (only if delayed)
    if (delayMinutes > 0 && optimized.getTime() > planned.getTime()) {
      segments.push({ start: planned, end: optimized, kind: "delay" });
    }

    // Green buffer segment: start at departure (optimized if delayed, else planned) and last 12 minutes
    const greenStart = delayMinutes > 0 ? optimized : planned;
    const greenEnd = new Date(greenStart.getTime() + BUFFER_MINUTES * 60 * 1000);
    segments.push({ start: greenStart, end: greenEnd, kind: "buffer" });

    return {
      id: t.schedule_id,
      // Use the train_id from the nested train object for the display name
      name: t.train?.train_id || `Train ${t.train_id}`,
      delayMinutes,
      // Pass the full train details object to be used by the modal
      details: t.train,
      // Our two-phase segments (delay + buffer)
      segments,
    };
  });
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
  const { data: sections } = useSections();
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

        <div className="rounded-2xl border border-border bg-card shadow-card overflow-hidden">
          {/* Chart Header */}
          <div className="border-b border-border bg-muted/30 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Schedule Timeline</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {orderedTrains.length} trains • Drag to reorder • Click for details
                </p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-chart-2" />
                  <span className="text-muted-foreground">On Time</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-destructive" />
                  <span className="text-muted-foreground">Delayed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded bg-warning" />
                  <span className="text-muted-foreground">Conflict</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Chart Container */}
          <div className="p-4 overflow-x-auto">
            <svg ref={svgRef} width={width} height={height} role="img" aria-label="Train Schedule Gantt" className="bg-background">
              {/* Grid lines */}
              <defs>
                <pattern id="grid" width="60" height="34" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 34" fill="none" stroke="hsl(var(--border))" strokeWidth="0.5" opacity="0.3"/>
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              
              {/* Time axis */}
              <AxisBottom
                top={height - margin.bottom}
                scale={xScale}
                tickFormat={(d: any) => formatHM(d)}
                stroke="hsl(var(--border))"
                tickStroke="hsl(var(--border))"
                tickLabelProps={() => ({ 
                  fill: "hsl(var(--muted-foreground))", 
                  fontSize: 11, 
                  fontWeight: 500,
                  textAnchor: 'middle'
                })}
              />
              
              {/* Train names axis */}
              <AxisLeft
                left={margin.left}
                scale={yScale}
                stroke="hsl(var(--border))"
                tickStroke="hsl(var(--border))"
                tickLabelProps={() => ({ 
                  fill: "hsl(var(--foreground))", 
                  fontSize: 12, 
                  fontWeight: 600,
                  textAnchor: 'end', 
                  dx: '-0.75em'
                })}
              />

              {/* Train schedule bars */}
              <Group>
                {orderedTrains.map((t: any, trainIndex: number) => {
                  const y = yScale(t.name);
                  if (y === undefined) return null;
                  const delayed = (t.delayMinutes || 0) > 0;
                  const hasConflict = false; // TODO: Add conflict detection logic
                  
                  return (
                    <g key={t.id}>
                      {/* Background row highlight on hover */}
                      <rect
                        x={margin.left}
                        y={y - 2}
                        width={width - margin.left - margin.right}
                        height={yScale.bandwidth() + 4}
                        fill="hsl(var(--muted))"
                        opacity="0"
                        className="hover:opacity-20 transition-opacity cursor-pointer"
                        onClick={() => setSelectedTrain(t)}
                      />
                      
                      {t.segments?.map((s: any, i: number) => {
                        const x1 = xScale(new Date(s.start));
                        const x2 = xScale(new Date(s.end));
                        const w = Math.max(4, x2 - x1);
                        const barHeight = yScale.bandwidth() - 4;
                        
                        return (
                          <g key={i}>
                            {/* Main schedule bar */}
                            <rect
                              x={x1}
                              y={y + 2}
                              width={w}
                              height={barHeight}
                              rx={8}
                              fill={hasConflict ? "hsl(var(--warning))" : (s.kind === "delay" ? "hsl(var(--destructive))" : "hsl(var(--chart-2))")}
                              stroke={s.kind === "delay" ? "hsl(var(--destructive))" : "hsl(var(--chart-2))"}
                              strokeWidth={1}
                              opacity={0.9}
                              className="hover:opacity-100 transition-all cursor-pointer drop-shadow-sm"
                              onClick={() => setSelectedTrain(t)}
                            />
                            
                            {/* Progress indicator for active trains */}
                            {trainIndex < 3 && (
                              <rect
                                x={x1}
                                y={y + 2}
                                width={w * 0.6} // 60% progress
                                height={barHeight}
                                rx={8}
                                fill={delayed ? "hsl(var(--destructive))" : "hsl(var(--success))"}
                                opacity={0.3}
                              />
                            )}
                            
                            {/* Delay indicator */}
                            {delayed && (
                              <circle
                                cx={x2 - 8}
                                cy={y + barHeight/2 + 2}
                                r={3}
                                fill="hsl(var(--destructive))"
                                className="animate-pulse-subtle"
                              />
                            )}
                            
                            {/* Train info on bar (if wide enough) */}
                            {w > 80 && (
                              <text
                                x={x1 + w/2}
                                y={y + barHeight/2 + 6}
                                textAnchor="middle"
                                fontSize={10}
                                fontWeight={600}
                                fill="white"
                                opacity={0.9}
                              >
                                {t.name.split(' ')[1] || t.name}
                              </text>
                            )}
                          </g>
                        );
                      })}
                    </g>
                  );
                })}
              </Group>
            </svg>
          </div>

          {/* Train List for Reordering */}
          <div className="border-t border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-semibold text-foreground">Train Priority Order</h4>
                <p className="text-xs text-muted-foreground">Drag to reorder • Click for details</p>
              </div>
              <div className="text-xs text-muted-foreground">
                {orderedTrains.filter(t => (t.delayMinutes || 0) > 0).length} delayed
              </div>
            </div>
            
            <Reorder.Group
              axis="y"
              values={orderedTrains}
              onReorder={(items) => setOrder(items.map((t: any) => t.id))}
              className="space-y-2 max-h-64 overflow-y-auto"
            >
              {orderedTrains.map((t: any, index: number) => {
                const delayed = (t.delayMinutes || 0) > 0;
                const isActive = index < 3; // First 3 are "active"
                
                return (
                  <Reorder.Item
                    key={t.id}
                    value={t}
                    onClick={() => setSelectedTrain(t)}
                    className={cn(
                      "group flex cursor-grab items-center justify-between rounded-xl border p-3 transition-all duration-200",
                      "hover:shadow-sm active:cursor-grabbing active:scale-[0.98]",
                      delayed 
                        ? "border-destructive/20 bg-destructive/5 hover:bg-destructive/10" 
                        : "border-border bg-card hover:bg-accent/50",
                      isActive && "ring-1 ring-primary/20"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      {/* Priority indicator */}
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold text-muted-foreground">
                        {index + 1}
                      </div>
                      
                      {/* Status indicator */}
                      <div className={cn(
                        "h-2 w-2 rounded-full",
                        delayed ? "bg-destructive animate-pulse-subtle" : "bg-success"
                      )} />
                      
                      {/* Train info */}
                      <div className="flex flex-col">
                        <div className="font-semibold text-sm text-foreground">{t.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {t.details?.type || 'Unknown'} • {t.details?.origin || 'N/A'} → {t.details?.destination || 'N/A'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3 text-right">
                      {/* Delay info */}
                      <div className="flex flex-col">
                        <div className={cn(
                          "text-sm font-semibold",
                          delayed ? "text-destructive" : "text-success"
                        )}>
                          {delayed ? `+${t.delayMinutes}m` : 'On Time'}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Priority: {t.details?.priority || 'Normal'}
                        </div>
                      </div>
                      
                      {/* Active indicator */}
                      {isActive && (
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                          <div className="h-2 w-2 rounded-full bg-primary animate-pulse-subtle" />
                        </div>
                      )}
                    </div>
                  </Reorder.Item>
                );
              })}
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

              {/* New calculated departure considering delay */}
              <div className="font-semibold text-muted-foreground">New Scheduled Departure</div>
              <div>
                {(() => {
                  const base = selectedTrain.details?.departure_time;
                  if (!base) return "N/A";
                  const baseDate = new Date(base);
                  if (isNaN(baseDate.getTime())) return "N/A";
                  const delay = Number(selectedTrain.delayMinutes || 0);
                  const newDate = new Date(baseDate.getTime() + delay * 60 * 1000);
                  const isDelayed = delay > 0;
                  return (
                    <span className={isDelayed ? "text-red-500 font-semibold" : "text-green-500 font-semibold"}>
                      {newDate.toLocaleString()}
                    </span>
                  );
                })()}
              </div>

              {/* Section clearing time computed from NEW departure + section travel time */}
              <div className="font-semibold text-muted-foreground">Section Clears At</div>
              <div>
                {(() => {
                  try {
                    const user = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem("rcd_user") || '{}') : {};
                    const sectionId: string | undefined = user?.sectionId;

                    const depRaw = selectedTrain.details?.departure_time;
                    if (!sectionId || !depRaw) return "N/A";
                    const depDate = new Date(depRaw);
                    if (isNaN(depDate.getTime())) return "N/A";

                    // add delay to departure first
                    const delay = Number(selectedTrain.delayMinutes || 0);
                    const effectiveDeparture = new Date(depDate.getTime() + delay * 60 * 1000);

                    // Lookup travel time for the controller’s section
                    const travel = (sections || []).find((s: any) => s.section_id === sectionId)?.calculated_travel_time_minutes;
                    if (!travel || isNaN(Number(travel))) return "N/A";

                    const clearDate = new Date(effectiveDeparture.getTime() + Number(travel) * 60 * 1000);
                    return <span className="text-green-500 font-semibold">{clearDate.toLocaleString()}</span>;
                  } catch (e) {
                    return "N/A";
                  }
                })()}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
