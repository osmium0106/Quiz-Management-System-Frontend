import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { publicService } from '../../services/public';
import type { PublicQuiz } from '../../types';

const QuizList: React.FC = () => {
  const [quizzes, setQuizzes] = useState<PublicQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { category } = useParams<{ category?: string }>();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await publicService.getPublicQuizzes();
        console.log('QuizList API Response:', response);
        
        const apiQuizzes = response?.results || [];
        setQuizzes(apiQuizzes);
        
        if (apiQuizzes.length === 0) {
          setError('No public quizzes available');
        }
      } catch (err: any) {
        console.error('Error fetching public quizzes:', err);
        setError(`Failed to load quizzes: ${err.message}`);
        setQuizzes([]);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const pageTitle = category 
    ? `${category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ')} Quizzes`
    : 'Available Quizzes';

  const formatTimeLimit = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
    }
    return `${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{pageTitle}</h1>
          <p className="text-xl text-gray-600">Choose a quiz to test your knowledge</p>
          
          {/* API Endpoint Info */}
          <div className="mt-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 max-w-lg mx-auto">
              <p className="text-green-700 font-medium text-sm">
                🔗 Using: GET /public/quizzes/ | Found: {quizzes.length} quiz{quizzes.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
            <p className="text-gray-600">Loading quizzes from /public/quizzes/...</p>
          </div>
        ) : error ? (
          <div className="text-center">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md mx-auto">
              <div className="text-red-600 text-6xl mb-4">❌</div>
              <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Quizzes</h3>
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        ) : quizzes.length === 0 ? (
          <div className="text-center">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 max-w-md mx-auto">
              <div className="text-gray-400 text-6xl mb-4">📝</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">No Quizzes Available</h3>
              <p className="text-gray-600">There are currently no public quizzes available.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                {/* Card Header with Gradient */}
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-indigo-600 transition-colors">
                    {quiz.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {quiz.description || 'Test your knowledge with this quiz.'}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-6">
                    <div className="flex items-center space-x-1">
                      <span className="text-indigo-600">📝</span>
                      <span>{quiz.total_questions} questions</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className="text-green-600">⏱️</span>
                      <span>{formatTimeLimit(quiz.time_limit)}</span>
                    </div>
                  </div>
                  
                  <Link
                    to={`/take-quiz/${quiz.id}`}
                    className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 px-4 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg"
                  >
                    Start Quiz 🚀
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizList;