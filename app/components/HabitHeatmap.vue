<script setup lang="ts">
const props = defineProps<{ cells: { date: string; ratio: number }[] }>()

function mondayIndex(dateStr: string): number {
  const g = new Date(dateStr + 'T00:00:00').getDay() // 0=Sun..6=Sat
  return (g + 6) % 7 // 0=Mon..6=Sun
}

type Cell = { date: string; ratio: number } | null

const weeks = computed<Cell[][]>(() => {
  const cells = props.cells
  if (!cells.length) return []
  const out: Cell[][] = []
  let col: Cell[] = new Array(mondayIndex(cells[0]!.date)).fill(null)
  for (const c of cells) {
    col.push(c)
    if (col.length === 7) {
      out.push(col)
      col = []
    }
  }
  if (col.length) {
    while (col.length < 7) col.push(null)
    out.push(col)
  }
  return out
})

function color(r: number | null): string {
  if (r == null) return 'transparent'
  if (r <= 0) return 'var(--track)'
  if (r < 0.34) return 'color-mix(in oklab, var(--accent) 34%, var(--track))'
  if (r < 0.67) return 'color-mix(in oklab, var(--accent) 58%, transparent)'
  if (r < 1) return 'color-mix(in oklab, var(--accent) 80%, transparent)'
  return 'var(--accent)'
}
</script>

<template>
  <div class="flex gap-1 overflow-x-auto pb-1">
    <div v-for="(w, wi) in weeks" :key="wi" class="flex flex-col gap-1">
      <div
        v-for="(c, di) in w"
        :key="di"
        class="cell"
        :style="{ background: color(c?.ratio ?? null) }"
        :title="c ? `${c.date} · ${Math.round(c.ratio * 100)}%` : ''"
      />
    </div>
  </div>
</template>

<style scoped>
.cell {
  width: 13px;
  height: 13px;
  border-radius: 4px;
}
</style>
