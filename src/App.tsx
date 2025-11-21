import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

// Context
import { AuthProvider } from './contexts/AuthContext';

// Layouts
import AdminLayout from './components/layouts/AdminLayout';
import PublicLayout from './components/layouts/PublicLayout';

// Auth components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Admin pages
import Dashboard from './pages/admin/Dashboard';
import QuizList from './pages/admin/QuizList';
import CreateQuiz from './pages/admin/CreateQuiz';
import EditQuiz from './pages/admin/EditQuiz';
import QuizDetail from './pages/admin/QuizDetail';
import ResponseList from './pages/admin/ResponseList';
import ResponseDetail from './pages/admin/ResponseDetail';
import Profile from './pages/admin/Profile';

// Public pages
import Home from './pages/public/Home';
import PublicQuizList from './pages/public/QuizList';
import TakeQuiz from './pages/public/TakeQuiz';
import QuizResults from './pages/public/QuizResults';
import QuizJoin from './pages/public/QuizJoin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Toaster position="top-right" />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<Home />} />
            <Route path="quizzes" element={<PublicQuizList />} />
            <Route path="quizzes/category/:category" element={<PublicQuizList />} />
            <Route path="quiz/join/:pin" element={<QuizJoin />} />
            <Route path="quiz/:id" element={<TakeQuiz />} />
            <Route path="quiz/:id/preview" element={<TakeQuiz />} />
            <Route path="results/:sessionId" element={<QuizResults />} />
          </Route>

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="quizzes" element={<QuizList />} />
            <Route path="quizzes/create" element={<CreateQuiz />} />
            <Route path="quizzes/:id" element={<QuizDetail />} />
            <Route path="quizzes/:id/edit" element={<EditQuiz />} />
            <Route path="responses" element={<ResponseList />} />
            <Route path="responses/:id" element={<ResponseDetail />} />
            <Route path="profile" element={<Profile />} />
          </Route>

          {/* 404 Route */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600 mb-8">Page not found</p>
                <a href="/" className="text-indigo-600 hover:text-indigo-700">
                  Go back home
                </a>
              </div>
            </div>
          } />
        </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;