import { Outlet } from 'react-router-dom'

export default function AuthLayout() {
  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100">
      {/* Burbujas decorativas */}
      
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-20 w-64 h-64 bg-indigo-900 rounded-full opacity-15 blur-xl animate-blob-move"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-900 rounded-full opacity-15 blur-xl animate-blob-move animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/4 w-64 h-64 bg-pink-900 rounded-full opacity-15 blur-xl animate-blob-move animation-delay-4000"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-blue-900 rounded-full opacity-15 blur-xl animate-blob-move animation-delay-3000"></div>
      </div>
      
      <div className="relative w-full h-full flex items-center justify-center p-4">
        <Outlet />
      </div>
    </div>
  )
}