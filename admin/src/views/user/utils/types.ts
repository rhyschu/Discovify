interface FormItemProps {
  
  title: string;
  userId: number;
  username: string;
  password: string;
  phone: string | number;
  email: string;
  userStatus: number;
  introduction: string;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
