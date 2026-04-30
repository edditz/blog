import { NavLink } from 'react-router-dom'
import { FileText, Tag, Folder } from 'lucide-react'

const navItems = [
  { to: '/posts', label: '文章', icon: FileText },
  { to: '/tags', label: '标签', icon: Tag },
  { to: '/categories', label: '分类', icon: Folder },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-surface border-r border-default min-h-screen p-4">
      <h1 className="text-xl font-bold mb-6 px-2 text-foreground">Blog Admin</h1>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted hover:bg-surface-secondary hover:text-foreground'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
