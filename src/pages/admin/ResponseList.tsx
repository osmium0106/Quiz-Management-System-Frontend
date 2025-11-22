import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { QuizResponse } from '../../types';
import { responseService } from '../../services/response';

const ResponseList: React.FC = () => {
  const navigate = useNavigate();
  const [responses, setResponses] = useState<QuizResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [ordering, setOrdering] = useState('-submitted_at'); // Default to newest first

  useEffect(() => {
    loadResponses();
  }, [currentPage, searchTerm, ordering]);

  const loadResponses = async () => {
    try {
      setLoading(true);
      console.log('Making request to public endpoint without auth...');
      const response = await responseService.getResponses({
        page: currentPage,
        search: searchTerm,
        ordering: ordering,
      });
      
      console.log('Response received:', response);
      setResponses(response.results || []);
      setTotalCount(response.count || 0);
    } catch (error: any) {
      console.error('Failed to load responses:', error);
      
      // Handle authentication errors
      if (error.message.includes('Authentication')) {
        toast.error('Please log in to view quiz responses');
        // Optionally redirect to login page
        // navigate('/login');
      } else {
        const errorMessage = error.message || 'Failed to load quiz responses';
        toast.error(`Error: ${errorMessage}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    loadResponses();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPassedStatusColor = (isPassed: boolean) => {
    return isPassed 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const getScoreColor = (percentage: string) => {
    const score = parseFloat(percentage);
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center min-h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white shadow-sm rounded-lg mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Quiz Responses</h1>
                <p className="text-sm text-gray-600 mt-1">
                  {totalCount} total response{totalCount !== 1 ? 's' : ''}
                </p>
              </div>
              
              {/* Search and Filter Controls */}
              <div className="flex space-x-4">
                <form onSubmit={handleSearch} className="flex">
                  <input
                    type="text"
                    placeholder="Search responses..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border-gray-300 rounded-l-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-r-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    Search
                  </button>
                </form>
                
                <select
                  value={ordering}
                  onChange={(e) => setOrdering(e.target.value)}
                  className="border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                >
                  <option value="-submitted_at">Newest First</option>
                  <option value="submitted_at">Oldest First</option>
                  <option value="-percentage">Highest Score</option>
                  <option value="percentage">Lowest Score</option>
                  <option value="quiz_title">Quiz Name A-Z</option>
                  <option value="-quiz_title">Quiz Name Z-A</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Response Cards */}
        {responses.length === 0 ? (
          <div className="bg-white shadow-sm rounded-lg">
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No responses found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm ? 'Try adjusting your search criteria.' : 'No quiz responses have been submitted yet.'}
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {responses.map((response) => (
              <div
                key={response.id}
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden cursor-pointer"
                onClick={() => navigate(`/admin/responses/${response.id.toString()}`)}
              >
                {/* Card Header */}
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {response.quiz_title}
                    </h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPassedStatusColor(response.is_passed)}`}>
                      {response.is_passed ? 'Passed' : 'Failed'}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="px-6 py-4">
                  {/* Participant Info */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <span className="text-indigo-600 font-medium text-sm">
                          {response.participant_name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{response.participant_name}</p>
                        <p className="text-xs text-gray-500">{response.participant_email}</p>
                      </div>
                    </div>
                  </div>

                  {/* Score Information */}
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Score:</span>
                      <span className={`text-lg font-bold ${getScoreColor(response.percentage.toString())}`}>
                        {response.percentage}%
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Points:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {response.score}/{response.total_points}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Questions:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {response.correct_answers_count}/{response.total_questions_count}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Attempt:</span>
                      <span className="text-sm font-medium text-gray-900">
                        #{response.attempt_number}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Submitted</span>
                    <span>{formatDate(response.submitted_at)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > 20 && (
          <div className="bg-white shadow-sm rounded-lg mt-6">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-700">
                    Showing {(currentPage - 1) * 20 + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} results
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>
                  
                  <span className="px-3 py-1 text-sm bg-indigo-100 text-indigo-600 rounded-md">
                    {currentPage}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage * 20 >= totalCount}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResponseList;