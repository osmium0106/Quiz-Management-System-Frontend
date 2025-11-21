import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { adminQuizService } from '../../services/adminQuiz';

interface DashboardStats {
  totalQuizzes: number;
  activeQuizzes: number;
  totalQuestions: number;
  totalResponses: number;
}

const Dashboard: React.FC = () => {
  const { user, isLoading, error, logout } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalQuizzes: 0,
    activeQuizzes: 0,
    totalQuestions: 0,
    totalResponses: 0,
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Dashboard - Auth Status:', { user, isLoading, error });
  }, [user, isLoading, error]);

  useEffect(() => {
    const loadDashboardStats = async () => {
      if (user && !isLoading) {
        try {
          setStatsLoading(true);
          setStatsError(null);
          const dashboardStats = await adminQuizService.getDashboardStats();
          setStats(dashboardStats);
          console.log('📊 Dashboard Stats Loaded:', dashboardStats);
        } catch (err: any) {
          console.error('❌ Failed to load dashboard stats:', err);
          setStatsError(err.message || 'Failed to load dashboard statistics');
        } finally {
          setStatsLoading(false);
        }
      }
    };

    loadDashboardStats();
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-3 text-gray-600">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center">
          <svg className="h-6 w-6 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="text-red-800 font-medium">Dashboard Error</h3>
            <p className="text-red-700 text-sm mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              Welcome back, {user?.full_name || user?.first_name || user?.username || 'Admin'}! 👋
            </h1>
            <p className="text-indigo-100 text-lg">
              {user?.email && `${user.email} • `}
              Last login: {user?.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}
            </p>
            <div className="mt-4 flex items-center space-x-4">
              <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                👤 {user?.username}
              </span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                user?.is_quiz_admin ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                {user?.is_quiz_admin ? '🔑 Quiz Admin' : '📝 User'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="flex flex-col items-end space-y-4">
              <button
                onClick={logout}
                className="bg-white/20 hover:bg-white/30 border border-white/30 px-4 py-2 rounded-lg text-white font-medium transition-all duration-200 flex items-center space-x-2 hover:scale-105"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Logout</span>
              </button>
              <div className="text-center">
                <div className="text-4xl mb-2">📊</div>
                <p className="text-indigo-100">Admin Dashboard</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">📝</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Quizzes</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats.totalQuizzes}
                  </dd>
                  <dd className="text-xs text-green-600 font-medium">
                    {statsError ? 'Error loading' : 'From /admin/quizzes/'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Total Questions</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats.totalQuestions}
                  </dd>
                  <dd className="text-xs text-green-600 font-medium">
                    From /admin/questions/
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">🚀</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Active Quizzes</dt>
                  <dd className="text-2xl font-bold text-gray-900">
                    {statsLoading ? '...' : stats.activeQuizzes}
                  </dd>
                  <dd className="text-xs text-orange-600 font-medium">
                    {stats.totalQuizzes > 0 ? `${Math.round((stats.activeQuizzes / stats.totalQuizzes) * 100)}% of total` : 'Real-time data'}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white overflow-hidden shadow-lg rounded-2xl border border-gray-100 hover:shadow-xl transition-shadow">
          <div className="p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg font-bold">🎯</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">API Endpoints</dt>
                  <dd className="text-2xl font-bold text-gray-900">12</dd>
                  <dd className="text-xs text-pink-600 font-medium">Admin operations ready</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <a
            href="/admin/quizzes/create"
            className="group bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-indigo-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">➕</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Create Quiz</h3>
                <p className="text-gray-600 text-sm">Start building a new quiz</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/quizzes"
            className="group bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6 hover:border-green-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-green-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">📋</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Manage Quizzes</h3>
                <p className="text-gray-600 text-sm">View and edit existing quizzes</p>
              </div>
            </div>
          </a>

          <a
            href="/admin/responses"
            className="group bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200 rounded-2xl p-6 hover:border-yellow-300 hover:shadow-lg transition-all duration-200"
          >
            <div className="flex items-center">
              <div className="bg-yellow-600 rounded-xl p-3 group-hover:scale-110 transition-transform">
                <span className="text-white text-xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">View Results</h3>
                <p className="text-gray-600 text-sm">Check quiz responses and analytics</p>
              </div>
            </div>
          </a>
        </div>
      </div>

      {/* API Endpoints Available */}
      <div className="mt-12">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">🔗 Available Admin API Endpoints</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              📝 Quiz Management
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-mono text-green-600">GET</span>
                <span className="text-gray-600">/admin/quizzes/</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">List</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-mono text-blue-600">POST</span>
                <span className="text-gray-600">/admin/quizzes/</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Create</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-mono text-yellow-600">PUT</span>
                <span className="text-gray-600">/admin/quizzes/{'{'}{"id"}{'}'}/</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Update</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-mono text-purple-600">PATCH</span>
                <span className="text-gray-600">/admin/quizzes/{'{'}{"id"}{'}'}/</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Partial</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-mono text-red-600">DELETE</span>
                <span className="text-gray-600">/admin/quizzes/{'{'}{"id"}{'}'}/</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Delete</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              ❓ Question Management
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-mono text-green-600">GET</span>
                <span className="text-gray-600">/admin/questions/{'{'}{"id"}{'}'}/</span>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">Read</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-mono text-yellow-600">PUT</span>
                <span className="text-gray-600">/admin/questions/{'{'}{"id"}{'}'}/</span>
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Update</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-mono text-purple-600">PATCH</span>
                <span className="text-gray-600">/admin/questions/{'{'}{"id"}{'}'}/</span>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">Partial</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-gray-100">
                <span className="font-mono text-red-600">DELETE</span>
                <span className="text-gray-600">/admin/questions/{'{'}{"id"}{'}'}/</span>
                <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">Delete</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="font-mono text-blue-600">POST</span>
                <span className="text-gray-600">/admin/quizzes/{'{'}{"id"}{'}'}/questions/</span>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Create</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Error Display */}
      {statsError && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h4 className="text-red-800 font-medium">Stats Loading Error</h4>
              <p className="text-red-700 text-sm mt-1">{statsError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Debug Info */}
      <div className="mt-12 bg-gray-50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">🔍 Debug Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">User ID:</span>
            <span className="ml-2 text-gray-600">{user?.id || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Username:</span>
            <span className="ml-2 text-gray-600">{user?.username || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Email:</span>
            <span className="ml-2 text-gray-600">{user?.email || 'N/A'}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Quiz Admin:</span>
            <span className={`ml-2 font-medium ${user?.is_quiz_admin ? 'text-green-600' : 'text-yellow-600'}`}>
              {user?.is_quiz_admin ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Date Joined:</span>
            <span className="ml-2 text-gray-600">
              {user?.date_joined ? new Date(user.date_joined).toLocaleDateString() : 'N/A'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Auth Loading:</span>
            <span className={`ml-2 font-medium ${isLoading ? 'text-yellow-600' : 'text-green-600'}`}>
              {isLoading ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Stats Loading:</span>
            <span className={`ml-2 font-medium ${statsLoading ? 'text-yellow-600' : 'text-green-600'}`}>
              {statsLoading ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">API Endpoints:</span>
            <span className="ml-2 text-indigo-600 font-medium">12 Available</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Real Data:</span>
            <span className={`ml-2 font-medium ${stats.totalQuizzes > 0 ? 'text-green-600' : 'text-yellow-600'}`}>
              {stats.totalQuizzes > 0 ? 'Loaded Successfully' : 'No Data Yet'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;