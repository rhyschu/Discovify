<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "Add",
    artistId: 0,
    artistName: "",
    gender: 0,
    birth: null,
    area: "",
    introduction: ""
  })
});

const genderOptions = [
  {
    value: 0,
    label: "Male"
  },
  {
    value: 1,
    label: "Female"
  },
  {
    value: 2,
    label: "Group/Band"
  }
];

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
        v-if="newFormInline.title === 'Edit'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="Artist ID" prop="artistId">
          <el-input
            v-model="newFormInline.artistId"
            disabled
            placeholder="newFormInline.artistId"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Artist" prop="artistName" required>
          <el-input
            v-model="newFormInline.artistName"
            clearable
            placeholder="Enter artist name"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Type">
          <el-select
            v-model="newFormInline.gender"
            placeholder="Select type"
            class="w-full"
            clearable
          >
            <el-option
              v-for="(item, index) in genderOptions"
              :key="index"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Birthday" prop="birth">
          <el-date-picker
            v-model="newFormInline.birth"
            type="date"
            placeholder="Select date of birth"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Country" prop="area">
          <el-input
            v-model="newFormInline.area"
            clearable
            placeholder="Enter country"
          />
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
