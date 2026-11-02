import type { CSSProperties, VNode, Component } from "vue";

type DoneFn = (cancel?: boolean) => void;
type EventType =
  | "open"
  | "close"
  | "openAutoFocus"
  | "closeAutoFocus"
  | "fullscreenCallBack";
type ArgsType = {
  
  command: "cancel" | "sure" | "close";
};
type ButtonType =
  | "primary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "text";

/** https://element-plus.org/zh-CN/component/dialog.html#attributes */
type DialogProps = {
  
  visible?: boolean;
  
  title?: string;
  
  width?: string | number;
  
  fullscreen?: boolean;
  
  fullscreenIcon?: boolean;
  
  top?: string;
  
  modal?: boolean;
  
  appendToBody?: boolean;
  
  lockScroll?: boolean;
  
  class?: string;
  
  style?: CSSProperties;
  
  openDelay?: number;
  
  closeDelay?: number;
  
  closeOnClickModal?: boolean;
  
  closeOnPressEscape?: boolean;
  
  showClose?: boolean;
  
  beforeClose?: (done: DoneFn) => void;
  
  draggable?: boolean;
  
  center?: boolean;
  
  alignCenter?: boolean;
  
  destroyOnClose?: boolean;
};

//element-plus.org/zh-CN/component/popconfirm.html#attributes
type Popconfirm = {
  
  title?: string;
  
  confirmButtonText?: string;
  
  cancelButtonText?: string;
  
  confirmButtonType?: ButtonType;
  
  cancelButtonType?: ButtonType;
  
  icon?: string | Component;
  
  iconColor?: string;
  
  hideIcon?: boolean;
  
  hideAfter?: number;
  
  teleported?: boolean;
  
  persistent?: boolean;
  
  width?: string | number;
};

type BtnClickDialog = {
  options?: DialogOptions;
  index?: number;
};
type BtnClickButton = {
  btn?: ButtonProps;
  index?: number;
};
/** https://element-plus.org/zh-CN/component/button.html#button-attributes */
type ButtonProps = {
  
  label: string;
  
  size?: "large" | "default" | "small";
  
  type?: "primary" | "success" | "warning" | "danger" | "info";
  
  plain?: boolean;
  
  text?: boolean;
  
  bg?: boolean;
  
  link?: boolean;
  
  round?: boolean;
  
  circle?: boolean;
  
  popconfirm?: Popconfirm;
  
  loading?: boolean;
  
  loadingIcon?: string | Component;
  
  disabled?: boolean;
  
  icon?: string | Component;
  
  autofocus?: boolean;
  
  nativeType?: "button" | "submit" | "reset";
  
  autoInsertSpace?: boolean;
  
  color?: string;
  
  dark?: boolean;
  
  tag?: string | Component;
  
  btnClick?: ({
    dialog,
    button
  }: {
    
    dialog: BtnClickDialog;
    
    button: BtnClickButton;
  }) => void;
};

interface DialogOptions extends DialogProps {
  
  props?: any;
  
  hideFooter?: boolean;
  
  popconfirm?: Popconfirm;
  
  sureBtnLoading?: boolean;
  
  headerRenderer?: ({
    close,
    titleId,
    titleClass
  }: {
    close: Function;
    titleId: string;
    titleClass: string;
  }) => VNode | Component;
  
  contentRenderer?: ({
    options,
    index
  }: {
    options: DialogOptions;
    index: number;
  }) => VNode | Component;
  
  footerRenderer?: ({
    options,
    index
  }: {
    options: DialogOptions;
    index: number;
  }) => VNode | Component;
  
  footerButtons?: Array<ButtonProps>;
  
  open?: ({
    options,
    index
  }: {
    options: DialogOptions;
    index: number;
  }) => void;
  
  close?: ({
    options,
    index
  }: {
    options: DialogOptions;
    index: number;
  }) => void;
  
  closeCallBack?: ({
    options,
    index,
    args
  }: {
    options: DialogOptions;
    index: number;
    args: any;
  }) => void;
  
  fullscreenCallBack?: ({
    options,
    index
  }: {
    options: DialogOptions;
    index: number;
  }) => void;
  
  openAutoFocus?: ({
    options,
    index
  }: {
    options: DialogOptions;
    index: number;
  }) => void;
  
  closeAutoFocus?: ({
    options,
    index
  }: {
    options: DialogOptions;
    index: number;
  }) => void;
  
  beforeCancel?: (
    done: Function,
    {
      options,
      index
    }: {
      options: DialogOptions;
      index: number;
    }
  ) => void;
  
  beforeSure?: (
    done: Function,
    {
      options,
      index,
      closeLoading
    }: {
      options: DialogOptions;
      index: number;
      
      closeLoading: Function;
    }
  ) => void;
}

export type { EventType, ArgsType, DialogProps, ButtonProps, DialogOptions };
