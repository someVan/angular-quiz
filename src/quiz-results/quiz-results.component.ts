import { Component, ElementRef, QueryList, ViewChildren } from '@angular/core';
import { Router } from '@angular/router';
import { QuizResult, SourceService } from '../services/source.service';
import { ScoreService } from '../services/score.service';
import { VoiceService } from '../services/voice.service';
import { Question, Quiz } from '../services/data.service.types';

@Component({
  selector: 'quiz-results',
  templateUrl: './quiz-results.component.html',
  styleUrls: ['./quiz-results.component.scss'],
})
export class QuizResultsComponent {
  @ViewChildren('description') descriptions: QueryList<
    ElementRef<HTMLTextAreaElement>
  >;
  progressColor: 'primary' | 'accent';
  score: number;
  total: number;
  feedbackMessage: string;
  answers: string[];
  quiz: Quiz;
  correctCount: number;
  maxScore = 0;

  constructor(
    private router: Router,
    private sourceService: SourceService,
    private voiceOverService: VoiceService,
    public scoreService: ScoreService
  ) {
    this.flatResults(this.sourceService.getResult());
    this.correctCount = this.quiz.questionsList.reduce(
      (pre, { answer }, index) => {
        return answer === this.answers[index] ? pre + 1 : pre;
      },
      0
    );
    this.score = Math.trunc((this.correctCount / this.total) * 100);
    this.feedbackMessage = this.getFeedbackMessage();
    this.progressColor = this.scoreService.getProgressColor(this.score);

    this.scoreService.updateQuizMax(this.quiz.title, this.score);
    this.maxScore = this.scoreService.getQuizMax(this.quiz.title);
  }

  trackQuestion(index: number, quiz: Question) {
    return quiz?.title;
  }

  isTopScore() {
    return this.score === 100;
  }

  flatResults({ quiz, answers }: QuizResult) {
    this.quiz = quiz;
    this.answers = answers;
    this.total = quiz.questionsList.length;
  }

  isRelevant(question, optionLetter) {
    return (
      optionLetter === question.selected || optionLetter === question.answer
    );
  }

  isCorrect(question, optionLetter) {
    return (
      (question.selected === optionLetter &&
        question.selected === question.answer) ||
      optionLetter === question.answer
    );
  }

  isInCorrect(question, optionLetter) {
    return (
      question.selected === optionLetter &&
      question.selected !== question.answer
    );
  }

  goToList() {
    this.router.navigate(['/course'], {
      queryParams: { id: this.quiz.courseId },
    });
  }

  reset() {
    this.router.navigate(['/quiz'], {
      queryParams: {
        courseId: this.quiz.courseId,
        quizId: this.quiz.id,
      },
    });
  }

  getFeedbackMessage(): string {
    if (this.scoreService.hasPass(this.score)) {
      return 'Great job!';
    } else if (this.scoreService.hasAlmostPass(this.score)) {
      return 'Not bad, but you could do better.';
    } else {
      return 'Better luck next time!';
    }
  }

  ngAfterViewInit() {
    if (!this.descriptions) return;

    const messages = this.descriptions.map((el) =>
      el.nativeElement.textContent.trim()
    );
    this.voiceOverMessages(messages);
  }

  voiceOverMessages(messages) {
    this.voiceOverService.voiceOverMessages(messages);
  }

  ngOnDestroy() {
    this.voiceOverService.stop();
  }
}
