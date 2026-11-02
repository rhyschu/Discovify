<script setup lang="ts">
import { ref, watch } from "vue";

const props = defineProps({
  songName: String,
  audioUrl: String,
  visible: Boolean
});
const emit = defineEmits(["update:visible"]);
const isVisible = ref(props.visible);

watch(
  () => props.visible,
  newVal => {
    isVisible.value = newVal;
  }
);
const closeDialog = () => {
  emit("update:visible", false);
};
</script>

<template>
  <el-dialog
    v-model="isVisible"
    title="Preview audio"
    width="600px"
    @close="closeDialog"
  >
    <div class="text-center">
      <span class="text-lg font-bold">{{ songName }}</span>
    </div>
    <el-divider />
    <audio v-if="audioUrl" :src="audioUrl" controls class="w-full" />
    <div v-else class="text-center">
      <span class="text-gray-500 font-bold">Upload an audio file first.</span>
    </div>
  </el-dialog>
</template>

<style scoped></style>
