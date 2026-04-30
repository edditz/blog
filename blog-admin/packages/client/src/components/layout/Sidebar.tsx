import { NavLink } from 'react-router-dom'
import { FileText, Tag, Folder } from 'lucide-react'

const navItems = [
  { to: '/posts', label: '文章', icon: FileText },
  { to: '/tags', label: '标签', icon: Tag },
  { to: '/categories', label: '分类', icon: Folder },
]

export default function Sidebar() {
  return (
    <aside className="w-56 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 min-h-screen p-4">
      <h1 className="text-xl font-bold mb-6 px-2">Blog Admin</h1>
      <nav className="flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
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
