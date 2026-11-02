import type { Emitter } from "mitt";
import mitt from "mitt";

type Events = {
  openPanel: string;
  tagViewsChange: string;
  tagViewsShowModel: string;
  logoChange: boolean;
  changLayoutRoute: string;
};

export const emitter: Emitter<Events> = mitt<Events>();
