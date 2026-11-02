export default {
  path: "/artist",
  redirect: "/artist/index",
  meta: {
    icon: "ri:mic-fill",
    title: "Artists",
    rank: 2
  },
  children: [
    {
      path: "/artist/index",
      name: "ArtistManagement",
      component: () => import("@/views/artist/index.vue"),
      meta: {
        title: "Artists"
      }
    }
  ]
} satisfies RouteConfigsTable;
