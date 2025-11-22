import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { publicQuizService, QuizResult } from '../../services/publicQuiz';

const QuizResults: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState<QuizResult | null>(location.state?.result || null);
  const [loading, setLoading] = useState(!result);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!result && sessionId) {
      const fetchResults = async () => {
        try {
          setLoading(true);
          const data = await publicQuizService.getResults(sessionId);
          setResult(data);
        } catch (err) {
          console.error('Error fetching results:', err);
          setError('Failed to load results. Please try again.');
        } finally {
          setLoading(false);
        }
      };

      fetchResults();
    }
  }, [sessionId, result]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Results Not Available</h2>
          <p className="text-gray-600 mb-6">{error || 'Results not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const percentage = parseFloat(result.percentage);
  const isPassed = result.is_passed;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`px-8 py-12 text-center ${
            isPassed 
              ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
              : 'bg-gradient-to-r from-red-500 to-rose-600'
          } text-white`}>
            <div className="mb-6">
              <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 ${
                isPassed ? 'bg-green-100' : 'bg-red-100'
              }`}>
                <span className={`text-4xl ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                  {isPassed ? '🎉' : '😔'}
                </span>
              </div>
              <h1 className="text-3xl font-bold mb-2">
                {isPassed ? 'Congratulations!' : 'Quiz Completed'}
              </h1>
              <p className="text-xl opacity-90">
                {result.quiz_title}
              </p>
              <p className="text-lg opacity-80 mt-2">
                {result.participant_name}
              </p>
            </div>
          </div>
          
          {/* Results Summary */}
          <div className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center bg-green-50 rounded-xl p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
                  {result.correct_answers_count}/{result.total_questions_count}
                </div>
                <div className="text-sm font-medium text-gray-600">Correct Answers</div>
              </div>
              
              <div className="text-center bg-indigo-50 rounded-xl p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  {Math.round(percentage)}%
                </div>
                <div className="text-sm font-medium text-gray-600">Final Score</div>
              </div>
              
              <div className="text-center bg-orange-50 rounded-xl p-6">
                <div className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent mb-2">
                  {result.total_points}
                </div>
                <div className="text-sm font-medium text-gray-600">Total Points</div>
              </div>
            </div>
            
            {/* Pass/Fail Status */}
            <div className="text-center mb-8">
              <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                isPassed 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {isPassed ? '✅ Passed!' : '❌ Not Passed'}
              </div>
              <p className="text-gray-600 mt-3">
                {result.submitted_at && `Completed on ${new Date(result.submitted_at).toLocaleString()}`}
              </p>
              {result.attempt_number > 1 && (
                <p className="text-gray-500 text-sm mt-1">
                  Attempt #{result.attempt_number}
                </p>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/')}
                className="px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-semibold"
              >
                🏠 Back to Home
              </button>
              <button
                onClick={() => navigate('/quizzes')}
                className="px-8 py-3 border-2 border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-colors font-semibold"
              >
                🎯 Take Another Quiz
              </button>
            </div>
            
            {/* Additional Info */}
            <div className="mt-8 p-6 bg-gray-50 rounded-xl">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Summary</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Participant:</span>
                  <span className="ml-2 text-gray-600">{result.participant_name}</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Score:</span>
                  <span className="ml-2 text-gray-600">{result.score}/{result.total_points} points</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Percentage:</span>
                  <span className="ml-2 text-gray-600">{result.percentage}%</span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Status:</span>
                  <span className={`ml-2 font-semibold ${isPassed ? 'text-green-600' : 'text-red-600'}`}>
                    {isPassed ? 'Passed' : 'Failed'}
                  </span>
                </div>
              </div>
            </div>

            {/* Detailed Answer Review */}
            <div className="mt-8 bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Answer Review</h3>
                <p className="text-sm text-gray-600 mt-1">Detailed breakdown of your answers</p>
              </div>
              
              <div className="divide-y divide-gray-200">
                {result.answers && result.answers.map((answer, index) => (
                  <div key={index} className="p-6">
                    <div className="flex items-start space-x-4">
                      {/* Question Number & Status */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${
                        answer.is_correct 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {answer.is_correct ? '✓' : '✗'}
                      </div>

                      {/* Question Content */}
                      <div className="flex-1">
                        <h4 className="text-lg font-semibold text-gray-900 mb-3">
                          Question {index + 1}: {answer.question_text}
                        </h4>

                        <div className="space-y-3">
                          {/* Your Answer */}
                          <div>
                            <span className="text-sm font-medium text-gray-700">Your Answer:</span>
                            <div className={`mt-1 p-3 rounded-lg ${
                              answer.is_correct 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                            }`}>
                              <span className={`font-medium ${
                                answer.is_correct ? 'text-green-800' : 'text-red-800'
                              }`}>
                                {answer.selected_option_text || answer.text_answer || 'No answer provided'}
                              </span>
                            </div>
                          </div>

                          {/* Correct Answer (if wrong) */}
                          {!answer.is_correct && answer.correct_option_text && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Correct Answer:</span>
                              <div className="mt-1 p-3 bg-green-50 border border-green-200 rounded-lg">
                                <span className="font-medium text-green-800">
                                  {answer.correct_option_text}
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Explanation */}
                          {answer.explanation && (
                            <div>
                              <span className="text-sm font-medium text-gray-700">Explanation:</span>
                              <div className="mt-1 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <span className="text-blue-800">{answer.explanation}</span>
                              </div>
                            </div>
                          )}

                          {/* Points */}
                          <div className="flex items-center text-sm">
                            <span className="font-medium text-gray-700">Points Earned:</span>
                            <span className={`ml-2 font-bold ${
                              answer.is_correct ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {answer.points_earned}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizResults;