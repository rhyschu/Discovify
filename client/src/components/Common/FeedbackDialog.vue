<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'
import { ElMessage } from 'element-plus'
import { addFeedback } from '@/api/system'

const dialogVisible = ref(false)
const loading = ref(false)
const formRef = ref<FormInstance>()

const formData = reactive({
  content: ''
})

const rules = reactive<FormRules>({
  content: [
    { required: true, message: 'Enter your feedback', trigger: 'blur' },
    { min: 10, message: 'Feedback must contain at least  10  characters', trigger: 'blur' },
    { max: 200, message: 'Feedback cannot exceed  200  characters', trigger: 'blur' },
  ]
})
const openDialog = () => {
  formData.content = '' // Clear input
  formRef.value?.resetFields()
  dialogVisible.value = true
}
const closeDialog = () => {
  dialogVisible.value = false
}
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (valid) {
      loading.value = true
      try {
        const res = await addFeedback({ content: formData.content })
        if (res.code === 0) {
          ElMessage.success('Thank you. Your feedback has been submitted.')
          closeDialog()
        } else {
          ElMessage.error(res.message || 'Could not submit. Please try again.')
        }
      } catch (error: any) {
        console.error('Feedback submission error:', error)
        ElMessage.error(error.message || 'Could not submit feedback')
      } finally {
        loading.value = false
      }
    }
  })
}
defineExpose({ openDialog })

</script>

<template>
  <el-dialog v-model="dialogVisible" title="Feedback" width="500px" :close-on-click-modal="false" @close="closeDialog">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="0px">
      <el-form-item prop="content">
        <el-input v-model="formData.content" type="textarea" :rows="7" placeholder="Share your feedback (10-200 characters)"
          maxlength="200" show-word-limit />
      </el-form-item>
    </el-form>
    <template #footer>
      <span class="dialog-footer">
        <el-button class="cancel-btn mr-3" @click="closeDialog">Cancel</el-button>
        <el-button class="submit-btn" type="primary" :loading="loading" @click="handleSubmit">
          Send feedback
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped>
.dialog-footer {
  text-align: right;
}

.cancel-btn {
  width: 15%;
  border-radius: 8px;
  height: 33px;
  font-size: 14px;
}

.submit-btn {
  width: 20%;
  border-radius: 8px;
  height: 33px;
  font-size: 14px;
}

:deep(.el-textarea__inner) {
  margin-top: 6px;
  border-radius: 8px;
  resize: none;
}
</style>