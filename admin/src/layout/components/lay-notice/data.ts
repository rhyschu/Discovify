export interface ListItem {
  avatar: string;
  title: string;
  datetime: string;
  type: string;
  description: string;
  status?: "primary" | "success" | "warning" | "info" | "danger";
  extra?: string;
}

export interface TabItem {
  key: string;
  name: string;
  list: ListItem[];
  emptyText: string;
}

export const noticesData: TabItem[] = [
 { key: "1", name: "Notifications", list: [], emptyText: "No notifications" },
 { key: "2", name: "Messages", list: [], emptyText: "No messages" },
 { key: "3", name: "Tasks", list: [], emptyText: "No tasks" }
];
