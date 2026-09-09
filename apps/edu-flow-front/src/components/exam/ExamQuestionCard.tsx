import type { QuestionWithChoices } from '@/types/test-type';
import styles from './exam-question-card.module.scss';

interface ExamQuestionCardProps {
  question: QuestionWithChoices;
  questionNumber: number;
  selectedChoiceId?: string;
  onSelect: (choiceId: string) => void;
}

export function ExamQuestionCard({
  question,
  questionNumber,
  selectedChoiceId,
  onSelect,
}: ExamQuestionCardProps) {
  return (
    <section className={styles.card} aria-labelledby={`question-${question.id}`}>
      <span className={styles.number}>{questionNumber}</span>
      <h2 id={`question-${question.id}`} className={styles.questionText}>
        {question.questionText}
      </h2>
      <div className={styles.answers} role="radiogroup" aria-label="ตัวเลือกคำตอบ">
        {question.choices.map((choice, index) => {
          const isSelected = selectedChoiceId === choice.id;
          return (
            <button
              className={`${styles.answer} ${isSelected ? styles.selected : ''}`}
              type="button"
              role="radio"
              aria-checked={isSelected}
              key={choice.id}
              onClick={() => onSelect(choice.id)}
              id={`answer-${question.id}-${choice.id}`}
            >
              <span className={styles.choiceLabel} aria-hidden="true">
                {String.fromCharCode(65 + index)}
              </span>
              <span>{choice.value}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
