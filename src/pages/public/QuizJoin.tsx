import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const QuizJoin: React.FC = () => {
  const { pin } = useParams<{ pin: string }>();
  const navigate = useNavigate();
  const [playerName, setPlayerName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [quizInfo, setQuizInfo] = useState<any>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (pin) {
      // Simulate fetching quiz info
      setTimeout(() => {
        setQuizInfo({
          title: 'Sample Quiz',
          description: 'A fun quiz about general knowledge',
          participantCount: 42,
          isActive: true
        });
      }, 1000);
    }
  }, [pin]);

  const handleJoinQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) {
      setError('Please enter your name');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Simulate joining quiz
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Navigate to quiz game
      navigate(`/quiz/play/${pin}`, { 
        state: { playerName, quizInfo } 
      });
    } catch (err) {
      setError('Failed to join quiz. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!quizInfo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Finding Quiz...</h2>
            <p className="text-gray-600">Looking for quiz with PIN: <span className="font-mono font-bold">{pin}</span></p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl">🎯</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{quizInfo.title}</h1>
          <p className="text-gray-600 mb-4">{quizInfo.description}</p>
          <div className="bg-indigo-50 rounded-lg p-3 mb-6">
            <p className="text-indigo-800 font-semibold">
              PIN: <span className="font-mono text-lg">{pin}</span>
            </p>
            <p className="text-indigo-600 text-sm">
              {quizInfo.participantCount} players already joined
            </p>
          </div>
        </div>

        <form onSubmit={handleJoinQuiz} className="space-y-6">
          <div>
            <label htmlFor="playerName" className="block text-sm font-medium text-gray-700 mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Joining...
              </span>
            ) : (
              'Join Quiz'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuizJoin;