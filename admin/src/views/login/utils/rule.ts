import { reactive } from "vue";
import type { FormRules } from "element-plus";

export const REGEXP_USERNAME = /^[a-zA-Z0-9_-]{4,16}$/;

export const REGEXP_PWD =
  /^(?![0-9]+$)(?![a-z]+$)(?![A-Z]+$)(?!([^(0-9a-zA-Z)]|[()])+$)(?!^.*[\u4E00-\u9FA5].*$)([^(0-9a-zA-Z)]|[()]|[a-z]|[A-Z]|[0-9]){8,18}$/;

const loginRules = reactive(<FormRules>{
  username: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("Enter a username"));
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
          callback(new Error("Enter your password"));
        } else if (!REGEXP_PWD.test(value)) {
          callback(new Error("8-18 characters using at least two of: numbers, letters and symbols"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});

export { loginRules };
