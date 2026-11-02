<script setup lang="ts">
import { ref, reactive, onUnmounted } from 'vue'
import { Message, Lock, Key } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { sendEmailCode, resetPassword } from '@/api/system'

const emit = defineEmits(['success', 'switch-tab'])

const loading = ref(false)
const countdown = ref(0)
const resetFormRef = ref<FormInstance>()
let timer: NodeJS.Timeout | null = null

const resetForm = reactive({
  email: '',
  verificationCode: '',
  newPassword: '',
  repeatPassword: '',
})
const resetRules = reactive<FormRules>({
  email: [
    { required: true, message: 'Enter your email', trigger: 'blur' },
    { type: 'email', message: 'Enter a valid email address.', trigger: 'blur' },
  ],
  verificationCode: [
    { required: true, message: 'Enter verification code', trigger: 'blur' },
    {
      pattern: /^[0-9a-zA-Z]{6}$/,
      message: 'Verification code format: 6 characters (letters and numbers)',
      trigger: 'blur',
    },
  ],
  newPassword: [
    { required: true, message: 'Enter a new password', trigger: 'blur' },
    {
      pattern: /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z\W]{8,18}$/,
      message: 'Password format: 8-18 characters using at least two of: numbers, letters and symbols',
      trigger: 'blur',
    },
  ],
  repeatPassword: [
    { required: true, message: 'Confirm your password', trigger: 'blur' },
    {
      validator: (_rule: any, value: string, callback: Function) => {
        if (value !== resetForm.newPassword) {
          callback(new Error('Passwords do not match.'))
        } else {
          callback()
        }
      },
      trigger: 'blur',
    },
  ],
})
const handleSendCode = async () => {
  try {
    if (!resetForm.email) {
      ElMessage.warning('Enter your email first')
      return
    }
    const response = await sendEmailCode(resetForm.email)
    if (response.code === 0) {
      ElMessage.success('Verification code sent')
      countdown.value = 60
      timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          if (timer) {
            clearInterval(timer)
            timer = null
          }
        }
      }, 1000)
    } else {
      ElMessage.error(response.message)
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Could not send verification code')
  }
}
const handleReset = async () => {
  if (!resetFormRef.value) return
  await resetFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true
      try {
        const response = await resetPassword(resetForm)
        if (response.code === 0) {
          ElMessage.success('Password reset. Please sign in.')
          emit('switch-tab', 'login')
        } else {
          ElMessage.error(response.message)
        }
      } catch (error: any) {
        ElMessage.error(error.message || 'Could not reset password')
      } finally {
        loading.value = false
      }
    } else {
      console.log('Verification failed:', fields)
    }
  })
}

function switchToLogin() {
  emit('switch-tab', 'login')
}
onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>

<template>
  <div class="reset-container">
    <p class="form-subtitle">We will email you a code to reset your password.</p>

    <el-form ref="resetFormRef" :model="resetForm" :rules="resetRules" label-width="0" size="large"
      @keyup.enter="handleReset">
      <el-form-item prop="email">
        <el-input v-model="resetForm.email" placeholder="Email" :prefix-icon="Message">
          <template #append>
            <el-button :disabled="!!countdown || loading" @click="handleSendCode">
              {{ countdown ? `${countdown}s before retrying` : 'Send code' }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="verificationCode" class="mt-6">
        <el-input v-model="resetForm.verificationCode" placeholder="Verification code" :prefix-icon="Key" />
      </el-form-item>

      <el-form-item prop="newPassword" class="mt-6">
        <el-input v-model="resetForm.newPassword" type="password" placeholder="New password" :prefix-icon="Lock" show-password />
      </el-form-item>

      <el-form-item prop="repeatPassword" class="mt-6">
        <el-input v-model="resetForm.repeatPassword" type="password" placeholder="Confirm password" :prefix-icon="Lock"
          show-password />
      </el-form-item>

      <el-form-item class="mt-6">
        <el-button class="submit-btn" type="primary" :loading="loading" @click="handleReset">
          Reset password
        </el-button>
      </el-form-item>
    </el-form>

    <p class="login-text">
      Remember your password?
      <a href="#" @click.prevent="switchToLogin">Back to sign in</a>
    </p>
  </div>
</template>

<style scoped>
.reset-container {
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

.login-text {
  text-align: center;
  margin-top: 16px;
  color: #666;
}

.login-text a {
  color: #2a68fa;
  font-weight: 600;
  text-decoration: none;
}

.login-text a:hover {
  text-decoration: underline;
}
</style>
