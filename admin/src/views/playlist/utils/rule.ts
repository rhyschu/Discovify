import { reactive } from "vue";
import type { FormRules } from "element-plus";

export const formRules = reactive(<FormRules>{
  title: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("Playlist title is required"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});
