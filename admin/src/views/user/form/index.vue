<script setup lang="ts">
import { ref } from "vue";
import ReCol from "@/components/ReCol";
import { formRules } from "../utils/rule";
import { FormProps } from "../utils/types";
import { usePublicHooks } from "../hooks";

const props = withDefaults(defineProps<FormProps>(), {
  formInline: () => ({
    title: "Add",
    userId: 0,
    username: "",
    password: "",
    phone: "",
    email: "",
    introduction: "",
    userStatus: 0
  })
});

const ruleFormRef = ref();
const { switchStyle } = usePublicHooks();
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
        <el-form-item label="User ID" prop="userId">
          <el-input
            v-model="newFormInline.userId"
            disabled
            placeholder="newFormInline.userId"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Username" prop="username" required>
          <el-input
            v-model="newFormInline.username"
            clearable
            placeholder="Enter a username"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-if="newFormInline.title === 'Add'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="Password" prop="password" required>
          <el-input
            v-model="newFormInline.password"
            clearable
            placeholder="Enter a password"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Email" prop="email" required>
          <el-input
            v-model="newFormInline.email"
            clearable
            placeholder="Enter your email"
          />
        </el-form-item>
      </re-col>

      <re-col :value="12" :xs="24" :sm="24">
        <el-form-item label="Phone number" prop="phone">
          <el-input
            v-model="newFormInline.phone"
            clearable
            placeholder="Enter a phone number"
          />
        </el-form-item>
      </re-col>

      <re-col>
        <el-form-item label="Bio">
          <el-input
            v-model="newFormInline.introduction"
            placeholder="Add a bio"
            type="textarea"
          />
        </el-form-item>
      </re-col>

      <re-col
        v-if="newFormInline.title === 'Add'"
        :value="12"
        :xs="24"
        :sm="24"
      >
        <el-form-item label="Status">
          <el-switch
            v-model="newFormInline.userStatus"
            inline-prompt
            :active-value="1"
            :inactive-value="0"
            active-text="Enable"
            inactive-text="Disable"
            :style="switchStyle"
          />
        </el-form-item>
      </re-col>
    </el-row>
  </el-form>
</template>
