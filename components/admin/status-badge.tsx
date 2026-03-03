interface StatusBadgeProps {
  variant: string;
  children: React.ReactNode;
}

const ROLE_STYLES: Record<string, string> = {
  admin: "bg-purple-500/10 text-purple-400",
  moderator: "bg-blue-500/10 text-blue-400",
  user: "bg-white/5 text-slate-500",
};

const STATUS_STYLES: Record<string, string> = {
  published: "bg-emerald-500/10 text-emerald-400",
  draft: "bg-white/5 text-slate-500",
  new: "bg-amber-500/10 text-amber-400",
  reviewed: "bg-blue-500/10 text-blue-400",
  planned: "bg-purple-500/10 text-purple-400",
  completed: "bg-emerald-500/10 text-emerald-400",
  active: "bg-emerald-500/10 text-emerald-400",
  inactive: "bg-white/5 text-slate-500",
};

const TYPE_STYLES: Record<string, string> = {
  bug: "bg-rose-500/10 text-rose-400",
  feature: "bg-blue-500/10 text-blue-400",
  improvement: "bg-amber-500/10 text-amber-400",
};

export function RoleBadge({ role }: { role: string }) {
  const style = ROLE_STYLES[role] || ROLE_STYLES.user;
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {role}
    </span>
  );
}

export function StatusBadge({ variant, children }: StatusBadgeProps) {
  const style = STATUS_STYLES[variant] || "bg-white/5 text-slate-500";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {children}
    </span>
  );
}

export function TypeBadge({ type }: { type: string }) {
  const style = TYPE_STYLES[type] || "bg-white/5 text-slate-500";
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${style}`}>
      {type}
    </span>
  );
}
