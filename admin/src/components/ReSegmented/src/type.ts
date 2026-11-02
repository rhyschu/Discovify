import type { VNode, Component } from "vue";
import type { iconType } from "@/components/ReIcon/src/types.ts";

export interface OptionsType {
  
  label?: string | (() => VNode | Component);
  
  icon?: string | Component;
  
  iconAttrs?: iconType;
  
  value?: any;
  
  disabled?: boolean;
  
  tip?: string;
}
