'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../auth/context';
import BarChart from '../components/BarChart';
import styles from './admin.module.scss';

const CREATE_QUESTION = gql`
  mutation createQuestion($question: String!, $choices: [String!]!, $sheetId: Int) {
    createQuestion(question: $question, choices: $choices, sheetId: $sheetId) {
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

const CREATE_SHEET = gql`
  mutation createSheet($title: String!) {
    createSheet(title: $title) {
      id
      title
    }
  }
`;

const GET_SHEETS = gql`
  query getSheets {
    sheets {
      id
      title
      questions {
        id
        question
      }
    }
  }
`;

const GET_QUESTIONS = gql`
  query getQuestions {
    questions {
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

const GET_ANSWERS = gql`
  query getAnswers {
    answers {
      id
      questionId
      choiceId
    }
  }
`;

const DELETE_QUESTION = gql`
  mutation deleteQuestion($id: Int!) {
    deleteQuestion(id: $id)
  }
`;

const DELETE_SHEET = gql`
  mutation deleteSheet($id: Int!) {
    deleteSheet(id: $id)
  }
`;

export default function AdminPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();
  
  const [createQuestion] = useMutation(CREATE_QUESTION);
  const [createSheet] = useMutation(CREATE_SHEET);
  const [deleteQuestion] = useMutation(DELETE_QUESTION);
  const [deleteSheet] = useMutation(DELETE_SHEET);
  const { data: questionsData, loading: questionsLoading, refetch: refetchQuestions } = useQuery(GET_QUESTIONS);
  const { data: answersData, loading: answersLoading } = useQuery(GET_ANSWERS);
  const { data: sheetsData, loading: sheetsLoading, refetch: refetchSheets } = useQuery(GET_SHEETS);
  
  const [sheetTitle, setSheetTitle] = useState('');
  const [questions, setQuestions] = useState([{ question: '', choices: ['', ''] }]);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'overview'
  const [createdSheet, setCreatedSheet] = useState<any>(null);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return <div>読み込み中...</div>;
  }

  if (!isAuthenticated) {
    return <div>リダイレクト中...</div>;
  }

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: '', choices: ['', ''] }]);
  };

  const handleRemoveQuestion = (questionIndex: number) => {
    if (questions.length > 1) {
      setQuestions(questions.filter((_, i) => i !== questionIndex));
    }
  };

  const handleQuestionChange = (questionIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].question = value;
    setQuestions(updatedQuestions);
  };

  const handleAddChoice = (questionIndex: number) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices.push('');
    setQuestions(updatedQuestions);
  };

  const handleRemoveChoice = (questionIndex: number, choiceIndex: number) => {
    const updatedQuestions = [...questions];
    if (updatedQuestions[questionIndex].choices.length > 2) {
      updatedQuestions[questionIndex].choices = updatedQuestions[questionIndex].choices.filter((_, i) => i !== choiceIndex);
      setQuestions(updatedQuestions);
    }
  };

  const handleChoiceChange = (questionIndex: number, choiceIndex: number, value: string) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].choices[choiceIndex] = value;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sheetTitle.trim()) {
      alert('アンケートタイトルを入力してください');
      return;
    }

    // 全ての質問をバリデーション
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.question.trim()) {
        alert(`質問${i + 1}を入力してください`);
        return;
      }
      const validChoices = q.choices.filter(choice => choice.trim() !== '');
      if (validChoices.length < 2) {
        alert(`質問${i + 1}の選択肢を2つ以上入力してください`);
        return;
      }
    }

    try {
      // 1. シートを作成
      const sheetResult = await createSheet({
        variables: { title: sheetTitle.trim() }
      });
      const newSheet = sheetResult.data?.createSheet;

      // 2. 全ての質問を作成
      const createdQuestions = [];
      for (const q of questions) {
        const validChoices = q.choices.filter(choice => choice.trim() !== '');
        const questionResult = await createQuestion({
          variables: {
            question: q.question.trim(),
            choices: validChoices.map(choice => choice.trim()),
            sheetId: newSheet.id,
          },
        });
        createdQuestions.push(questionResult.data?.createQuestion);
      }
      
      setCreatedSheet({ ...newSheet, questions: createdQuestions });
      setSheetTitle('');
      setQuestions([{ question: '', choices: ['', ''] }]);
      refetchQuestions();
      refetchSheets();
    } catch (error) {
      console.error('Error creating sheet/questions:', error);
      alert('アンケートの作成に失敗しました');
    }
  };

  // 回答結果を集計する関数
  const getAnswerStats = () => {
    if (!questionsData?.questions || !answersData?.answers) return {};
    
    const stats: any = {};
    questionsData.questions.forEach((q: any) => {
      stats[q.id] = {
        question: q.question,
        choices: q.choices.map((choice: any) => ({
          ...choice,
          count: answersData.answers.filter((answer: any) => 
            answer.questionId === q.id && answer.choiceId === choice.id
          ).length
        }))
      };
    });
    
    return stats;
  };

  // 質問削除機能
  const handleDeleteQuestion = async (questionId: number, questionText: string) => {
    if (!window.confirm(`「${questionText}」を削除してもよろしいですか？`)) {
      return;
    }

    try {
      await deleteQuestion({
        variables: { id: questionId }
      });
      alert('質問を削除しました');
      refetchQuestions(); // 質問一覧を更新
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('質問の削除に失敗しました');
    }
  };

  // シート削除機能
  const handleDeleteSheet = async (sheetId: number, sheetTitle: string) => {
    if (!window.confirm(`アンケート「${sheetTitle}」を削除してもよろしいですか？\n\n※このアンケートに含まれる全ての質問・選択肢・回答データも削除されます。`)) {
      return;
    }

    try {
      await deleteSheet({
        variables: { id: sheetId }
      });
      alert('アンケートを削除しました');
      refetchQuestions(); // 質問一覧を更新
      refetchSheets(); // シート一覧を更新
    } catch (error) {
      console.error('Error deleting sheet:', error);
      alert('アンケートの削除に失敗しました');
    }
  };

  // URLをクリップボードにコピー
  const copyToClipboard = (sheetId: number, questionId: number) => {
    const url = `${window.location.origin}/question/${sheetId}/${questionId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('URLをクリップボードにコピーしました');
    }).catch(() => {
      alert('URLのコピーに失敗しました');
    });
  };

  // 新しいアンケートを作成ボタン
  const handleCreateNew = () => {
    setCreatedSheet(null);
  };

  return (
    <div className={styles.admin_wrapper}>
      <div className={styles.admin_header}>
        <h1>管理画面</h1>
        <div className={styles.header_actions}>
          <Link href="/" className={styles.home_link}>
            トップページ
          </Link>
          <button 
            onClick={logout}
            className={styles.logout_button}
          >
            ログアウト
          </button>
        </div>
      </div>
      
      {/* タブナビゲーション */}
      <div className={styles.tab_navigation}>
        <button
          onClick={() => setActiveTab('create')}
          className={`${styles.tab_button} ${activeTab === 'create' ? styles.active : ''}`}
        >
          アンケート作成
        </button>
        <button
          onClick={() => setActiveTab('overview')}
          className={`${styles.tab_button} ${activeTab === 'overview' ? styles.active : ''}`}
        >
          アンケート一覧
        </button>
      </div>

      {/* アンケート作成タブ */}
      {activeTab === 'create' && (
        <div>
          {!createdSheet ? (
            <form onSubmit={handleSubmit} className={styles.admin_form}>
              <div className={styles.form_group}>
                <label>アンケートタイトル:</label>
                <input
                  type="text"
                  value={sheetTitle}
                  onChange={(e) => setSheetTitle(e.target.value)}
                  placeholder="アンケートのタイトルを入力してください"
                  className={styles.input_field}
                />
              </div>

              {questions.map((q, questionIndex) => (
                <div key={questionIndex} className={styles.question_block}>
                  <div className={styles.question_header}>
                    <h4>質問 {questionIndex + 1}</h4>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveQuestion(questionIndex)}
                        className={styles.remove_question_button}
                      >
                        質問削除
                      </button>
                    )}
                  </div>
                  
                  <div className={styles.form_group}>
                    <label>質問内容:</label>
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => handleQuestionChange(questionIndex, e.target.value)}
                      placeholder="質問を入力してください"
                      className={styles.input_field}
                    />
                  </div>

                  <div className={styles.form_group}>
                    <label>選択肢:</label>
                    <div className={styles.choices_container}>
                      {q.choices.map((choice, choiceIndex) => (
                        <div key={choiceIndex} className={styles.choice_item}>
                          <input
                            type="text"
                            value={choice}
                            onChange={(e) => handleChoiceChange(questionIndex, choiceIndex, e.target.value)}
                            placeholder={`選択肢 ${choiceIndex + 1}`}
                            className={styles.choice_input}
                          />
                          {q.choices.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveChoice(questionIndex, choiceIndex)}
                              className={styles.remove_button}
                            >
                              削除
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => handleAddChoice(questionIndex)}
                        className={styles.add_choice_button}
                      >
                        選択肢を追加
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              <div className={styles.add_question_section}>
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className={styles.add_question_button}
                >
                  質問を追加
                </button>
              </div>

              <button
                type="submit"
                className={styles.submit_button}
              >
                アンケートを作成
              </button>
            </form>
          ) : (
            <div className={styles.success_container}>
              <div className={styles.success_header}>
                <h3>✅ アンケートを作成しました！</h3>
              </div>
              
              <div className={styles.created_question_info}>
                <h4>作成されたアンケート</h4>
                <div className={styles.question_display}>
                  <strong>タイトル:</strong> {createdSheet.title}
                </div>
                <div className={styles.questions_summary}>
                  <strong>質問数:</strong> {createdSheet.questions.length}問
                  <ul>
                    {createdSheet.questions.map((question: any, index: number) => (
                      <li key={question.id}>
                        質問{index + 1}: {question.question}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className={styles.url_section}>
                <h4>アンケート開始URL</h4>
                <div className={styles.url_container}>
                  <input
                    type="text"
                    value={`${typeof window !== 'undefined' ? window.location.origin : ''}/question/${createdSheet.id}/${createdSheet.questions[0]?.id}`}
                    readOnly
                    className={styles.url_input}
                  />
                  <button
                    onClick={() => copyToClipboard(createdSheet.id, createdSheet.questions[0]?.id)}
                    className={styles.copy_url_button}
                  >
                    コピー
                  </button>
                </div>
              </div>

              <div className={styles.action_buttons_success}>
                <button
                  onClick={() => window.open(`/question/${createdSheet.id}/${createdSheet.questions[0]?.id}`, '_blank')}
                  className={styles.preview_button}
                >
                  プレビュー
                </button>
                <button
                  onClick={handleCreateNew}
                  className={styles.create_new_button}
                >
                  新しいアンケートを作成
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* アンケート管理・結果タブ */}
      {activeTab === 'overview' && (
        <div>
          <h2>アンケート管理・回答結果</h2>
          {questionsLoading || answersLoading || sheetsLoading ? (
            <div className={styles.loading}>
              <p>読み込み中...</p>
            </div>
          ) : (
            <div>
              {sheetsData?.sheets?.map((sheet: any) => {
                const sheetQuestions = questionsData?.questions?.filter((q: any) => q.sheet_id === sheet.id) || [];
                
                return (
                  <div key={sheet.id} className={styles.sheet_overview_card}>
                    <div className={styles.sheet_header}>
                      <h3 className={styles.sheet_title}>
                        📋 {sheet.title}
                      </h3>
                      <div className={styles.sheet_info}>
                        <span className={styles.question_count}>{sheetQuestions.length}問</span>
                        <button 
                          onClick={() => window.open(`/question/${sheet.id}/${sheetQuestions[0]?.id}`, '_blank')}
                          className={styles.sheet_action_button}
                          disabled={sheetQuestions.length === 0}
                        >
                          アンケートを開く
                        </button>
                        <button
                          onClick={() => handleDeleteSheet(sheet.id, sheet.title)}
                          className={`${styles.sheet_action_button} ${styles.delete_sheet}`}
                        >
                          削除
                        </button>
                      </div>
                    </div>

                    <div className={styles.questions_grid}>
                      {sheetQuestions.map((q: any) => {
                        const stats = getAnswerStats()[q.id];
                        const totalAnswers = stats ? stats.choices.reduce((sum: number, choice: any) => sum + choice.count, 0) : 0;
                        
                        return (
                          <div key={q.id} className={styles.question_card_mini}>
                            <div className={styles.question_mini_header}>
                              <h4>質問 {q.id}: {q.question}</h4>
                              <span className={styles.answer_count_mini}>
                                {totalAnswers}回答
                              </span>
                            </div>
                            
                            <div className={styles.choices_list_mini}>
                              {q.choices.map((choice: any) => (
                                <span key={choice.id} className={styles.choice_tag}>
                                  {choice.choice}
                                </span>
                              ))}
                            </div>

                            <div className={styles.question_actions_mini}>
                              <button
                                onClick={() => window.open(`/question/${q.sheet_id}/${q.id}`, '_blank')}
                                className={`${styles.action_button_mini} ${styles.preview}`}
                              >
                                プレビュー
                              </button>
                              <button
                                onClick={() => copyToClipboard(q.sheet_id, q.id)}
                                className={`${styles.action_button_mini} ${styles.copy}`}
                              >
                                URLコピー
                              </button>
                              <button
                                onClick={() => handleDeleteQuestion(q.id, q.question)}
                                className={`${styles.action_button_mini} ${styles.delete}`}
                              >
                                削除
                              </button>
                            </div>

                            {stats && totalAnswers > 0 && (
                              <div className={styles.mini_chart}>
                                <BarChart choices={stats.choices} totalAnswers={totalAnswers} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
