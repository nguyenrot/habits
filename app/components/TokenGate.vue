<script setup lang="ts">
import { PhCheckCircle, PhArrowRight, PhShieldCheck, PhWarning } from '@phosphor-icons/vue'
import { ApiError } from '~/composables/useApi'

const api = useApi()
const { setToken } = useToken()

const TOKEN_LEN = 10
const TOKEN_RE = /^[A-Za-z0-9]{10}$/

type Mode = 'choose' | 'create' | 'login'
const mode = ref<Mode>('choose')
const input = ref('')
const error = ref('')
const busy = ref(false)

function go(m: Mode) {
  mode.value = m
  input.value = ''
  error.value = ''
}
const valid = computed(() => TOKEN_RE.test(input.value))
const remaining = computed(() => Math.max(0, TOKEN_LEN - input.value.length))
const slots = computed(() => Array.from({ length: TOKEN_LEN }, (_, i) => input.value[i] ?? ''))

async function create() {
  if (!valid.value) {
    error.value = `Token cần đúng ${TOKEN_LEN} ký tự, chỉ chữ và số.`
    return
  }
  busy.value = true
  error.value = ''
  try {
    await api.createAccount(input.value)
    setToken(input.value)
  } catch (e) {
    error.value =
      e instanceof ApiError && e.status === 409
        ? 'Token này đã có người dùng. Chọn token khác.'
        : (e as Error).message || 'Không tạo được tài khoản.'
  } finally {
    busy.value = false
  }
}

async function login() {
  if (!valid.value) {
    error.value = `Token cần đúng ${TOKEN_LEN} ký tự, chỉ chữ và số.`
    return
  }
  busy.value = true
  error.value = ''
  try {
    setToken(input.value)
    await api.me()
  } catch (e) {
    setToken(null)
    error.value =
      e instanceof ApiError && e.status === 401
        ? 'Token không tồn tại. Nhập lại hoặc tạo mới.'
        : (e as Error).message || 'Không xác thực được token.'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="grid min-h-[100dvh] place-items-center px-4">
    <div class="fixed right-4 top-4">
      <ThemeToggle />
    </div>

    <div class="glass-strong w-full max-w-[400px] p-7 stack-in">
      <div class="mb-6 flex items-center gap-3">
        <span
          class="grid h-11 w-11 place-items-center rounded-[14px] text-white"
          style="background: linear-gradient(150deg, var(--accent), #0fb6a6); box-shadow: inset 0 1px 0 rgba(255,255,255,.5)"
        >
          <PhCheckCircle :size="26" weight="fill" />
        </span>
        <div>
          <p class="text-[18px] font-semibold tracking-tight">Habits</p>
          <p class="t-ink-3 text-[13px]">Xây thói quen mỗi ngày</p>
        </div>
      </div>

      <!-- choose -->
      <div v-if="mode === 'choose'" class="flex flex-col gap-3">
        <button class="btn btn-accent w-full" @click="go('create')">
          Tạo token mới <PhArrowRight :size="16" weight="bold" />
        </button>
        <button class="btn btn-soft w-full" @click="go('login')">Đã có token, đăng nhập</button>
        <p class="t-ink-3 mt-2 flex items-center justify-center gap-1.5 text-center text-[12.5px]">
          <PhShieldCheck :size="14" /> Dùng chung 1 token với Ledger — server chỉ giữ hash.
        </p>
      </div>

      <!-- create / login share the input UI -->
      <form v-else class="flex flex-col gap-4" @submit.prevent="mode === 'create' ? create() : login()">
        <div>
          <div class="mb-2 flex items-baseline justify-between">
            <label class="label !mb-0">{{ mode === 'create' ? 'Chọn token mới' : 'Nhập token' }}</label>
            <span class="t-ink-3 mono text-[12px]">{{ input.length }}/{{ TOKEN_LEN }}</span>
          </div>
          <input
            v-model="input"
            class="field mono text-[17px] uppercase tracking-[0.18em]"
            spellcheck="false"
            autocomplete="off"
            autocapitalize="off"
            :maxlength="TOKEN_LEN"
            placeholder="NguyenA123"
          />
          <div class="mt-2.5 grid grid-cols-10 gap-1">
            <div
              v-for="(c, i) in slots"
              :key="i"
              class="h-1 rounded-full transition-colors"
              :style="{ background: c ? 'var(--accent)' : 'var(--track)' }"
            />
          </div>
          <p class="mt-2 text-[12px]" :class="valid ? 'text-accent' : 't-ink-3'">
            {{ valid ? 'Hợp lệ' : remaining > 0 ? `còn ${remaining} ký tự` : 'chỉ A–Z, a–z, 0–9' }}
          </p>
        </div>

        <div v-if="mode === 'create'" class="flex gap-2.5 rounded-[14px] p-3" style="background: var(--track)">
          <PhWarning :size="16" weight="fill" style="color: #e0a45e; flex: none; margin-top: 1px" />
          <p class="t-ink-2 text-[12.5px] leading-relaxed">
            Token là toàn bộ tài khoản — không reset được. Ghi lại nơi an toàn.
          </p>
        </div>

        <p v-if="error" class="text-[13px]" style="color: #f1607f">{{ error }}</p>

        <div class="flex gap-2">
          <button type="button" class="btn btn-soft flex-1" :disabled="busy" @click="go('choose')">Quay lại</button>
          <button type="submit" class="btn btn-accent flex-1" :disabled="busy || !valid">
            {{ busy ? 'Đang xử lý…' : mode === 'create' ? 'Tạo & vào' : 'Vào app' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
