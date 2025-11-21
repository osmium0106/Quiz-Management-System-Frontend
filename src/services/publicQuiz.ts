import apiClient from './api';

export interface QuizSubmission {
  participant_name: string;
  participant_email: string;
  answers: AnswerSubmission[];
}

export interface AnswerSubmission {
  question_id: number;
  selected_option_id?: number;
  text_answer?: string;
}

export interface QuizResult {
  quiz_title: string;
  participant_name: string;
  score: string;
  total_points: number;
  percentage: string;
  is_passed: boolean;
  submitted_at: string;
  attempt_number: number;
  correct_answers_count: number;
  total_questions_count: number;
  answers: Answer[];
}

export interface Answer {
  question_text: string;
  question_type: string;
  selected_option_text: string;
  text_answer: string;
  is_correct: boolean;
  points_earned: string;
  correct_option_text: string;
  explanation: string;
}

export interface QuizSubmissionResponse {
  error: boolean;
  message: string;
  data: QuizResult;
  status_code: number;
}

export interface QuizPublic {
  id: number;
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  show_results_immediately: boolean;
  allow_retakes: boolean;
  max_attempts: number;
  questions: QuestionPublic[];
  total_questions: string;
  total_points: string;
}

export interface QuestionPublic {
  id: number;
  question_text: string;
  question_type: 'MCQ' | 'multiple_choice' | 'mcq' | 'text' | 'TEXT' | 'short_answer' | 'true_false' | 'TRUE_FALSE';
  order: number;
  points: number;
  is_required: boolean;
  options: QuestionOption[];
}

export interface QuestionOption {
  id: number;
  option_text: string;
  is_correct: boolean;
}

export const publicQuizService = {
  // Get quiz details with questions
  getQuiz: async (id: number): Promise<QuizPublic> => {
    const response = await apiClient.get<QuizPublic>(`/public/quizzes/${id}/`);
    return response.data;
  },

  // Submit quiz answers
  submitQuiz: async (quizId: number, submission: QuizSubmission): Promise<QuizResult> => {
    const response = await apiClient.post<QuizSubmissionResponse>(
      `/public/quizzes/${quizId}/submit/`,
      submission
    );
    return response.data.data; // Extract data from wrapped response
  },

  // Get results by session ID
  getResults: async (sessionId: string): Promise<QuizResult> => {
    const response = await apiClient.get<QuizResult>(`/public/results/${sessionId}/`);
    return response.data;
  },
};