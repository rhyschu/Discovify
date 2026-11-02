import { reactive } from "vue";
import type { FormRules } from "element-plus";

export const formRules = reactive(<FormRules>{
  songName: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("Song title is required"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  album: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("Album is required"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ],
  releaseTime: [
    {
      validator: (rule, value, callback) => {
        if (value === "") {
          callback(new Error("Release date is required"));
        } else {
          callback();
        }
      },
      trigger: "blur"
    }
  ]
});
