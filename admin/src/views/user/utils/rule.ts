import { reactive } from "vue";
import type { FormRules } from "element-plus";
import { isPhone, isEmail } from "@pureadmin/utils";

export const REGEXP_USERNAME = /^[a-zA-Z0-9_-]{4,16}$/;

export const REGEXP_PWD =
  /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/;

export const formRules = reactive(<FormRules>{
  username: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("Username is required"));
        } else if (!REGEXP_USERNAME.test(value)) {
          callback(new Error("4-16 letters, numbers, underscores or hyphens"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  password: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("Password is required"));
        } else if (!REGEXP_PWD.test(value)) {
          callback(new Error("8-18 characters using at least two of: numbers, letters and symbols"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  phone: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback();
        } else if (!isPhone(value)) {
          callback(new Error("Enter a valid phone number."));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  email: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("Email is required"));
        } else if (!isEmail(value)) {
          callback(new Error("Enter a valid email address."));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});
