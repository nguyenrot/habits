<script setup lang="ts">
import { PhX } from '@phosphor-icons/vue'
import {
  blankHabit,
  toInput,
  COLOR_OPTIONS,
  WEEKDAYS,
  FREQUENCY_LABELS,
  gradientFor,
  type Frequency,
  type Habit,
  type HabitInput,
  type HabitType,
} from '~/lib/habit'
import { ICON_SLUGS } from '~/lib/icons'

const props = defineProps<{ open: boolean; habit?: Habit | null }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'saved', habit: Habit): void }>()
const api = useApi()

const form = ref<HabitInput>(blankHabit())
const error = ref('')
const loading = ref(false)
const tagDraft = ref('')

watch(
  () => props.open,
  (o) => {
    if (o) {
      form.value = props.habit ? toInput(props.habit) : blankHabit()
      error.value = ''
      tagDraft.value = ''
      loading.value = false
    }
  },
)

const types: { v: HabitType; label: string }[] = [
  { v: 'binary', label: 'Có / không' },
  { v: 'count', label: 'Định lượng' },
]
const freqs = Object.keys(FREQUENCY_LABELS) as Frequency[]

function toggleWeekday(i: number) {
  const s = new Set(form.value.weekdays)
  s.has(i) ? s.delete(i) : s.add(i)
  form.value.weekdays = [...s].sort((a, b) => a - b)
}
function addTag() {
  const t = tagDraft.value.trim().toLowerCase()
  if (t && !form.value.tags.includes(t)) form.value.tags.push(t)
  tagDraft.value = ''
}

function msgOf(e: unknown): string {
  const x = e as { data?: { message?: string }; statusMessage?: string }
  return x?.data?.message || x?.statusMessage || 'Lưu thất bại, thử lại.'
}

async function save() {
  error.value = ''
  const f = form.value
  if (!f.name.trim()) return (error.value = 'Nhập tên thói quen.')
  if (f.type === 'count' && (!f.target_count || f.target_count < 1))
    return (error.value = 'Đặt mục tiêu ≥ 1.')
  if (f.frequency === 'weekly_days' && !f.weekdays.length)
    return (error.value = 'Chọn ít nhất một thứ trong tuần.')
  if (f.frequency === 'weekly_count' && (!f.weekly_target || f.weekly_target < 1))
    return (error.value = 'Đặt số lần mỗi tuần.')
  if (f.reminder_enabled && !f.reminder_time) return (error.value = 'Đặt giờ nhắc.')

  loading.value = true
  try {
    const payload = { ...f, name: f.name.trim() }
    const saved = props.habit
      ? await api.updateHabit(props.habit.id, payload)
      : await api.createHabit(payload)
    emit('saved', saved)
  } catch (e) {
    error.value = msgOf(e)
    loading.value = false
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="sheet">
      <div v-if="open" class="overlay" @click.self="emit('close')">
        <div class="glass-strong sheet">
          <div class="flex items-center justify-between px-5 pt-5">
            <h2 class="text-[18px] font-semibold tracking-tight">
              {{ habit ? 'Sửa thói quen' : 'Thói quen mới' }}
            </h2>
            <button class="icon-btn tap" aria-label="Đóng" @click="emit('close')"><PhX :size="18" /></button>
          </div>

          <div class="body flex flex-col gap-5 px-5 py-5">
            <div>
              <label class="label" for="hn">Tên</label>
              <input id="hn" v-model="form.name" class="field" placeholder="VD: Uống nước" maxlength="120" />
            </div>

            <div>
              <span class="label">Biểu tượng</span>
              <div class="grid grid-cols-8 gap-2">
                <button
                  v-for="slug in ICON_SLUGS"
                  :key="slug"
                  class="icon-tile tap"
                  :class="{ sel: form.icon === slug }"
                  type="button"
                  @click="form.icon = slug"
                >
                  <HabitIcon :name="slug" :size="20" />
                </button>
              </div>
            </div>

            <div>
              <span class="label">Màu</span>
              <div class="flex flex-wrap gap-2.5">
                <button
                  v-for="c in COLOR_OPTIONS"
                  :key="c.key"
                  class="swatch tap"
                  :class="{ sel: form.color === c.key }"
                  type="button"
                  :style="{ background: gradientFor(c.key) }"
                  @click="form.color = c.key"
                />
              </div>
            </div>

            <div>
              <span class="label">Kiểu</span>
              <div class="seg">
                <button
                  v-for="t in types"
                  :key="t.v"
                  type="button"
                  class="tap"
                  :class="{ on: form.type === t.v }"
                  @click="form.type = t.v"
                >
                  {{ t.label }}
                </button>
              </div>
            </div>

            <div v-if="form.type === 'count'" class="grid grid-cols-2 gap-3">
              <div>
                <label class="label" for="tc">Mục tiêu</label>
                <input id="tc" v-model.number="form.target_count" type="number" min="1" class="field" placeholder="8" />
              </div>
              <div>
                <label class="label" for="un">Đơn vị</label>
                <input id="un" v-model="form.unit" class="field" placeholder="ly / phút / trang" maxlength="24" />
              </div>
            </div>

            <div>
              <span class="label">Tần suất</span>
              <div class="seg">
                <button
                  v-for="f in freqs"
                  :key="f"
                  type="button"
                  class="tap"
                  :class="{ on: form.frequency === f }"
                  @click="form.frequency = f"
                >
                  {{ FREQUENCY_LABELS[f] }}
                </button>
              </div>
            </div>

            <div v-if="form.frequency === 'weekly_days'" class="flex flex-wrap gap-2">
              <button
                v-for="d in WEEKDAYS"
                :key="d.i"
                type="button"
                class="wd tap"
                :class="{ on: form.weekdays.includes(d.i) }"
                @click="toggleWeekday(d.i)"
              >
                {{ d.short }}
              </button>
            </div>

            <div v-if="form.frequency === 'weekly_count'">
              <label class="label" for="wt">Số lần mỗi tuần</label>
              <input id="wt" v-model.number="form.weekly_target" type="number" min="1" max="7" class="field" placeholder="3" />
            </div>

            <div>
              <label class="label" for="cat">Danh mục <span class="t-ink-3">(tuỳ chọn)</span></label>
              <input id="cat" v-model="form.category" class="field" placeholder="Sức khoẻ / Học tập…" maxlength="40" />
            </div>

            <div>
              <span class="label">Thẻ <span class="t-ink-3">(tuỳ chọn)</span></span>
              <div class="flex flex-wrap items-center gap-2">
                <span v-for="t in form.tags" :key="t" class="chip-tag">
                  {{ t }}
                  <button type="button" @click="form.tags = form.tags.filter((x) => x !== t)">×</button>
                </span>
                <input
                  v-model="tagDraft"
                  class="field !h-9 !w-32"
                  placeholder="+ thẻ"
                  @keydown.enter.prevent="addTag"
                  @blur="addTag"
                />
              </div>
            </div>

            <label class="flex items-center justify-between">
              <span class="label !mb-0">Nhắc nhở</span>
              <span class="flex items-center gap-3">
                <input
                  v-if="form.reminder_enabled"
                  v-model="form.reminder_time"
                  type="time"
                  class="field !h-9 !w-28"
                />
                <input v-model="form.reminder_enabled" type="checkbox" class="switch" />
              </span>
            </label>

            <p v-if="error" class="text-[13px]" style="color: #f1607f">{{ error }}</p>
          </div>

          <div class="flex gap-3 px-5 pb-5">
            <button class="btn btn-soft flex-1" type="button" @click="emit('close')">Huỷ</button>
            <button class="btn btn-accent flex-1" type="button" :disabled="loading" @click="save">
              {{ loading ? 'Đang lưu…' : 'Lưu' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: grid;
  place-items: end center;
  padding: 0;
  background: rgba(8, 12, 10, 0.4);
  -webkit-backdrop-filter: blur(6px);
  backdrop-filter: blur(6px);
}
@media (min-width: 640px) {
  .overlay { place-items: center; padding: 24px; }
}
.sheet {
  width: 100%;
  max-width: 460px;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
@media (min-width: 640px) {
  .sheet { border-radius: var(--r-lg); }
}
.body { overflow-y: auto; }
.icon-tile {
  aspect-ratio: 1;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: var(--glass-bg-2);
  border: 1px solid var(--glass-border);
  color: var(--ink-2);
}
.icon-tile.sel {
  color: var(--on-accent);
  background: var(--accent);
  border-color: var(--accent);
}
.swatch {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid transparent;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.4);
}
.swatch.sel {
  border-color: var(--ink);
  outline: 2px solid var(--glass-border);
  outline-offset: 1px;
}
.seg {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 999px;
  background: var(--track);
}
.seg button {
  flex: 1;
  padding: 8px 6px;
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  color: var(--ink-2);
}
.seg button.on {
  background: var(--glass-bg-strong);
  color: var(--ink);
  box-shadow: var(--glass-shadow);
}
.wd {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  font-size: 13px;
  font-weight: 600;
  background: var(--glass-bg-2);
  border: 1px solid var(--glass-border);
  color: var(--ink-2);
}
.wd.on {
  background: var(--accent);
  color: var(--on-accent);
  border-color: var(--accent);
}
.chip-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 10px;
  border-radius: 999px;
  background: var(--glass-bg-2);
  border: 1px solid var(--glass-border);
  font-size: 13px;
}
.chip-tag button {
  color: var(--ink-3);
  font-size: 15px;
  line-height: 1;
}
.switch {
  appearance: none;
  width: 44px;
  height: 26px;
  border-radius: 999px;
  background: var(--track);
  position: relative;
  cursor: pointer;
  transition: background 0.2s;
}
.switch::after {
  content: '';
  position: absolute;
  top: 3px;
  left: 3px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s;
}
.switch:checked {
  background: var(--accent);
}
.switch:checked::after {
  transform: translateX(18px);
}
.sheet { animation: none; }
.sheet-enter-active,
.sheet-leave-active {
  transition: opacity 0.28s ease;
}
.sheet-enter-active .sheet,
.sheet-leave-active .sheet {
  transition: transform 0.32s cubic-bezier(0.16, 1, 0.3, 1);
}
.sheet-enter-from,
.sheet-leave-to {
  opacity: 0;
}
.sheet-enter-from .sheet,
.sheet-leave-to .sheet {
  transform: translateY(30px);
}
</style>
