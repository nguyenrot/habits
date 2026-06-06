<script setup lang="ts">
import { PhCheckCircle } from '@phosphor-icons/vue'

const api = useApi()
const mode = ref<'login' | 'register'>('login')
const username = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')

function msgOf(e: unknown): string {
  const x = e as { data?: { message?: string; statusMessage?: string }; statusMessage?: string }
  return x?.data?.message || x?.data?.statusMessage || x?.statusMessage || 'Có lỗi, thử lại.'
}

async function submit() {
  error.value = ''
  const u = username.value.trim().toLowerCase()
  const p = password.value
  if (!u || !p) {
    error.value = 'Nhập đủ tài khoản và mật khẩu.'
    return
  }
  if (mode.value === 'register') {
    if (u.length < 3) return (error.value = 'Tài khoản cần ít nhất 3 ký tự.')
    if (p.length < 6) return (error.value = 'Mật khẩu cần ít nhất 6 ký tự.')
    if (!/^[a-z0-9_]+$/.test(u)) return (error.value = 'Tài khoản chỉ gồm chữ thường, số, gạch dưới.')
  }
  loading.value = true
  try {
    if (mode.value === 'login') await api.login({ username: u, password: p })
    else await api.register({ username: u, password: p })
    window.location.assign('/')
  } catch (e) {
    error.value = msgOf(e)
    loading.value = false
  }
}
</script>

<template>
  <div class="glass-strong w-full max-w-[380px] p-7 stack-in">
    <div class="mb-6 flex items-center gap-3">
      <span
        class="grid h-10 w-10 place-items-center rounded-[13px] text-white"
        style="background: linear-gradient(150deg, var(--accent), #0fb6a6); box-shadow: inset 0 1px 0 rgba(255,255,255,.5)"
      >
        <PhCheckCircle :size="24" weight="fill" />
      </span>
      <div>
        <p class="text-[18px] font-semibold tracking-tight">Habits</p>
        <p class="t-ink-3 text-[13px]">Xây thói quen mỗi ngày</p>
      </div>
    </div>

    <form class="flex flex-col gap-4" @submit.prevent="submit">
      <div>
        <label class="label" for="u">Tài khoản</label>
        <input id="u" v-model="username" class="field" autocomplete="username" placeholder="tên đăng nhập" />
      </div>
      <div>
        <label class="label" for="p">Mật khẩu</label>
        <input
          id="p"
          v-model="password"
          type="password"
          class="field"
          :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
          placeholder="••••••"
        />
      </div>

      <p v-if="error" class="text-[13px]" style="color: #f1607f">{{ error }}</p>

      <button type="submit" class="btn btn-accent mt-1" :disabled="loading">
        {{ loading ? 'Đang xử lý…' : mode === 'login' ? 'Đăng nhập' : 'Tạo tài khoản' }}
      </button>
    </form>

    <p class="t-ink-2 mt-5 text-center text-[13px]">
      {{ mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?' }}
      <button
        class="text-accent font-semibold"
        @click="mode = mode === 'login' ? 'register' : 'login'; error = ''"
      >
        {{ mode === 'login' ? 'Đăng ký' : 'Đăng nhập' }}
      </button>
    </p>
  </div>
</template>
