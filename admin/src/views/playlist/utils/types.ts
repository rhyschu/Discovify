interface FormItemProps {
  
  formTitle: string;
  playlistId?: number;
  title: string;
  introduction: string;
  style: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
