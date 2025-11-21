import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { publicQuizService, QuizPublic, AnswerSubmission } from '../../services/publicQuiz';
import '../../styles/quiz-3d.css';

const TakeQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const isPreview = location.pathname.includes('/preview');

  const [quiz, setQuiz] = useState<QuizPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{ [questionId: number]: AnswerSubmission }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [startTime] = useState(new Date());
  startTime; // Prevent unused variable warning
  const [showParticipantForm, setShowParticipantForm] = useState(!isPreview);
  const [participantInfo, setParticipantInfo] = useState({
    name: '',
    email: ''
  });
  const [backgroundMusic, setBackgroundMusic] = useState<HTMLAudioElement | null>(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  // Load quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const quizData = await publicQuizService.getQuiz(Number(id));
        setQuiz(quizData);
        
        // Set timer if quiz has time limit
        if (quizData.time_limit > 0 && quizData.time_limit !== 1440) {
          setTimeLeft(quizData.time_limit * 60); // Convert minutes to seconds
        }
      } catch (err) {
        console.error('Error fetching quiz:', err);
        setError('Failed to load quiz. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchQuiz();
  }, [id]);

  // Initialize background music
  useEffect(() => {
    if (!isPreview && !showParticipantForm) {
      // Free background music for learning/quiz contexts
      const audio = new Audio('https://www.soundjay.com/misc/sounds/fail-buzzer-02.mp3');
      audio.loop = true;
      audio.volume = 0.3;
      setBackgroundMusic(audio);
      
      // Try to play music (browser may block autoplay)
      const playMusic = async () => {
        try {
          await audio.play();
          setIsMusicPlaying(true);
        } catch (error) {
          console.log('Autoplay blocked - user interaction needed');
        }
      };
      
      playMusic();

      return () => {
        audio.pause();
        audio.currentTime = 0;
      };
    }
  }, [isPreview, showParticipantForm]);

  // Timer countdown
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || isPreview) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === null || prev <= 1) {
          // Time's up - auto submit
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isPreview]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (questionId: number, selectedOptionId?: number, textAnswer?: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        question_id: questionId,
        selected_option_id: selectedOptionId,
        text_answer: textAnswer
      }
    }));
  };

  const handleNext = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleStartQuiz = () => {
    if (participantInfo.name.trim() && participantInfo.email.trim()) {
      setShowParticipantForm(false);
    }
  };

  const toggleMusic = () => {
    if (backgroundMusic) {
      if (isMusicPlaying) {
        backgroundMusic.pause();
        setIsMusicPlaying(false);
      } else {
        backgroundMusic.play().catch(console.error);
        setIsMusicPlaying(true);
      }
    }
  };

  const handleSubmit = async () => {
    if (!quiz || isPreview) return;

    setIsSubmitting(true);
    try {
      const submission = {
        participant_name: participantInfo.name,
        participant_email: participantInfo.email,
        answers: Object.values(answers)
      };

      const result = await publicQuizService.submitQuiz(quiz.id, submission);
      
      // Navigate to results page with a meaningful identifier
      const resultId = `${quiz.id}-${result.attempt_number}-${Date.now()}`;
      navigate(`/results/${resultId}`, {
        state: { result, quizTitle: quiz.title }
      });
    } catch (err) {
      console.error('Error submitting quiz:', err);
      setError('Failed to submit quiz. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-6">❌</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Error Loading Quiz</h2>
          <p className="text-gray-600 mb-6">{error}</p>
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

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Quiz not found</h2>
        </div>
      </div>
    );
  }

  // Show participant info form
  if (showParticipantForm) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white text-2xl">📝</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h1>
            <p className="text-gray-600 mb-4">{quiz.description}</p>
            <div className="bg-indigo-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold text-indigo-800">Questions:</span>
                  <span className="text-indigo-600 ml-2">{quiz.total_questions}</span>
                </div>
                <div>
                  <span className="font-semibold text-indigo-800">Points:</span>
                  <span className="text-indigo-600 ml-2">{quiz.total_points}</span>
                </div>
                <div>
                  <span className="font-semibold text-indigo-800">Time Limit:</span>
                  <span className="text-indigo-600 ml-2">
                    {quiz.time_limit === 1440 ? 'Unlimited' : `${quiz.time_limit} min`}
                  </span>
                </div>
                <div>
                  <span className="font-semibold text-indigo-800">Pass Score:</span>
                  <span className="text-indigo-600 ml-2">{quiz.passing_score}%</span>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleStartQuiz(); }} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                id="name"
                value={participantInfo.name}
                onChange={(e) => setParticipantInfo(prev => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Your Email *
              </label>
              <input
                type="email"
                id="email"
                value={participantInfo.email}
                onChange={(e) => setParticipantInfo(prev => ({ ...prev, email: e.target.value }))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
            >
              Start Quiz 🚀
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
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  // 3D Floating Elements Component
  const FloatingElements = () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Floating Geometric Shapes */}
      <div className="absolute top-20 left-10 w-16 h-16 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full opacity-20 animate-bounce-slow floating-element-1"></div>
      <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-r from-blue-400 to-cyan-400 transform rotate-45 opacity-30 animate-pulse floating-element-2"></div>
      <div className="absolute bottom-40 left-20 w-20 h-20 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full opacity-25 animate-ping-slow floating-element-3"></div>
      <div className="absolute top-1/3 right-10 w-8 h-20 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full opacity-20 animate-sway floating-element-4"></div>
      <div className="absolute bottom-20 right-1/3 w-14 h-14 bg-gradient-to-r from-indigo-400 to-purple-400 transform rotate-12 opacity-25 animate-float floating-element-5"></div>
      
      {/* Mathematical Symbols */}
      <div className="absolute top-32 left-1/3 text-6xl text-blue-300 opacity-10 animate-spin-slow">📐</div>
      <div className="absolute bottom-32 right-1/4 text-5xl text-green-300 opacity-15 animate-bounce-slow">🔢</div>
      <div className="absolute top-1/2 left-16 text-4xl text-purple-300 opacity-10 animate-pulse">📊</div>
      <div className="absolute bottom-1/3 left-1/2 text-7xl text-pink-300 opacity-5 animate-float">🎯</div>
      
      {/* Stars and Sparkles */}
      <div className="absolute top-16 right-1/3 text-3xl text-yellow-400 opacity-30 animate-twinkle">⭐</div>
      <div className="absolute bottom-16 left-1/4 text-2xl text-cyan-400 opacity-40 animate-twinkle-delayed">✨</div>
      <div className="absolute top-2/3 right-16 text-4xl text-purple-400 opacity-20 animate-spin-slow">🌟</div>
      
      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className={`absolute w-2 h-2 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-30 animate-float-particle-${i % 4 + 1}`}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${i * 0.5}s`
          }}
        ></div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 py-8 relative overflow-hidden">
      {/* 3D Background Elements */}
      <FloatingElements />
      
      {/* Music Control Button */}
      {!isPreview && !showParticipantForm && (
        <button
          onClick={toggleMusic}
          className="fixed top-4 right-4 z-50 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center group"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">
            {isMusicPlaying ? '🔊' : '🔇'}
          </span>
        </button>
      )}
      
      <div className="max-w-4xl mx-auto px-4 relative z-10">
        {/* Quiz Header */}
        <div className="quiz-card-3d rounded-2xl shadow-lg mb-6">
          <div className="px-8 py-6 border-b border-white/20">
            <div className="flex items-center justify-between mb-4">
              <h1 className="text-2xl font-bold text-gray-900">
                {quiz.title}
                {isPreview && <span className="ml-2 text-sm bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">Preview Mode</span>}
              </h1>
              {timeLeft !== null && !isPreview && (
                <div className={`text-xl font-bold ${timeLeft < 300 ? 'text-red-600' : 'text-indigo-600'}`}>
                  ⏰ {formatTime(timeLeft)}
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-white/30 rounded-full h-4 mb-2 overflow-hidden">
              <div 
                className="progress-3d h-4 rounded-full transition-all duration-500 shadow-lg" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">
              Question {currentQuestionIndex + 1} of {quiz.questions.length}
              {currentQuestion.points > 0 && ` • ${currentQuestion.points} points`}
            </p>
          </div>
          
          {/* Question Content */}
          <div className="p-8">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">
                {currentQuestion.question_text}
                {currentQuestion.is_required && <span className="text-red-500 ml-1">*</span>}
              </h2>
              
              {/* Multiple Choice Questions */}
              {(currentQuestion.question_type === 'MCQ' || currentQuestion.question_type === 'multiple_choice' || currentQuestion.question_type === 'mcq') && (
                <div className="space-y-3">
                  {currentQuestion.options && currentQuestion.options.length > 0 ? (
                    currentQuestion.options.map((option) => (
                      <label 
                        key={option.id}
                        className="option-3d flex items-center p-5 rounded-2xl cursor-pointer transition-all group shadow-md hover:shadow-xl"
                      >
                        <input 
                          type="radio" 
                          name={`question-${currentQuestion.id}`}
                          value={option.id}
                          checked={answers[currentQuestion.id]?.selected_option_id === option.id}
                          onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                          className="mr-4 w-5 h-5 text-indigo-600"
                          disabled={isPreview}
                        />
                        <span className="text-gray-800 group-hover:text-indigo-700 font-medium">
                          {option.option_text}
                        </span>
                      </label>
                    ))
                  ) : (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                      <p className="text-yellow-800">No options available for this question.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Text Questions (Short Answer) */}
              {(currentQuestion.question_type === 'text' || currentQuestion.question_type === 'short_answer' || currentQuestion.question_type === 'TEXT') && (
                <div className="relative">
                  <textarea
                    value={answers[currentQuestion.id]?.text_answer || ''}
                    onChange={(e) => handleAnswerChange(currentQuestion.id, undefined, e.target.value)}
                    placeholder="✨ Type your amazing answer here..."
                    className="w-full p-6 glass-effect rounded-2xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-200/50 transition-all resize-none shadow-lg text-lg"
                    rows={4}
                    disabled={isPreview}
                  />
                  <div className="absolute top-2 right-2 text-2xl opacity-20">💭</div>
                </div>
              )}

              {/* True/False Questions */}
              {(currentQuestion.question_type === 'true_false' || currentQuestion.question_type === 'TRUE_FALSE') && (
                <div className="space-y-3">
                  {[
                    { id: 'true', text: 'True', value: true },
                    { id: 'false', text: 'False', value: false }
                  ].map((option) => (
                    <label 
                      key={option.id}
                      className="option-3d flex items-center p-5 rounded-2xl cursor-pointer transition-all group shadow-md hover:shadow-xl"
                    >
                      <input 
                        type="radio" 
                        name={`question-${currentQuestion.id}`}
                        value={option.text}
                        checked={answers[currentQuestion.id]?.text_answer === option.text}
                        onChange={() => handleAnswerChange(currentQuestion.id, undefined, option.text)}
                        className="mr-4 w-5 h-5 text-indigo-600"
                        disabled={isPreview}
                      />
                      <span className="text-gray-800 group-hover:text-indigo-700 font-medium">
                        {option.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button 
                onClick={handlePrevious}
                disabled={currentQuestionIndex === 0}
                className="btn-3d px-8 py-4 glass-effect text-indigo-700 rounded-2xl hover:bg-white/40 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-lg text-lg"
              >
                🔙 Previous
              </button>
              
              <div className="text-center bg-white/20 rounded-full px-6 py-3 backdrop-blur-sm">
                <div className="text-lg font-bold text-purple-700">
                  {Object.keys(answers).length} of {quiz.questions.length} 
                </div>
                <div className="text-sm text-purple-600">answered</div>
              </div>
              
              {isLastQuestion ? (
                <button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || isPreview}
                  className="btn-3d px-10 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all shadow-lg text-lg"
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      🚀 Submitting...
                    </span>
                  ) : (
                    '🎉 Submit Quiz!'
                  )}
                </button>
              ) : (
                <button 
                  onClick={handleNext}
                  className="btn-3d px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl hover:from-indigo-600 hover:to-purple-700 font-bold transition-all shadow-lg text-lg"
                >
                  Next 🔜
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigation */}
        <div className="quiz-card-3d rounded-2xl shadow-lg p-8">
          <h3 className="text-lg font-bold text-purple-700 mb-6 flex items-center">
            🧭 Quick Navigation
          </h3>
          <div className="grid grid-cols-5 sm:grid-cols-10 gap-3">
            {quiz.questions.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentQuestionIndex(index)}
                className={`btn-3d w-12 h-12 rounded-2xl font-bold transition-all text-lg shadow-md ${
                  index === currentQuestionIndex
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg'
                    : answers[quiz.questions[index].id]
                    ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white hover:from-green-500 hover:to-emerald-600'
                    : 'glass-effect text-purple-600 hover:bg-white/40'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TakeQuiz;