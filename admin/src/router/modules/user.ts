export default {
  path: "/user",
  redirect: "/user/index",
  meta: {
    icon: "ri:admin-fill",
    title: "Users",
    rank: 1
  },
  children: [
    {
      path: "/user/index",
      name: "UserManagement",
      component: () => import("@/views/user/index.vue"),
      meta: {
        title: "Users"
      }
    }
  ]
} satisfies RouteConfigsTable;
