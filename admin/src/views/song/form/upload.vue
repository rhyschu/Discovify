<script setup lang="ts">
import { ref, defineProps, defineEmits, watch } from "vue";
import { updateSongAudio } from "@/api/system";
import { message } from "@/utils/message";
import UploadIcon from "@iconify-icons/ri/upload-2-line";

const props = defineProps({ songId: Number, visible: Boolean });
const emit = defineEmits(["update:visible", "success"]);

const fileList = ref([]);
const isVisible = ref(props.visible);
const audioUrl = ref("");
const duration = ref("");

watch(
  () => props.visible,
  newVal => {
    isVisible.value = newVal;
  }
);

const handleChange = file => {
  if (!file.raw.name.endsWith(".mp3")) {
    message("Allowed uploads: .mp3 audio files", { type: "warning" });
    fileList.value = [];
    return;
  }
  fileList.value = [file.raw];
  if (audioUrl.value) {
    URL.revokeObjectURL(audioUrl.value);
  }
  audioUrl.value = URL.createObjectURL(file.raw);
  duration.value = "";
};

const handleLoadedMetadata = (event: Event) => {
  const audioElement = event.target as HTMLAudioElement;
  const seconds = audioElement.duration;

  if (Number.isFinite(seconds)) {
    duration.value = seconds.toFixed(2);
  } else {
    duration.value = "";
    message("Could not read audio duration.", { type: "warning" });
  }
};

const submitForm = async () => {
  if (!fileList.value.length) {
    message("Choose an audio file first.", { type: "warning" });
    return;
  }

  if (!duration.value) {
    message("Reading audio duration. Please wait before submitting.", { type: "warning" });
    return;
  }

  const formData = new FormData();
  formData.append("audio", fileList.value[0]);
  formData.append("duration", duration.value);

  try {
    const res = await updateSongAudio(props.songId, formData);
    if (res.code === 0) {
      message("Upload complete", { type: "success" });
      emit("update:visible", false);
      emit("success");
    } else {
      message("Upload failed", { type: "error" });
    }
  } catch (error) {
    console.error("Upload failed:", error);
    message("Upload failed. Please try again.", { type: "error" });
  }
};
</script>

<template>
  <el-dialog
    v-model="isVisible"
    title="Upload audio"
    @close="emit('update:visible', false)"
  >
    <el-upload
      :file-list="fileList"
      :auto-upload="false"
      :limit="1"
      action="#"
      drag
      accept=".mp3"
      @change="handleChange"
    >
      <div class="el-upload__text">
        <IconifyIconOffline :icon="UploadIcon" width="26" class="m-auto mb-2" />
        Click or drag a file to upload (Supported formats: .mp3Format)
      </div>
    </el-upload>
    <audio
      v-if="audioUrl"
      :src="audioUrl"
      controls
      class="mt-3"
      @loadedmetadata="handleLoadedMetadata"
    />
    <template #footer>
      <el-button @click="emit('update:visible', false)">Cancel</el-button>
      <el-button type="primary" @click="submitForm">Submit</el-button>
    </template>
  </el-dialog>
</template>

<style scoped></style>
