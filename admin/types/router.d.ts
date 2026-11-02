
import type { RouteComponent, RouteLocationNormalized } from "vue-router";
import type { FunctionalComponent } from "vue";

declare global {
  interface ToRouteType extends RouteLocationNormalized {
    meta: CustomizeRouteMeta;
  }

  interface CustomizeRouteMeta {

    title: string;

    icon?: string | FunctionalComponent | IconifyIcon;

    extraIcon?: string | FunctionalComponent | IconifyIcon;

    showLink?: boolean;

    showParent?: boolean;

    roles?: Array<string>;

    auths?: Array<string>;

    keepAlive?: boolean;

    frameSrc?: string;

    frameLoading?: boolean;

    transition?: {

      name?: string;

      enterTransition?: string;

      leaveTransition?: string;
    };

    hiddenTag?: boolean;

    fixedTag?: boolean;

    dynamicLevel?: number;

    activePath?: string;
  }

  interface RouteChildrenConfigsTable {

    path: string;

    name?: string;

    redirect?: string;

    component?: RouteComponent;
    meta?: CustomizeRouteMeta;

    children?: Array<RouteChildrenConfigsTable>;
  }

  interface RouteConfigsTable {

    path: string;

    name?: string;

    component?: RouteComponent;

    redirect?: string;
    meta?: {

      title: string;

      icon?: string | FunctionalComponent | IconifyIcon;

      showLink?: boolean;

      rank?: number;
    };

    children?: Array<RouteChildrenConfigsTable>;
  }
}

// https://router.vuejs.org/zh/guide/advanced/meta.html#typescript
declare module "vue-router" {
  interface RouteMeta extends CustomizeRouteMeta {}
}
