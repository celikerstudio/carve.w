export const adminNavigationGroups = [
  {
    label: 'OVERVIEW',
    icon: { name: 'DashboardIcon' },
    items: [
      {
        title: "Dashboard",
        href: "/admin",
        icon: { name: 'DashboardIcon' },
        description: "Analytics & insights"
      }
    ]
  },
  {
    label: 'MANAGEMENT',
    icon: { name: 'UsersIcon' },
    items: [
      {
        title: "Users",
        href: "/admin/users",
        icon: { name: 'UsersIcon' },
        description: "User management"
      },
      {
        title: "Content",
        href: "/admin/content",
        icon: { name: 'BookIcon' },
        description: "Wiki & content moderation"
      },
      {
        title: "Feedback",
        href: "/admin/feedback",
        icon: { name: 'MailIcon' },
        description: "User feedback"
      }
    ]
  },
  {
    label: 'CONFIGURATION',
    icon: { name: 'SettingsIcon' },
    items: [
      {
        title: "Settings",
        href: "/admin/settings",
        icon: { name: 'SettingsIcon' },
        description: "Site configuration"
      }
    ]
  }
];
