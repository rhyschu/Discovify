<script setup lang="ts">
import { ref, reactive } from 'vue'
import { User, Message, Lock, Key } from '@element-plus/icons-vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { sendEmailCode, register } from '@/api/system'

const emit = defineEmits(['success', 'switch-tab'])

const loading = ref(false)
const countdown = ref(0)
const registerFormRef = ref<FormInstance>()

const registerForm = reactive({
  username: '',
  email: '',
  password: '',
  verificationCode: '',
})
const registerRules = reactive<FormRules>({
  username: [
    { required: true, message: 'Enter a username', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_-]{4,16}$/,
      message: 'Username format: 4-16 characters (letters, numbers, underscores or hyphens)',
      trigger: 'blur',
    },
  ],
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
  verificationCode: [
    { required: true, message: 'Enter verification code', trigger: 'blur' },
    {
      pattern: /^[0-9a-zA-Z]{6}$/,
      message: 'Verification code format: 6 characters (letters and numbers)',
      trigger: 'blur',
    },
  ],
})
const handleSendCode = async () => {
  try {
    if (!registerForm.email) {
      ElMessage.warning('Enter your email first')
      return
    }
    const response = await sendEmailCode(registerForm.email)
    if (response.code === 0) {
      ElMessage.success('Verification code sent')
      countdown.value = 60
      const timer = setInterval(() => {
        countdown.value--
        if (countdown.value <= 0) {
          clearInterval(timer)
        }
      }, 1000)
    } else {
      ElMessage.error(response.message)
    }
  } catch (error: any) {
    ElMessage.error(error.message || 'Could not send verification code')
  }
}
const handleRegister = async () => {
  if (!registerFormRef.value) return
  await registerFormRef.value.validate(async (valid, fields) => {
    if (valid) {
      loading.value = true
      try {
        const response = await register(registerForm)
        if (response.code === 0) {
          ElMessage.success('Account created. Please sign in.')
          emit('switch-tab', 'login')
        } else {
          ElMessage.error(response.message)
        }
      } catch (error: any) {
        ElMessage.error(error.message || 'Could not create account')
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
</script>

<template>
  <div class="register-container">
    <p class="form-subtitle">Create your account</p>

    <el-form ref="registerFormRef" :model="registerForm" :rules="registerRules" label-width="0" size="large"
      @keyup.enter="handleRegister">
      <el-form-item prop="username">
        <el-input v-model="registerForm.username" placeholder="Username" :prefix-icon="User" />
      </el-form-item>

      <el-form-item prop="email" class="mt-6">
        <el-input v-model="registerForm.email" placeholder="Email" :prefix-icon="Message">
          <template #append>
            <el-button :disabled="!!countdown || loading" @click="handleSendCode">
              {{ countdown ? `${countdown}s before retrying` : 'Send code' }}
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item prop="verificationCode" class="mt-6">
        <el-input v-model="registerForm.verificationCode" placeholder="Verification code" :prefix-icon="Key" />
      </el-form-item>

      <el-form-item prop="password" class="mt-6">
        <el-input v-model="registerForm.password" type="password" placeholder="Password" :prefix-icon="Lock" show-password />
      </el-form-item>

      <el-form-item class="mt-6">
        <el-button class="submit-btn" type="primary" :loading="loading" @click="handleRegister">
          Sign up
        </el-button>
      </el-form-item>
    </el-form>

    <p class="login-text">
      Already have an account?
      <a href="#" @click.prevent="switchToLogin">Sign in</a>
    </p>
  </div>
</template>

<style scoped>
.register-container {
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
