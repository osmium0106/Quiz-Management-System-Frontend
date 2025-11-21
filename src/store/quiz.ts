import { create } from 'zustand';
import { PublicQuizDetail, SubmitAnswerRequest, QuizTakingState } from '../types';

interface QuizStore extends QuizTakingState {
  // Actions
  setCurrentQuiz: (quiz: PublicQuizDetail | null) => void;
  setAnswer: (questionId: number, answer: SubmitAnswerRequest) => void;
  setTimeRemaining: (time: number) => void;
  setSubmitting: (submitting: boolean) => void;
  setParticipantInfo: (info: { name: string; email: string }) => void;
  clearQuizState: () => void;
  getAnswer: (questionId: number) => SubmitAnswerRequest | undefined;
  getTotalAnswered: () => number;
  getRequiredUnanswered: () => number[];
}

export const useQuizStore = create<QuizStore>((set, get) => ({
  // Initial state
  currentQuiz: null,
  answers: {},
  timeRemaining: 0,
  isSubmitting: false,
  participantInfo: null,

  // Actions
  setCurrentQuiz: (quiz) => {
    set({ 
      currentQuiz: quiz,
      answers: {},
      timeRemaining: quiz ? quiz.time_limit * 60 : 0,
      isSubmitting: false,
    });
  },

  setAnswer: (questionId, answer) => {
    set((state) => ({
      answers: {
        ...state.answers,
        [questionId]: answer,
      },
    }));
  },

  setTimeRemaining: (time) => {
    set({ timeRemaining: time });
  },

  setSubmitting: (submitting) => {
    set({ isSubmitting: submitting });
  },

  setParticipantInfo: (info) => {
    set({ participantInfo: info });
  },

  clearQuizState: () => {
    set({
      currentQuiz: null,
      answers: {},
      timeRemaining: 0,
      isSubmitting: false,
      participantInfo: null,
    });
  },

  getAnswer: (questionId) => {
    const { answers } = get();
    return answers[questionId];
  },

  getTotalAnswered: () => {
    const { answers } = get();
    return Object.keys(answers).length;
  },

  getRequiredUnanswered: () => {
    const { currentQuiz, answers } = get();
    if (!currentQuiz) return [];

    return currentQuiz.questions
      .filter((q) => q.is_required && !answers[q.id])
      .map((q) => q.id);
  },
}));