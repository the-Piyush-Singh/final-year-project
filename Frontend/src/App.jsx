import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider, useSelector } from 'react-redux'
import { PersistGate } from 'redux-persist/integration/react'
import { Toaster } from 'react-hot-toast'
import { peristor, store } from './redux/store'

import UserLayout from './Layout/UserLayout'
import Adminlayout from './Layout/Adminlayout'

import Home from './Pages/Home'
import Blog from './Pages/Blog'
import Login from './Pages/Login'
import Register from './Pages/Register'
import Profile from './Pages/Profile'
import CreatePost from './Pages/CreatePost'
import EditPost from './Pages/EditPost'
import Feed from './Pages/Feed'
import UserProfile from './Pages/UserProfile'

import Admin from './Pages/Admin/Admin'
import AddPost from './Pages/Admin/AddPost'
import User from './Pages/Admin/User'
import AllPost from './Pages/AllPost'

function ProtectedRoute({ children }) {
  const user = useSelector((state) => state.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <>
      <BrowserRouter>
        <Provider store={store}>
          <PersistGate loading={null} persistor={peristor}>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#1a1a2e',
                  color: '#e8e8ed',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '12px',
                  fontSize: '0.9rem'
                }
              }}
            />
            <Routes>
              {/* Public layout routes */}
              <Route path='/' element={<UserLayout />}>
                <Route index element={<Home />} />
                <Route path='blog/:postId' element={<Blog />} />
                <Route path='user/:userId' element={<UserProfile />} />
                <Route path='feed' element={<Feed />} />
                <Route path='profile/:userId' element={
                  <ProtectedRoute><Profile /></ProtectedRoute>
                } />
                <Route path='create' element={
                  <ProtectedRoute><CreatePost /></ProtectedRoute>
                } />
                <Route path='edit/:postId' element={
                  <ProtectedRoute><EditPost /></ProtectedRoute>
                } />
              </Route>

              {/* Admin layout routes */}
              <Route path='/dashboard' element={<Adminlayout />}>
                <Route index element={<Admin />} />
                <Route path='addpost' element={<AddPost />} />
                <Route path='users' element={<User />} />
                <Route path='allposts' element={<AllPost />} />
              </Route>

              {/* Auth routes (no layout) */}
              <Route path='/login' element={<Login />} />
              <Route path='/register' element={<Register />} />

              {/* 404 */}
              <Route path='*' element={
                <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text-primary)' }}>
                  <h1 style={{ fontWeight: 800, fontSize: '4rem', color: 'var(--accent-primary)' }}>404</h1>
                  <p style={{ color: 'var(--text-secondary)' }}>Page not found</p>
                  <a href="/" className="btn-primary-custom" style={{ marginTop: '20px' }}>Go Home</a>
                </div>
              } />
            </Routes>
          </PersistGate>
        </Provider>
      </BrowserRouter>
    </>
  )
}
