<script setup lang="ts">
import { catalogLabel } from "@/utils/catalogLabels";
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "Add",
    artistId: null,
    artistName: "",
    songId: null,
    songName: "",
    album: "",
    style: [],
    releaseTime: null
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
      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Artist ID" prop="artistId">
          <el-input
            v-model="newFormInline.artistId"
            clearable
            disabled
            placeholder="newFormInline.artistId"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-if="newFormInline.title === 'Edit'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="Artist" prop="artistName">
          <el-input
            v-model="newFormInline.artistName"
            clearable
            disabled
            placeholder="newFormInline.artistName"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-if="newFormInline.title === 'Edit'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="Song ID" prop="songId">
          <el-input
            v-model="newFormInline.songId"
            clearable
            disabled
            placeholder="newFormInline.songId"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Song title" prop="songName" required>
          <el-input
            v-model="newFormInline.songName"
            clearable
            placeholder="Enter song title"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Album" prop="album" required>
          <el-input
            v-model="newFormInline.album"
            clearable
            placeholder="Enter album title"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Release date" prop="releaseTime" required>
          <el-date-picker
            v-model="newFormInline.releaseTime"
            type="date"
            placeholder="Select release date"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
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
            multiple
          >
            <el-option
              v-for="(item, index) in styleOptions"
              :key="index"
              :label="catalogLabel(item)"
              :value="item"
            >
              {{ catalogLabel(item) }}
            </el-option>
          </el-select>
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
