import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicService } from '../../services/public';

const Home: React.FC = () => {
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await publicService.getPublicQuizzes();
        console.log('Full API Response:', response); // Debug log
        console.log('Response structure:', {
          results: response?.results,
          count: response?.count,
          next: response?.next,
          previous: response?.previous
        });
        
        // The response is a PaginatedResponse<PublicQuiz> directly
        const apiQuizzes = response?.results || [];
        
        console.log('Extracted quizzes:', apiQuizzes); // Debug log
        console.log('Quiz count:', apiQuizzes.length);
        
        // Always use API data, even if empty
        setQuizzes(apiQuizzes);
        
        if (apiQuizzes.length === 0) {
          setError('No public quizzes available from /public/quizzes/ endpoint');
        } else {
          setError(''); // Clear any previous error
        }
      } catch (err: any) {
        console.error('Error fetching public quizzes:', err);
        console.error('Error details:', {
          message: err.message,
          response: err.response?.data,
          status: err.response?.status
        });
        setError(`API Error: ${err.message || 'Unable to fetch quizzes from /public/quizzes/'}`);
        setQuizzes([]); // Show empty instead of sample data
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);



  const quizCategories = [
    { name: 'Art & Culture', icon: '🎨', count: '24 quizzes' },
    { name: 'Entertainment', icon: '🎬', count: '18 quizzes' },
    { name: 'Science', icon: '🔬', count: '31 quizzes' },
    { name: 'History', icon: '🏛️', count: '22 quizzes' },
    { name: 'Sports', icon: '⚽', count: '15 quizzes' },
    { name: 'Trivia', icon: '🧩', count: '42 quizzes' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">




      {/* Explore Categories Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Explore Quiz Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {quizCategories.map((category) => (
              <Link
                key={category.name}
                to={`/quizzes/category/${category.name.toLowerCase().replace(' & ', '-').replace(' ', '-')}`}
                className="bg-white rounded-xl p-6 text-center hover:shadow-lg transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                  {category.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{category.name}</h3>
                <p className="text-sm text-gray-500">{category.count}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Quizzes for You Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quizzes for You</h2>
            <p className="text-lg text-gray-600">Discover popular quizzes and test your knowledge</p>
          </div>

          {/* API Endpoint Info */}
          <div className="text-center mb-6">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 max-w-lg mx-auto">
              <p className="text-green-700 font-medium text-sm">
                🔗 Using: GET /public/quizzes/ | Found: {quizzes.length} quiz{quizzes.length !== 1 ? 'es' : ''}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
              <p className="text-gray-600">Loading from /public/quizzes/...</p>
            </div>
          ) : error ? (
            <div className="text-center mb-6">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 max-w-lg mx-auto">
                <p className="text-red-700 font-medium text-sm">❌ {error}</p>
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {quizzes.map((quiz) => (
              <div key={quiz.id} className="group bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden">
                {/* Card Header with Gradient */}
                <div className="h-2 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                
                <div className="p-6">
                  {/* Title and Status */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                        {quiz.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {quiz.description || 'No description available'}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-3 ${
                      (quiz.is_active !== false) 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {(quiz.is_active !== false) ? '🟢 Active' : '⚪ Inactive'}
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center bg-indigo-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-indigo-600">
                        {quiz.total_questions || 0}
                      </div>
                      <div className="text-xs text-indigo-500 font-medium">Questions</div>
                    </div>
                    <div className="text-center bg-green-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-green-600">
                        {quiz.total_points || (quiz.total_questions * 10) || 0}
                      </div>
                      <div className="text-xs text-green-500 font-medium">Points</div>
                    </div>
                    <div className="text-center bg-orange-50 rounded-lg p-3">
                      <div className="text-2xl font-bold text-orange-600">
                        {quiz.time_limit === 1440 ? '∞' : `${quiz.time_limit || 0}m`}
                      </div>
                      <div className="text-xs text-orange-500 font-medium">
                        {quiz.time_limit === 1440 ? 'No Limit' : 'Time Limit'}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mb-4">
                    <Link
                      to={`/quiz/${quiz.id}`}
                      className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-center py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
                    >
                      🚀 Take Quiz
                    </Link>
                    <Link
                      to={`/quiz/${quiz.id}/preview`}
                      className="px-4 py-3 border-2 border-indigo-200 text-indigo-600 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200 font-semibold"
                    >
                      👁️ Preview
                    </Link>
                  </div>

                  {/* Footer Info */}
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500 space-x-4">
                      <span className="flex items-center">
                        📅 {quiz.created_at ? new Date(quiz.created_at).toLocaleDateString() : 'Recently'}
                      </span>
                      {quiz.created_by_name && (
                        <span className="flex items-center">
                          👤 {quiz.created_by_name}
                        </span>
                      )}
                      {quiz.total_responses !== undefined && (
                        <span className="flex items-center">
                          📊 {quiz.total_responses} responses
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {quizzes.length === 0 && !loading && (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🎯</div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No quizzes found</h3>
              <p className="text-gray-600 text-lg mb-6">Be the first to create an amazing quiz!</p>
              <Link
                to="/admin/quizzes/create"
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white font-semibold rounded-xl hover:bg-indigo-700 transition-colors"
              >
                ➕ Create Your First Quiz
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Create Quiz Section */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-6">Create a Quiz</h2>
          <p className="text-xl text-gray-600 mb-12">
            Build your own quiz, or let AI generate one for you.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Quiz Editor */}
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">✏️</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Quiz Editor</h3>
              <p className="text-gray-600 mb-6">Create custom quizzes with our intuitive editor. Add images, videos, and multiple question types.</p>
              <Link
                to="/admin/quizzes/create"
                className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
              >
                Start Creating
              </Link>
            </div>

            {/* AI Quiz Generator */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-8 hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Quiz Generator</h3>
              <p className="text-gray-600 mb-6">Generate quizzes instantly from any topic or upload documents. AI does the work for you.</p>
              <Link
                to="/admin/quizzes/ai-create"
                className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors"
              >
                Generate with AI
              </Link>
            </div>
          </div>

          <div className="bg-indigo-50 rounded-xl p-6 inline-block">
            <p className="text-lg font-semibold text-indigo-800">
              🎉 Play for free with up to <span className="text-indigo-600">300 participants</span>
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Join or Create</h3>
              <p className="text-gray-600">Enter a PIN to join an existing quiz, or create your own from scratch.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Share & Play</h3>
              <p className="text-gray-600">Share your quiz PIN with participants and start playing together.</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">See Results</h3>
              <p className="text-gray-600">Get instant results and detailed analytics for all participants.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Trusted by Educators & Teams Worldwide</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">10K+</div>
              <div className="text-gray-600">Teachers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">50K+</div>
              <div className="text-gray-600">Students</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">5K+</div>
              <div className="text-gray-600">Streamers</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-indigo-600">100K+</div>
              <div className="text-gray-600">Quizzes Created</div>
            </div>
          </div>
          <p className="text-lg text-gray-600">
            "Perfect for remote learning and team building activities. Our students love it!"
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="text-2xl font-bold text-white mb-4">Quiz Management System</div>
              <p className="text-gray-400">
                The ultimate platform for creating and playing interactive quizzes.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white transition-colors">Features</Link></li>
                <li><Link to="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
                <li><Link to="/templates" className="hover:text-white transition-colors">Templates</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/help" className="hover:text-white transition-colors">Help Center</Link></li>
                <li><Link to="/contact" className="hover:text-white transition-colors">Contact</Link></li>
                <li><Link to="/faq" className="hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
                <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Use</Link></li>
                <li><Link to="/about" className="hover:text-white transition-colors">About</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 Quiz Management System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;