'use client';

import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import styles from '../../question.module.scss';


const GET_SHEET_QUESTIONS = gql`
  query getSheetQuestions($sheetId: Int!) {
    questionsBySheet(sheetId: $sheetId) {
      id
      question
      choices {
        id
        choice
      }
      sheet_id
    }
  }
`;

const SUBMIT_ANSWERS = gql`
  mutation submitAnswers($answers: [AnswerInput!]!) {
    submitAnswers(answers: $answers) {
      success
      message
    }
  }
`;

// アンケートセッション管理用の型
interface SurveyAnswer {
  questionId: number;
  choiceId: number;
}

interface SurveySession {
  sheetId: number;
  answers: SurveyAnswer[];
  currentQuestionIndex: number;
}

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const sheetId = parseInt(params.sheetId as string);
  const questionId = parseInt(params.questionId as string);
  
  const { data: sheetData, loading, error } = useQuery(GET_SHEET_QUESTIONS, {
    variables: { sheetId: sheetId }
  });
  
  const [submitAnswers] = useMutation(SUBMIT_ANSWERS);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [surveySession, setSurveySession] = useState<SurveySession | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  // セッションの初期化と復元
  useEffect(() => {
    const sessionKey = `survey_session_${sheetId}`;
    const savedSession = localStorage.getItem(sessionKey);
    
    if (savedSession) {
      const session: SurveySession = JSON.parse(savedSession);
      setSurveySession(session);
      
      // 現在の質問の保存済み回答があるかチェック
      const currentAnswer = session.answers.find(a => a.questionId === questionId);
      if (currentAnswer) {
        setSelectedChoice(currentAnswer.choiceId);
      }
    } else {
      // 新しいセッションを開始
      const newSession: SurveySession = {
        sheetId,
        answers: [],
        currentQuestionIndex: 0
      };
      setSurveySession(newSession);
      localStorage.setItem(sessionKey, JSON.stringify(newSession));
    }
  }, [sheetId, questionId]);

  // 現在の回答を保存して次に進む
  const handleNext = () => {
    if (selectedChoice === null) {
      alert('選択肢を選んでください');
      return;
    }

    if (!surveySession) return;

    const updatedSession = { ...surveySession };
    
    // 現在の回答を保存/更新
    const existingAnswerIndex = updatedSession.answers.findIndex(a => a.questionId === questionId);
    if (existingAnswerIndex >= 0) {
      updatedSession.answers[existingAnswerIndex].choiceId = selectedChoice;
    } else {
      updatedSession.answers.push({ questionId, choiceId: selectedChoice });
    }

    const sheetQuestions = sheetData?.questionsBySheet || [];
    const currentIndex = sheetQuestions.findIndex((q: any) => q.id === questionId);
    const nextQuestion = sheetQuestions[currentIndex + 1];
    
    updatedSession.currentQuestionIndex = currentIndex + 1;
    
    // セッションを保存
    setSurveySession(updatedSession);
    localStorage.setItem(`survey_session_${sheetId}`, JSON.stringify(updatedSession));

    if (nextQuestion) {
      router.push(`/question/${sheetId}/${nextQuestion.id}`);
    } else {
      // 最後の質問の場合は確認画面に
      setIsCompleted(true);
    }
  };

  // 前の質問に戻る
  const handlePrevious = () => {
    if (!surveySession) return;
    
    const sheetQuestions = sheetData?.questionsBySheet || [];
    const currentIndex = sheetQuestions.findIndex((q: any) => q.id === questionId);
    const previousQuestion = sheetQuestions[currentIndex - 1];
    
    if (previousQuestion) {
      router.push(`/question/${sheetId}/${previousQuestion.id}`);
    }
  };

  // 最終送信
  const handleSubmitAll = async () => {
    if (!surveySession) return;

    try {
      await submitAnswers({
        variables: {
          answers: surveySession.answers
        }
      });
      
      // セッションをクリア
      localStorage.removeItem(`survey_session_${sheetId}`);
      
      alert('アンケートの回答が完了しました！');
      router.push('/');
    } catch (error) {
      console.error('Error submitting answers:', error);
      alert('回答の送信に失敗しました');
    }
  };

  if (loading) return <div className={styles.question_wrapper}><div className={styles.loading}><p>読み込み中...</p></div></div>;
  if (error) return <div className={styles.question_wrapper}><div className={styles.error}><p>エラーが発生しました: {error.message}</p></div></div>;
  
  const sheetQuestions = sheetData?.questionsBySheet || [];
  const currentQuestion = sheetQuestions.find((q: any) => q.id === questionId);
  
  if (!currentQuestion) return <div className={styles.question_wrapper}><div className={styles.error}><p>質問が見つかりません</p></div></div>;

  const currentIndex = sheetQuestions.findIndex((q: any) => q.id === questionId);
  const totalQuestions = sheetQuestions.length;
  const isLastQuestion = currentIndex === totalQuestions - 1;

  // 最終確認画面
  if (isCompleted) {
    return (
      <div className={styles.question_wrapper}>
        <h1>アンケート確認</h1>
        
        <div className={styles.final_confirmation}>
          <h2>📋 回答を確認してください</h2>
          
          <div className={styles.answers_summary}>
            {sheetQuestions.map((q: any, index: number) => {
              const answer = surveySession?.answers.find(a => a.questionId === q.id);
              const selectedChoice = q.choices.find((c: any) => c.id === answer?.choiceId);
              
              return (
                <div key={q.id} className={styles.answer_item}>
                  <div className={styles.answer_question}>
                    <strong>質問 {index + 1}:</strong> {q.question}
                  </div>
                  <div className={styles.answer_choice}>
                    <strong>回答:</strong> {selectedChoice?.choice || '未回答'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.final_actions}>
            <button 
              onClick={() => {
                const firstUnanswered = sheetQuestions.find((q: any) => 
                  !surveySession?.answers.find(a => a.questionId === q.id)
                );
                if (firstUnanswered) {
                  router.push(`/question/${sheetId}/${firstUnanswered.id}`);
                } else {
                  router.push(`/question/${sheetId}/${sheetQuestions[0].id}`);
                }
              }}
              className={styles.edit_button}
            >
              修正する
            </button>
            <button 
              onClick={handleSubmitAll}
              className={styles.final_submit_button}
            >
              回答を送信
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.question_wrapper}>
      <h1>アンケート</h1>
      
      {totalQuestions > 1 && (
        <div className={styles.progress_bar}>
          <p>質問 {currentIndex + 1} / {totalQuestions}</p>
          <div className={styles.progress_track}>
            <div 
              className={styles.progress_fill}
              style={{ width: `${((currentIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
      )}
      
      <div className={styles.question_form}>
        <h2>{currentQuestion.question}</h2>
        
        <div className={styles.choices_container}>
          {currentQuestion.choices.map((choice: any) => (
            <div key={choice.id} className={styles.choice_item}>
              <label className={`${styles.choice_label} ${selectedChoice === choice.id ? styles.selected : ''}`}>
                <input
                  type="radio"
                  name="choice"
                  value={choice.id}
                  checked={selectedChoice === choice.id}
                  onChange={() => setSelectedChoice(choice.id)}
                />
                <span className={styles.choice_text}>{choice.choice}</span>
              </label>
            </div>
          ))}
        </div>

        <div className={styles.question_navigation}>
          {currentIndex > 0 && (
            <button
              onClick={handlePrevious}
              className={styles.previous_button}
            >
              ← 前の質問
            </button>
          )}
          
          <button
            onClick={handleNext}
            className={styles.next_button}
            disabled={selectedChoice === null}
          >
            {isLastQuestion ? '確認画面へ' : '次の質問 →'}
          </button>
        </div>
      </div>
      
      <div className={styles.navigation_buttons}>
        <button 
          onClick={() => router.push('/')}
          className={styles.nav_button}
        >
          トップページに戻る
        </button>
      </div>
    </div>
  );
}