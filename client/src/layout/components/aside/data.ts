export const MenuData = [
  {
    title: '',
    children: [{ title: 'Discover', icon: 'ri:home-smile-2-line', router: '/' }],
  },
  {
    title: 'Browse',
    children: [
      { title: 'Library', icon: 'ri:music-2-line', router: '/library' },
      {
        title: 'Artists',
        icon: 'ri:mic-line',
        router: '/artist'
      },
      {
        title: 'Playlists',
        icon: 'ri:album-line',
        router: '/playlist'
      },
    ],
  },
  {
    title: 'Your collection',
    children: [
      { title: 'Liked songs', icon: 'ri:heart-line', router: '/like' },
      {
        title: 'Profile',
        icon: 'mi:user',
        router: '/user'
      },
    ],
  },
]
