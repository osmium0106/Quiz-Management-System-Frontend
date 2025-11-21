// User Management Types
export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  is_quiz_admin: boolean;
  date_joined: string;
  last_login?: string;
}

// Authentication Types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  password: string;
  password_confirm: string;
}

export interface LoginResponse {
  error: boolean;
  message: string;
  data: {
    user: User;
    access_token: string;
    refresh_token: string;
  };
  status_code: number;
}

export interface RegisterResponse {
  error: boolean;
  message: string;
  data: User;
  status_code: number;
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

export interface ChangePasswordRequest {
  old_password: string;
  new_password: string;
  new_password_confirm: string;
}

// Question Types
export type QuestionType = 'MCQ' | 'TRUE_FALSE' | 'TEXT';

export interface MCQOption {
  id: number;
  question?: number;
  option_text: string;
  is_correct?: boolean; // Only visible to admin
  order: number;
}

export interface Question {
  id: number;
  quiz: number;
  question_text: string;
  question_type: QuestionType;
  order: number;
  points: number;
  is_required: boolean;
  explanation: string;
  created_at: string;
  options: MCQOption[]; // Only for MCQ and TRUE_FALSE
}

export interface CreateQuestionRequest {
  question_text: string;
  question_type: QuestionType;
  order: number;
  points: number;
  is_required: boolean;
  explanation: string;
  options?: Omit<MCQOption, 'id' | 'question'>[];
}

// Quiz Types
export interface Quiz {
  id: number;
  title: string;
  description: string;
  created_by: number;
  created_by_name: string;
  time_limit: number; // minutes, 0 = no limit
  is_active: boolean;
  passing_score: number; // percentage 0-100
  show_results_immediately: boolean;
  allow_retakes: boolean;
  max_attempts: number;
  total_questions: number;
  total_points: number;
  total_responses: number;
  created_at: string;
  updated_at: string;
  questions?: Question[]; // Only in detail view
}

export interface CreateQuizRequest {
  title: string;
  description: string;
  time_limit: number;
  is_active: boolean;
  passing_score: number;
  show_results_immediately: boolean;
  allow_retakes: boolean;
  max_attempts: number;
}

export interface UpdateQuizRequest extends Partial<CreateQuizRequest> {}

// Public Quiz Types (without admin data)
export interface PublicQuiz {
  id: number;
  title: string;
  description: string;
  time_limit: number;
  total_questions: number;
}

export interface PublicQuizDetail {
  id: number;
  title: string;
  description: string;
  time_limit: number;
  passing_score: number;
  show_results_immediately: boolean;
  allow_retakes: boolean;
  max_attempts: number;
  total_questions: number;
  total_points: number;
  questions: Omit<Question, 'explanation'>[];
}

// Answer Types
export interface Answer {
  question_text: string;
  question_type: QuestionType;
  selected_option_text: string;
  text_answer: string;
  is_correct: boolean;
  points_earned: number;
  correct_option_text: string;
  explanation: string;
}

export interface SubmitAnswerRequest {
  question_id: number;
  selected_option_id?: number;
  text_answer?: string;
}

export interface SubmitQuizRequest {
  participant_name: string;
  participant_email: string;
  answers: SubmitAnswerRequest[];
}

// Quiz Response Types
export interface QuizResponse {
  id: number;
  quiz: number;
  quiz_title: string;
  participant_name: string;
  participant_email: string;
  session_id: string;
  score: number;
  total_points: number;
  percentage: number;
  is_passed: boolean;
  time_taken?: string; // Duration
  started_at: string;
  submitted_at: string;
  is_completed: boolean;
  attempt_number: number;
  correct_answers_count: number;
  total_questions_count: number;
  answers: Answer[];
}

export interface QuizSubmissionResponse {
  error: boolean;
  message: string;
  data: {
    quiz_title: string;
    participant_name: string;
    score: number;
    total_points: number;
    percentage: number;
    is_passed: boolean;
    submitted_at: string;
    attempt_number: number;
    correct_answers_count: number;
    total_questions_count: number;
    answers: Answer[];
  };
  status_code: number;
}

// API Response Types
export interface ApiResponse<T = any> {
  error: boolean;
  message?: string;
  data?: T;
  details?: Record<string, string[]>;
  status_code: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  error: true;
  message: string;
  details?: Record<string, string[]>;
  status_code: number;
}

// Form Types
export interface QuizFormData extends CreateQuizRequest {}
export interface QuestionFormData extends CreateQuestionRequest {}

// State Types
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface QuizTakingState {
  currentQuiz: PublicQuizDetail | null;
  answers: Record<number, SubmitAnswerRequest>;
  timeRemaining: number;
  isSubmitting: boolean;
  participantInfo: {
    name: string;
    email: string;
  } | null;
}

// Utility Types
export interface SelectOption {
  value: string | number;
  label: string;
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}