import { reactive } from "vue";
import type { FormRules } from "element-plus";

export const formRules = reactive(<FormRules>{
  artistName: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("Artist is required"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});
