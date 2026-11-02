export default {
  path: "/banner",
  redirect: "/banner/index",
  meta: {
    icon: "bxs:carousel",
    title: "Banners",
    rank: 6
  },
  children: [
    {
      path: "/banner/index",
      name: "BannerManagement",
      component: () => import("@/views/banner/index.vue"),
      meta: {
        title: "Banners"
      }
    }
  ]
} satisfies RouteConfigsTable;
