'use client';

import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import styles from './top.module.scss';

// GraphQL クエリ
const GET_QUESTIONS = gql`
  query {
    questions {
      id
      question
      choices {
        id
        choice
      }
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery(GET_QUESTIONS);

  if (loading) return <div className={styles.top_wrapper}><p>読み込み中...</p></div>;
  if (error) return <div className={styles.top_wrapper}><p>エラー: {error.message}</p></div>;

  const questions = data.questions;

  return (
    <div className={styles.top_wrapper}>
      <h1>アンケート一覧</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <p>回答したいアンケートを選択してください：</p>
      </div>

      <div>
        {questions.map((question: any) => (
          <div key={question.id} style={{
            border: '1px solid #ddd',
            padding: '20px',
            margin: '15px 0',
            borderRadius: '8px',
            backgroundColor: '#f8f9fa'
          }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{question.question}</h3>
            <p style={{ margin: '0 0 15px 0', color: '#666', fontSize: '14px' }}>
              選択肢: {question.choices.map((choice: any) => choice.choice).join(', ')}
            </p>
            <Link href={`/question/${question.id}`}>
              <button className={styles.top_sendButton} style={{ margin: 0 }}>
                回答する
              </button>
            </Link>
          </div>
        ))}
      </div>

      <div style={{ marginTop: '30px', textAlign: 'center' }}>
        <Link href="/admin">
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}>
            管理画面
          </button>
        </Link>
      </div>
    </div>
  );
}
