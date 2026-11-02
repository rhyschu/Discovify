import type { Directive } from "vue";
import type { CopyEl, OptimizeOptions, RippleOptions } from "@/directives";

declare module "vue" {
  export interface ComponentCustomProperties {

    vLoading: Directive<Element, boolean>;

    vAuth: Directive<HTMLElement, string | Array<string>>;

    vCopy: Directive<CopyEl, string>;

    vLongpress: Directive<HTMLElement, Function>;

    vOptimize: Directive<HTMLElement, OptimizeOptions>;

    vPerms: Directive<HTMLElement, string | Array<string>>;

    vRipple: Directive<HTMLElement, RippleOptions>;
  }
}

export {};
