import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from './components/layout/AdminLayout'
import PostList from './pages/PostList'

export default function App() {
  return (
    <Routes>
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/tags" element={<div>Tag Manager</div>} />
        <Route path="/categories" element={<div>Category Manager</div>} />
      </Route>
    </Routes>
  )
}
