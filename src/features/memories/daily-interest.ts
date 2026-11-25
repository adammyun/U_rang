/** Day boundaries are fixed to the service's Korean exhibition timezone. */
export function memoryDay(now = Date.now()) {
  return new Date(now + 9 * 60 * 60 * 1000).toISOString().slice(0, 10);
}
export function memoryDayBounds(now = Date.now()) {
  const day = memoryDay(now);
  const start = Date.parse(day + 'T00:00:00+09:00');
  return { day, start: new Date(start).toISOString(), end: new Date(start + 86400000).toISOString() };
}
export type DailyInterest = { day: string; score: number };
type Candidate = { id: string; visibility: string; dailyInterest?: DailyInterest };
const hash = (text: string) => {
  let value = 2166136261;
  for (let i = 0; i < text.length; i++) value = Math.imul(value ^ text.charCodeAt(i), 16777619);
  return value >>> 0;
};
/** No scores or identities appear on markers. A no-activity choice is discovery,
 * not a fabricated popularity result. Stable ties avoid jumping on refetch. */
export function dailyMemoryTrace(memories: Candidate[], day: string, allowDiscovery = true) {
  let winner: Candidate | undefined, bestScore = -1, bestOrder = -1;
  for (const memory of memories) {
    if (memory.visibility !== 'public') continue;
    const score = memory.dailyInterest?.day === day ? Math.max(0, memory.dailyInterest.score) : 0;
    if (!allowDiscovery && !score) continue;
    const order = hash(day + ':' + memory.id);
    if (score > bestScore || (score === bestScore && order > bestOrder)) {
      winner = memory; bestScore = score; bestOrder = order;
    }
  }
  return winner?.id ?? null;
}
