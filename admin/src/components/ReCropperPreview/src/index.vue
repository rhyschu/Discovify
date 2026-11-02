<script setup lang="tsx">
import { ref } from "vue";
import ReCropper from "@/components/ReCropper";
import { formatBytes } from "@pureadmin/utils";

defineOptions({
  name: "ReCropperPreview"
});

defineProps({
  imgSrc: String
});

const emit = defineEmits(["cropper"]);

const infos = ref();
const popoverRef = ref();
const refCropper = ref();
const showPopover = ref(false);
const cropperImg = ref<string>("");

function onCropper({ base64, blob, info }) {
  infos.value = info;
  cropperImg.value = base64;
  emit("cropper", { base64, blob, info });
}

function hidePopover() {
  popoverRef.value.hide();
}

defineExpose({ hidePopover });
</script>

<template>
  <div v-loading="!showPopover" element-loading-background="transparent">
    <el-popover
      ref="popoverRef"
      :visible="showPopover"
      placement="right"
      width="18vw"
    >
      <template #reference>
        <div class="w-[18vw]">
          <ReCropper
            ref="refCropper"
            :src="imgSrc"
            circled
            @cropper="onCropper"
            @readied="showPopover = true"
          />
          <p v-show="showPopover" class="mt-1 text-center">
            Right-click the crop area for more options.
          </p>
        </div>
      </template>
      <div class="flex flex-wrap justify-center items-center text-center">
        <el-image
          v-if="cropperImg"
          :src="cropperImg"
          :preview-src-list="Array.of(cropperImg)"
          fit="cover"
        />
        <div v-if="infos" class="mt-1">
          <p>
            Image dimensions: {{ parseInt(infos.width) }} ×
            {{ parseInt(infos.height) }} pixels
          </p>
          <p>
            File size: {{ formatBytes(infos.size) }}({{ infos.size }}  bytes)
          </p>
        </div>
      </div>
    </el-popover>
  </div>
</template>
