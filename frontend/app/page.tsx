'use client';

import { gql, useQuery } from '@apollo/client';
import Link from 'next/link';
import styles from './toppage.module.scss';

// GraphQL クエリ
const GET_SHEETS = gql`
  query {
    sheets {
      id
      title
      questions {
        id
        question
        choices {
          id
          choice
        }
      }
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery(GET_SHEETS);

  if (loading) return <div className={styles.home_wrapper}><div className={styles.loading}><p>読み込み中...</p></div></div>;
  if (error) return <div className={styles.home_wrapper}><div className={styles.error}><p>エラー: {error.message}</p></div></div>;

  const sheets = data.sheets;

  return (
    <div className={styles.home_wrapper}>

      <div className={styles.admin_link_section}>
        <Link href="/admin" className={styles.admin_button}>
          管理ページ
        </Link>
      </div>

      <h1>アンケート一覧</h1>
      
      <div className={styles.description}>
        <p>回答したいアンケートを選択してください：</p>
      </div>

      <div className={styles.surveys_list}>
        {sheets.map((sheet: any) => (
          <div key={sheet.id} className={styles.survey_card}>
            <div className={styles.survey_header}>
              <h2 className={styles.survey_title}>📋 {sheet.title}</h2>
              <div className={styles.survey_meta}>
                <span className={styles.question_count}>{sheet.questions.length}問</span>
              </div>
            </div>
            
            <div className={styles.questions_preview}>
              <h4>質問一覧:</h4>
              <ul>
                {sheet.questions.slice(0, 3).map((question: any, index: number) => (
                  <li key={question.id}>
                    {index + 1}. {question.question}
                  </li>
                ))}
                {sheet.questions.length > 3 && (
                  <li className={styles.more_questions}>
                    他 {sheet.questions.length - 3}問...
                  </li>
                )}
              </ul>
            </div>

            <div className={styles.survey_actions}>
              {sheet.questions.length > 0 ? (
                <Link 
                  href={`/question/${sheet.id}/${sheet.questions[0].id}`} 
                  className={styles.start_survey_button}
                >
                  アンケート開始
                </Link>
              ) : (
                <span className={styles.no_questions}>質問がありません</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {sheets.length === 0 && (
        <div className={styles.no_surveys}>
          <p>アンケートがまだ作成されていません。</p>
          <Link href="/admin" className={styles.create_survey_link}>
            アンケートを作成する
          </Link>
        </div>
      )}
    </div>
  );
}
