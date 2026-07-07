import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface ExamState {
    currentQuestion: number
    selectedAnswers: Record<number, number>
    isSubmitted: boolean
    timeLeft: number
    violations: number
    
    // Actions
    setCurrentQuestion: (index: number) => void
    selectAnswer: (questionID: number, answerId: number) => void
    submitExam: () => void
    decrementTime: () => void
    addViolation: (reason: string, maxViolations: number) => number
    resetExam: () => void
}

const INITIAL_TIME = 120 * 60 // 120 minutes

export const useExamStore = create<ExamState>()(
    persist(
        (set, get) => ({
            currentQuestion: 0,
            selectedAnswers: {},
            isSubmitted: false,
            timeLeft: INITIAL_TIME,
            violations: 0,

            setCurrentQuestion: (index) => set({ currentQuestion: index }),
            
            selectAnswer: (questionID, answerId) => set((state) => {
                if (state.isSubmitted) return state
                return {
                    selectedAnswers: { ...state.selectedAnswers, [questionID]: answerId }
                }
            }),

            submitExam: () => set({ isSubmitted: true }),

            decrementTime: () => set((state) => {
                if (state.isSubmitted || state.timeLeft <= 0) return state
                if (state.timeLeft <= 1) {
                    return { timeLeft: 0, isSubmitted: true }
                }
                return { timeLeft: state.timeLeft - 1 }
            }),

            addViolation: (reason, maxViolations) => {
                let currentViolations = 0
                set((state) => {
                    const next = state.violations + 1
                    console.warn(`Violation: ${reason}, count: ${next}`)
                    currentViolations = next
                    
                    if (next >= maxViolations) {
                        return { violations: next, isSubmitted: true }
                    }
                    return { violations: next }
                })
                return currentViolations
            },

            resetExam: () => set({
                currentQuestion: 0,
                selectedAnswers: {},
                isSubmitted: false,
                timeLeft: INITIAL_TIME,
                violations: 0
            })
        }),
        {
            name: 'exam-storage',
            storage: createJSONStorage(() => localStorage)
        }
    )
)
