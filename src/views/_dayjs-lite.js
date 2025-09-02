export default function dayjs(d) {
  const date = new Date(d)
  return {
    format(fmt) {
      if (fmt === "HH:mm") {
        const h = String(date.getHours()).padStart(2, "0")
        const m = String(date.getMinutes()).padStart(2, "0")
        return `${h}:${m}`
      }
      return date.toISOString()
    },
  }
}
