import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import PostList from './pages/PostList'
import TagManager from './pages/TagManager'
import CategoryManager from './pages/CategoryManager'

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/tags" element={<TagManager />} />
        <Route path="/categories" element={<CategoryManager />} />
      </Route>
    </Routes>
  )
}
