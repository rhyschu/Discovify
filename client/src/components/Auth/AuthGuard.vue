<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { UserStore } from '@/stores/modules/user'
import { ElMessage } from 'element-plus'
import AuthTabs from './AuthTabs.vue'

const userStore = UserStore()
const router = useRouter()
const authVisible = ref(false)

onMounted(() => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('Please sign in')
    authVisible.value = true
    router.push(router.currentRoute.value.path)
  }
})
const handleLoginSuccess = () => {
  authVisible.value = false
}
</script>

<template>
  <slot v-if="userStore.isLoggedIn"></slot>
  <AuthTabs v-model="authVisible" @success="handleLoginSuccess" />
</template> 