export default {
  path: "/song",
  redirect: "/song/index",
  meta: {
    icon: "ri:music-2-fill",
    title: "Songs",
    rank: 3
  },
  children: [
    {
      path: "/song/index",
      name: "SongManagement",
      component: () => import("@/views/song/index.vue"),
      meta: {
        title: "Songs"
      }
    }
  ]
} satisfies RouteConfigsTable;
