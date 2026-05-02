import { Routes, Route, Navigate } from 'react-router-dom'
import { Toast } from '@heroui/react'
import AdminLayout from './components/layout/AdminLayout'
import PostList from './pages/PostList'
import PostEdit from './pages/PostEdit'
import TagManager from './pages/TagManager'
import CategoryManager from './pages/CategoryManager'

export default function App() {
  return (
    <>
    <Toast.Provider placement="top end" />
    <Routes>
      <Route path="/posts/new" element={<PostEdit />} />
      <Route path="/posts/:slug/edit" element={<PostEdit />} />
      <Route element={<AdminLayout />}>
        <Route path="/" element={<Navigate to="/posts" replace />} />
        <Route path="/posts" element={<PostList />} />
        <Route path="/tags" element={<TagManager />} />
        <Route path="/categories" element={<CategoryManager />} />
      </Route>
    </Routes>
    </>
  )
}
