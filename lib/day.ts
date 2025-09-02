export function formatHM(d: Date | string | number) {
  const dt = new Date(d)
  const h = String(dt.getHours()).padStart(2, "0")
  const m = String(dt.getMinutes()).padStart(2, "0")
  return `${h}:${m}`
}
