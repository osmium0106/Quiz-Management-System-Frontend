import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreateQuizRequest, Quiz, Question, CreateQuestionRequest, QuestionType, MCQOption } from '../../types';
import { adminQuizService } from '../../services/adminQuiz';

const EditQuiz: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [activeTab, setActiveTab] = useState<'quiz' | 'questions'>('quiz');
  const [showAddQuestion, setShowAddQuestion] = useState(false);
  const [questionLoading, setQuestionLoading] = useState(false);
  
  const [formData, setFormData] = useState<CreateQuizRequest>({
    title: '',
    description: '',
    time_limit: 0,
    is_active: true,
    passing_score: 70,
    show_results_immediately: false,
    allow_retakes: false,
    max_attempts: 1,
  });

  const [questionForm, setQuestionForm] = useState<CreateQuestionRequest>({
    question_text: '',
    question_type: 'MCQ',
    order: 1,
    points: 1,
    is_required: true,
    explanation: '',
    options: [],
  });

  useEffect(() => {
    if (id) {
      loadQuiz();
    }
  }, [id]);

  const loadQuiz = async () => {
    try {
      if (!id || id === 'undefined') {
        toast.error('Invalid quiz ID');
        navigate('/admin/quizzes');
        return;
      }

      const quizId = parseInt(id);
      if (isNaN(quizId)) {
        toast.error('Invalid quiz ID format');
        navigate('/admin/quizzes');
        return;
      }

      setLoading(true);
      const [quizData, questionsData] = await Promise.all([
        adminQuizService.getQuiz(quizId),
        adminQuizService.getQuizQuestions(quizId)
      ]);
      
      setQuiz(quizData);
      setQuestions(questionsData.results || []);
      
      // Populate form data
      setFormData({
        title: quizData.title,
        description: quizData.description || '',
        time_limit: quizData.time_limit,
        is_active: quizData.is_active,
        passing_score: quizData.passing_score,
        show_results_immediately: quizData.show_results_immediately,
        allow_retakes: quizData.allow_retakes,
        max_attempts: quizData.max_attempts,
      });

      // Set next question order
      const maxOrder = questionsData.results?.length ? 
        Math.max(...questionsData.results.map(q => q.order || 0)) : 0;
      setQuestionForm(prev => ({ ...prev, order: maxOrder + 1 }));
    } catch (error: any) {
      console.error('Failed to load quiz:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to load quiz';
      toast.error(errorMessage);
      if (error.response?.status === 404) {
        navigate('/admin/quizzes');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      toast.error('Quiz title is required');
      return;
    }

    if (formData.title.length > 200) {
      toast.error('Quiz title must be 200 characters or less');
      return;
    }

    if (formData.time_limit < 0 || formData.time_limit > 1440) {
      toast.error('Time limit must be between 0 and 1440 minutes');
      return;
    }

    if (formData.passing_score < 0 || formData.passing_score > 100) {
      toast.error('Passing score must be between 0 and 100');
      return;
    }

    if (formData.max_attempts < 1) {
      toast.error('Max attempts must be at least 1');
      return;
    }

    if (!quiz) return;

    setSaving(true);
    try {
      await adminQuizService.updateQuiz(quiz.id, formData);
      toast.success('Quiz updated successfully!');
      navigate(`/admin/quizzes/${quiz.id}`);
    } catch (error: any) {
      console.error('Update quiz error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update quiz';
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate(`/admin/quizzes/${id}`);
  };

  // Question management functions
  const handleQuestionInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setQuestionForm(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setQuestionForm(prev => ({ ...prev, [name]: parseInt(value) || 0 }));
    } else {
      setQuestionForm(prev => ({ ...prev, [name]: value }));
      
      // When question type changes, reset options
      if (name === 'question_type') {
        const newType = value as QuestionType;
        if (newType === 'MCQ') {
          setQuestionForm(prev => ({ 
            ...prev, 
            options: [
              { option_text: '', is_correct: false, order: 1 },
              { option_text: '', is_correct: false, order: 2 }
            ]
          }));
        } else if (newType === 'TRUE_FALSE') {
          setQuestionForm(prev => ({ 
            ...prev, 
            options: [
              { option_text: 'True', is_correct: false, order: 1 },
              { option_text: 'False', is_correct: false, order: 2 }
            ]
          }));
        } else {
          setQuestionForm(prev => ({ ...prev, options: [] }));
        }
      }
    }
  };

  const handleOptionChange = (index: number, field: keyof Omit<MCQOption, 'id' | 'question'>, value: string | boolean) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options?.map((option, i) => 
        i === index ? { ...option, [field]: value } : option
      ) || []
    }));
  };

  const addOption = () => {
    const newOrder = (questionForm.options?.length || 0) + 1;
    setQuestionForm(prev => ({
      ...prev,
      options: [...(prev.options || []), { option_text: '', is_correct: false, order: newOrder }]
    }));
  };

  const removeOption = (index: number) => {
    setQuestionForm(prev => ({
      ...prev,
      options: prev.options?.filter((_, i) => i !== index) || []
    }));
  };

  const handleSubmitQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!questionForm.question_text.trim()) {
      toast.error('Question text is required');
      return;
    }

    if (questionForm.question_type === 'MCQ' && (!questionForm.options || questionForm.options.length < 2)) {
      toast.error('MCQ questions must have at least 2 options');
      return;
    }

    if ((questionForm.question_type === 'MCQ' || questionForm.question_type === 'TRUE_FALSE') && 
        (!questionForm.options || !questionForm.options.some(opt => opt.is_correct))) {
      toast.error('At least one option must be marked as correct');
      return;
    }

    if (questionForm.points < 1 || questionForm.points > 100) {
      toast.error('Points must be between 1 and 100');
      return;
    }

    if (!quiz) return;

    setQuestionLoading(true);
    try {
      const newQuestion = await adminQuizService.createQuizQuestion(quiz.id, questionForm);
      setQuestions(prev => [...prev, newQuestion]);
      setShowAddQuestion(false);
      
      // Reset form
      const nextOrder = Math.max(...questions.map(q => q.order || 0), questionForm.order) + 1;
      setQuestionForm({
        question_text: '',
        question_type: 'MCQ',
        order: nextOrder,
        points: 1,
        is_required: true,
        explanation: '',
        options: [],
      });
      
      toast.success('Question added successfully!');
    } catch (error: any) {
      console.error('Failed to create question:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create question';
      toast.error(errorMessage);
    } finally {
      setQuestionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Quiz not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Edit Quiz</h1>
              <p className="text-sm text-gray-600 mt-1">
                Editing: <span className="font-medium text-indigo-600">{quiz?.title}</span>
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              ← Back to Quiz Details
            </button>
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('quiz')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'quiz'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Quiz Settings
              </button>
              <button
                onClick={() => setActiveTab('questions')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'questions'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Questions ({questions.length})
              </button>
            </nav>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'quiz' && (
          <div className="bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-lg font-medium text-gray-900">Quiz Information</h3>
              <p className="text-sm text-gray-600">Update your quiz settings and configuration</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-1">
                  <label htmlFor="title" className="block text-sm font-semibold text-gray-700 mb-2">
                    Quiz Title *
                  </label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Enter an engaging quiz title"
                    maxLength={200}
                    required
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {formData.title.length}/200 characters
                  </p>
                </div>
                
                <div className="lg:col-span-1">
                  <label htmlFor="time_limit" className="block text-sm font-semibold text-gray-700 mb-2">
                    Time Limit (minutes)
                  </label>
                  <input
                    type="number"
                    id="time_limit"
                    name="time_limit"
                    value={formData.time_limit}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="0"
                    min={0}
                    max={1440}
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    0 = no time limit, max 1440 minutes (24 hours)
                  </p>
                </div>
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={4}
                  className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  placeholder="Provide a detailed description of your quiz..."
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="passing_score" className="block text-sm font-semibold text-gray-700 mb-2">
                    Passing Score (%)
                  </label>
                  <input
                    type="number"
                    id="passing_score"
                    name="passing_score"
                    value={formData.passing_score}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="70"
                    min={0}
                    max={100}
                  />
                </div>
                
                <div>
                  <label htmlFor="max_attempts" className="block text-sm font-semibold text-gray-700 mb-2">
                    Max Attempts
                  </label>
                  <input
                    type="number"
                    id="max_attempts"
                    name="max_attempts"
                    value={formData.max_attempts}
                    onChange={handleInputChange}
                    className="block w-full border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="1"
                    min={1}
                  />
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Quiz Options</h4>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <input
                      id="is_active"
                      name="is_active"
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="is_active" className="ml-3 text-sm text-gray-700">
                      <span className="font-medium">Active</span> - Quiz is available to participants
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="show_results_immediately"
                      name="show_results_immediately"
                      type="checkbox"
                      checked={formData.show_results_immediately}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="show_results_immediately" className="ml-3 text-sm text-gray-700">
                      <span className="font-medium">Show results immediately</span> after submission
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      id="allow_retakes"
                      name="allow_retakes"
                      type="checkbox"
                      checked={formData.allow_retakes}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="allow_retakes" className="ml-3 text-sm text-gray-700">
                      <span className="font-medium">Allow retakes</span> - Participants can retake the quiz
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="px-6 py-2 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {saving ? 'Saving Changes...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeTab === 'questions' && (
          <div className="space-y-6">
            {/* Questions Header */}
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">Questions</h3>
                    <p className="text-sm text-gray-600">Manage questions for this quiz</p>
                  </div>
                  <button
                    onClick={() => setShowAddQuestion(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Add Question
                  </button>
                </div>
              </div>
              
              <div className="p-6">
                {questions.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="mx-auto h-12 w-12 text-gray-400">
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No questions</h3>
                    <p className="mt-1 text-sm text-gray-500">Get started by adding your first question.</p>
                    <div className="mt-6">
                      <button
                        onClick={() => setShowAddQuestion(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700"
                      >
                        Add First Question
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {questions.map((question, index) => (
                      <div key={question.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {question.question_type}
                              </span>
                              <span className="text-sm text-gray-500">
                                {question.points} point(s)
                              </span>
                              {question.is_required && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                  Required
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-medium text-gray-900 mb-2">
                              {index + 1}. {question.question_text}
                            </h4>
                            {question.options && question.options.length > 0 && (
                              <div className="space-y-1">
                                {question.options.map((option, optIndex) => (
                                  <div key={option.id} className="flex items-center space-x-2 text-sm">
                                    <span className={`w-4 h-4 rounded-full flex items-center justify-center text-xs ${
                                      option.is_correct ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <span className={option.is_correct ? 'font-medium text-green-800' : 'text-gray-700'}>
                                      {option.option_text}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}
                            {question.explanation && (
                              <p className="mt-2 text-sm text-gray-600 italic">
                                Explanation: {question.explanation}
                              </p>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <button className="text-indigo-600 hover:text-indigo-900 text-sm">
                              Edit
                            </button>
                            <button className="text-red-600 hover:text-red-900 text-sm">
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Question Modal */}
      {showAddQuestion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-10 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-lg bg-white">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Add Question</h3>
                  <p className="text-sm text-gray-600 mt-1">Quiz: <span className="font-medium">{quiz?.title}</span></p>
                </div>
                <button
                  onClick={() => setShowAddQuestion(false)}
                  className="text-gray-400 hover:text-gray-600 p-2"
                >
                  <span className="sr-only">Close</span>
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="border-t border-gray-200 mb-6"></div>

              <form onSubmit={handleSubmitQuestion} className="space-y-6">
                {/* Question Text and Type */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question text:
                    </label>
                    <textarea
                      name="question_text"
                      value={questionForm.question_text}
                      onChange={handleQuestionInputChange}
                      rows={4}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      placeholder="Enter your question here..."
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Question type:
                    </label>
                    <select
                      name="question_type"
                      value={questionForm.question_type}
                      onChange={handleQuestionInputChange}
                      className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    >
                      <option value="MCQ">Multiple Choice (MCQ)</option>
                      <option value="TRUE_FALSE">True/False</option>
                      <option value="TEXT">Text Answer</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Order:
                      </label>
                      <input
                        type="number"
                        name="order"
                        value={questionForm.order}
                        onChange={handleQuestionInputChange}
                        min={0}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Points:
                      </label>
                      <input
                        type="number"
                        name="points"
                        value={questionForm.points}
                        onChange={handleQuestionInputChange}
                        min={1}
                        max={100}
                        className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                        required
                      />
                    </div>

                    <div className="flex items-center pt-6">
                      <input
                        type="checkbox"
                        name="is_required"
                        checked={questionForm.is_required}
                        onChange={handleQuestionInputChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label className="ml-2 text-sm text-gray-700">
                        Is required
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explanation:
                  </label>
                  <p className="text-xs text-gray-500 mb-2">Explanation shown after answering (optional)</p>
                  <textarea
                    name="explanation"
                    value={questionForm.explanation}
                    onChange={handleQuestionInputChange}
                    rows={2}
                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Provide an explanation for the correct answer..."
                  />
                </div>

                {(questionForm.question_type === 'MCQ' || questionForm.question_type === 'TRUE_FALSE') && (
                  <div>
                    <div className="flex justify-between items-center mb-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {questionForm.question_type === 'MCQ' ? 'MCQ Options' : 'True/False Options'}
                      </label>
                      {questionForm.question_type === 'MCQ' && (
                        <button
                          type="button"
                          onClick={addOption}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-600 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Add another MCQ Option
                        </button>
                      )}
                    </div>
                    
                    {/* Options Table */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-gray-200">
                              <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider py-2">
                                Option text
                              </th>
                              <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-2 w-24">
                                Is correct
                              </th>
                              <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-2 w-16">
                                Order
                              </th>
                              {questionForm.question_type === 'MCQ' && (
                                <th className="text-center text-xs font-medium text-gray-500 uppercase tracking-wider py-2 w-20">
                                  Delete?
                                </th>
                              )}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {questionForm.options?.map((option, index) => (
                              <tr key={index} className="bg-white">
                                <td className="py-2 pr-3">
                                  <input
                                    type="text"
                                    value={option.option_text}
                                    onChange={(e) => handleOptionChange(index, 'option_text', e.target.value)}
                                    className="w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                                    placeholder={`Option ${index + 1}`}
                                    disabled={questionForm.question_type === 'TRUE_FALSE'}
                                    required
                                  />
                                </td>
                                <td className="py-2 text-center">
                                  <input
                                    type="checkbox"
                                    checked={option.is_correct}
                                    onChange={(e) => handleOptionChange(index, 'is_correct', e.target.checked)}
                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                  />
                                </td>
                                <td className="py-2 text-center">
                                  <span className="text-sm text-gray-900">{option.order}</span>
                                </td>
                                {questionForm.question_type === 'MCQ' && (
                                  <td className="py-2 text-center">
                                    {questionForm.options && questionForm.options.length > 2 ? (
                                      <button
                                        type="button"
                                        onClick={() => removeOption(index)}
                                        className="text-red-600 hover:text-red-900 text-sm font-medium"
                                      >
                                        Remove
                                      </button>
                                    ) : (
                                      <span className="text-gray-400 text-sm">-</span>
                                    )}
                                  </td>
                                )}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      {questionForm.options && questionForm.options.length === 0 && (
                        <div className="text-center py-4">
                          <p className="text-sm text-gray-500">No options added yet</p>
                        </div>
                      )}
                    </div>
                    
                    <p className="mt-2 text-xs text-gray-500">
                      ✓ Check the "Is correct" box for the right answer(s)
                    </p>
                  </div>
                )}

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() => setShowAddQuestion(false)}
                      disabled={questionLoading}
                      className="px-6 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={questionLoading}
                      className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {questionLoading ? 'Adding Question...' : 'Add Question'}
                    </button>
                  </div>
                  
                  <div className="text-right text-sm text-gray-500">
                    <p>Question #{questionForm.order} for quiz: {quiz?.title}</p>
                    <p className="text-xs">{questions.length} question(s) already added</p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditQuiz;