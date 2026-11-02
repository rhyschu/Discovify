<script setup lang="ts">
import { ref, reactive } from 'vue'
import { Message, Lock } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { UserStore } from '@/stores/modules/user'

const emit = defineEmits(['success', 'switch-tab'])
const userStore = UserStore()

const loading = ref(false)
const loginFormRef = ref<FormInstance>()

const loginForm = reactive({
  email: '',
  password: '',
})
const loginRules = reactive<FormRules>({
  email: [
    { required: true, message: 'Enter your email', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email address.', trigger: 'blur' },
  ],
  password: [
    { required: true, message: 'Enter your password', trigger: 'blur' },
    {
      pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z\W]{8,18}$/,
      message: 'Password format: 8-18 characters using at least two of: numbers, letters and symbols',
      trigger: 'blur',
    },
  ],
})
const handleLogin = async () => {
  if (!loginFormRef.value) return
  await loginFormRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const result = await userStore.userLogin(loginForm)
        if (result.success) {
          ElMessage.success(result.message)
          emit('success')
        } else {
          ElMessage.error(result.message)
        }
      } catch (error: any) {
        ElMessage.error(error.message || 'Sign-in failed')
      } finally {
        loading.value = false
      }
    }
  })
}

function switchToRegister() {
  emit('switch-tab', 'register')
}

function switchToReset() {
  emit('switch-tab', 'reset')
}
</script>

<template>
  <div class="login-container">
    <p class="form-subtitle">Sign in with your email</p>

    <el-form ref="loginFormRef" :model="loginForm" :rules="loginRules" label-width="0" size="large"
      @keyup.enter="handleLogin">
      <el-form-item prop="email">
        <el-input v-model="loginForm.email" placeholder="Email" :prefix-icon="Message" />
      </el-form-item>

      <el-form-item prop="password" class="mt-6">
        <el-input v-model="loginForm.password" type="password" placeholder="Password" :prefix-icon="Lock" show-password />
      </el-form-item>

      <div class="forgot-password">
        <a href="#" @click.prevent="switchToReset">Forgot password?</a>
      </div>

      <el-form-item class="mt-6">
        <el-button class="submit-btn" type="primary" :loading="loading" @click="handleLogin">
          Sign in
        </el-button>
      </el-form-item>
    </el-form>

    <p class="signup-text">
      New here?
      <a href="#" @click.prevent="switchToRegister">Sign up</a>
    </p>
  </div>
</template>

<style scoped>
.login-container {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  padding: 20px;
}

.form-subtitle {
  color: #666;
  margin-bottom: 24px;
  font-size: 14px;
}

:deep(.el-form-item) {
  margin-bottom: 20px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

.submit-btn {
  width: 100%;
  border-radius: 8px;
  height: 40px;
  font-size: 16px;
}

.signup-text {
  text-align: center;
  margin-top: 16px;
  color: #666;
}

.signup-text a {
  color: #2a68fa;
  font-weight: 600;
  text-decoration: none;
}

.signup-text a:hover {
  text-decoration: underline;
}

.forgot-password {
  text-align: right;
  margin: -10px 0 10px;
}

.forgot-password a {
  color: #666;
  font-size: 14px;
  text-decoration: none;
}

.forgot-password a:hover {
  color: #2a68fa;
  text-decoration: underline;
}
</style>
