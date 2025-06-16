'use client';

import { gql, useQuery, useMutation } from '@apollo/client';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import styles from '@/app/top.module.scss';

const GET_QUESTION = gql`
  query getQuestion($id: Int!) {
    question(id: $id) {
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

const SUBMIT_ANSWER = gql`
  mutation submitAnswer($questionId: Int!, $choiceId: Int!) {
    submitAnswer(questionId: $questionId, choiceId: $choiceId) {
      id
      questionId
      choiceId
    }
  }
`;

export default function QuestionPage() {
  const params = useParams();
  const router = useRouter();
  const questionId = parseInt(params.id as string);
  
  const { data, loading, error } = useQuery(GET_QUESTION, {
    variables: { id: questionId }
  });
  
  const [submitAnswer] = useMutation(SUBMIT_ANSWER);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedChoice === null) {
      alert('選択肢を選んでください');
      return;
    }

    try {
      await submitAnswer({
        variables: {
          questionId: questionId,
          choiceId: selectedChoice,
        },
      });
      
      setIsSubmitted(true);
      alert('回答を送信しました！');
    } catch (error) {
      console.error('Error submitting answer:', error);
      alert('回答の送信に失敗しました');
    }
  };

  if (loading) return <div className={styles.top_wrapper}><p>読み込み中...</p></div>;
  if (error) return <div className={styles.top_wrapper}><p>エラーが発生しました: {error.message}</p></div>;
  if (!data?.question) return <div className={styles.top_wrapper}><p>質問が見つかりません</p></div>;

  const question = data.question;

  return (
    <div className={styles.top_wrapper}>
      <h1>アンケート</h1>
      
      {isSubmitted ? (
        <div className={styles.top_question}>
          <h2>回答完了</h2>
          <p>ご回答ありがとうございました！</p>
          <button 
            onClick={() => router.push('/')}
            className={styles.top_sendButton}
          >
            トップページに戻る
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.top_question}>
          <h2>{question.question}</h2>
          
          <div style={{ marginBottom: '20px' }}>
            {question.choices.map((choice: any) => (
              <div key={choice.id} style={{ marginBottom: '10px' }}>
                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="radio"
                    name="choice"
                    value={choice.id}
                    checked={selectedChoice === choice.id}
                    onChange={() => setSelectedChoice(choice.id)}
                    style={{ marginRight: '8px' }}
                  />
                  <span>{choice.choice}</span>
                </label>
              </div>
            ))}
          </div>

          <button
            type="submit"
            className={styles.top_sendButton}
            disabled={selectedChoice === null}
          >
            回答を送信
          </button>
        </form>
      )}
      
      <div style={{ marginTop: '20px', textAlign: 'center' }}>
        <button 
          onClick={() => router.push('/')}
          style={{ 
            padding: '8px 16px', 
            backgroundColor: '#6c757d', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          トップページに戻る
        </button>
      </div>
    </div>
  );
}