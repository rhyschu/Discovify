<script setup lang="ts">
import { catalogLabel } from "@/utils/catalogLabels";
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    formTitle: "Add",
    playlistId: 0,
    title: "",
    style: "",
    introduction: ""
  })
});

const styleOptions = ["Afrobeats", "Classical", "Country", "Easy Listening", "Electronic", "Hip-hop", "Pop", "Punk", "R&B", "Rock", "Soundtrack", "Traditional"];

const ruleFormRef = ref();
const newFormInline = ref(props.formInline);

function getRef() {
  return ruleFormRef.value;
}

defineExpose({ getRef });
</script>

<template>
  <el-form
    ref="ruleFormRef"
    :model="newFormInline"
    :rules="formRules"
    label-width="82px"
  >
    <el-row :gutter="30">
      <re-col
        v-if="newFormInline.formTitle === 'Edit'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="Playlist ID" prop="playlistId">
          <el-input
            v-model="newFormInline.playlistId"
            disabled
            placeholder="newFormInline.playlistId"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Playlist" prop="title" required>
          <el-input
            v-model="newFormInline.title"
            clearable
            placeholder="Enter playlist title"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Genre">
          <el-select
            v-model="newFormInline.style"
            placeholder="Select genres"
            class="w-full"
            clearable
          >
            <el-option
              v-for="(item, index) in styleOptions"
              :key="index"
              :label="catalogLabel(item)"
              :value="item"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="Bio">
          <el-input
            v-model="newFormInline.introduction"
            placeholder="Add a bio"
            type="textarea"
            line-number
            :autosize="{ minRows: 4, maxRows: 10 }"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
