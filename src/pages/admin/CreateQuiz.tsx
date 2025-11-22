import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { CreateQuizRequest } from '../../types';
import { adminQuizService } from '../../services/adminQuiz';

const CreateQuiz: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateQuizRequest>({
    title: '',
    description: '',
    time_limit: 0, // 0 = no time limit
    is_active: true,
    passing_score: 70,
    show_results_immediately: false,
    allow_retakes: false,
    max_attempts: 1,
  });

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

    setLoading(true);
    try {
      const newQuiz = await adminQuizService.createQuiz(formData as any);
      toast.success('Quiz created successfully! Now add questions to your quiz.');
      navigate(`/admin/quizzes/${newQuiz.id}?new=true`);
    } catch (error: any) {
      console.error('Create quiz error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create quiz';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    navigate('/admin/quizzes');
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Create New Quiz</h1>
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">
              Quiz Title *
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter quiz title"
              maxLength={200}
              required
            />
            <p className="mt-1 text-sm text-gray-500">
              {formData.title.length}/200 characters
            </p>
          </div>
          
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter quiz description"
            />
          </div>
          
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label htmlFor="time_limit" className="block text-sm font-medium text-gray-700">
                Time Limit (minutes)
              </label>
              <input
                type="number"
                id="time_limit"
                name="time_limit"
                value={formData.time_limit}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="0"
                min={0}
                max={1440}
              />
              <p className="mt-1 text-sm text-gray-500">
                0 = no time limit, max 1440 minutes (24 hours)
              </p>
            </div>
            
            <div>
              <label htmlFor="passing_score" className="block text-sm font-medium text-gray-700">
                Passing Score (%)
              </label>
              <input
                type="number"
                id="passing_score"
                name="passing_score"
                value={formData.passing_score}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="70"
                min={0}
                max={100}
              />
            </div>
          </div>

          <div>
            <label htmlFor="max_attempts" className="block text-sm font-medium text-gray-700">
              Max Attempts
            </label>
            <input
              type="number"
              id="max_attempts"
              name="max_attempts"
              value={formData.max_attempts}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="1"
              min={1}
            />
            <p className="mt-1 text-sm text-gray-500">
              Maximum number of attempts allowed per participant
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center">
              <input
                id="is_active"
                name="is_active"
                type="checkbox"
                checked={formData.is_active}
                onChange={handleInputChange}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                Active
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
              <label htmlFor="show_results_immediately" className="ml-2 block text-sm text-gray-900">
                Show results immediately after submission
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
              <label htmlFor="allow_retakes" className="ml-2 block text-sm text-gray-900">
                Allow retakes
              </label>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleCancel}
              disabled={loading}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Quiz'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateQuiz;