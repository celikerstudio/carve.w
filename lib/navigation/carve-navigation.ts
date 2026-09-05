// @ai-why: De Money-ingang stond hier tot 2026-09-05. Weg met de rest van het
// Geld-domein; de pagina zelf staat achter `SHOW_MONEY` in lib/flags.ts en geeft in
// productie een 404. Terugzetten betekent hier een regel én de vlag omzetten.
// @ai-sync: lib/flags.ts (SHOW_MONEY)
export const carveNavigationGroups = [
  {
    label: 'CARVE',
    icon: { name: 'RocketIcon' },
    items: [
      {
        title: "Health",
        href: "/carve",
        icon: { name: 'DumbbellIcon' },
        description: "Fitness with a scoreboard"
      },
      {
        title: "Roadmap",
        href: "/carve/roadmap",
        icon: { name: 'ChartIcon' },
        description: "Development roadmap"
      },
      {
        title: "Updates",
        href: "/carve/updates",
        icon: { name: 'InfoIcon' },
        description: "Latest changes and news"
      },
      {
        title: "Vision",
        href: "/carve/vision",
        icon: { name: 'ZapIcon' },
        description: "Our long-term vision"
      },
      {
        title: "Developer",
        href: "/carve/developer",
        icon: { name: 'UserIcon' },
        description: "About the developer"
      },
      {
        title: "FAQ",
        href: "/carve/faq",
        icon: { name: 'HelpIcon' },
        description: "Frequently asked questions"
      },
      {
        title: "Contributing",
        href: "/carve/contributing",
        icon: { name: 'UsersIcon' },
        description: "How to contribute"
      }
    ]
  }
];
