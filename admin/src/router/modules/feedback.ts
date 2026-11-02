export default {
  path: "/feedback",
  redirect: "/feedback/index",
  meta: {
    icon: "ri:feedback-fill",
    title: "Feedback",
    rank: 5
  },
  children: [
    {
      path: "/feedback/index",
      name: "FeedbackManagement",
      component: () => import("@/views/feedback/index.vue"),
      meta: {
        title: "Feedback"
      }
    }
  ]
} satisfies RouteConfigsTable;
