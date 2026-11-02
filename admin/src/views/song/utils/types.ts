interface FormItemProps {
  
  title: string;
  artistId: number;
  artistName: string;
  songId: number;
  songName: string;
  album: string;
  style: Array<string>;
  releaseTime: Date;
}
interface FormProps {
  formInline: FormItemProps;
}

export type { FormItemProps, FormProps };
