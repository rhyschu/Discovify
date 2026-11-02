export default {
  path: "/playlist",
  redirect: "/playlist/index",
  meta: {
    icon: "ri:album-fill",
    title: "Playlists",
    rank: 4
  },
  children: [
    {
      path: "/playlist/index",
      name: "playlistManagement",
      component: () => import("@/views/playlist/index.vue"),
      meta: {
        title: "Playlists"
      }
    }
  ]
} satisfies RouteConfigsTable;
