'use client';

import { gql, useMutation, useQuery } from '@apollo/client';
import { useState } from 'react';
import styles from '@/app/top.module.scss';

const CREATE_QUESTION = gql`
  mutation createQuestion($question: String!, $choices: [String!]!, $sheet_id: Int!) {
    createQuestion(question: $question, choices: $choices, sheet_id: $sheet_id) {
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

export default function AdminPage() {
  const [createQuestion] = useMutation(CREATE_QUESTION);
  const [deleteQuestion] = useMutation(DELETE_QUESTION);
  const { data: questionsData, loading: questionsLoading, refetch: refetchQuestions } = useQuery(GET_QUESTIONS);
  const { data: answersData, loading: answersLoading } = useQuery(GET_ANSWERS);
  
  const [question, setQuestion] = useState('');
  const [choices, setChoices] = useState(['', '']);
  const [sheetId, setSheetId] = useState(1);
  const [activeTab, setActiveTab] = useState('create'); // 'create', 'questions', 'results'

  const handleAddChoice = () => {
    setChoices([...choices, '']);
  };

  const handleRemoveChoice = (index: number) => {
    if (choices.length > 2) {
      setChoices(choices.filter((_, i) => i !== index));
    }
  };

  const handleChoiceChange = (index: number, value: string) => {
    const updatedChoices = [...choices];
    updatedChoices[index] = value;
    setChoices(updatedChoices);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!question.trim()) {
      alert('質問を入力してください');
      return;
    }

    const validChoices = choices.filter(choice => choice.trim() !== '');
    if (validChoices.length < 2) {
      alert('選択肢を2つ以上入力してください');
      return;
    }

    try {
      await createQuestion({
        variables: {
          question: question.trim(),
          choices: validChoices.map(choice => choice.trim()),
          sheet_id: sheetId,
        },
      });
      
      alert('質問を作成しました！');
      setQuestion('');
      setChoices(['', '']);
      refetchQuestions(); // 質問一覧を更新
    } catch (error) {
      console.error('Error creating question:', error);
      alert('質問の作成に失敗しました');
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

  // URLをクリップボードにコピー
  const copyToClipboard = (questionId: number) => {
    const url = `${window.location.origin}/question/${questionId}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('URLをクリップボードにコピーしました');
    }).catch(() => {
      alert('URLのコピーに失敗しました');
    });
  };

  return (
    <div className={styles.top_wrapper}>
      <h1>管理画面</h1>
      
      {/* タブナビゲーション */}
      <div style={{ marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('create')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            backgroundColor: activeTab === 'create' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'create' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          質問作成
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            backgroundColor: activeTab === 'questions' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'questions' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          質問一覧
        </button>
        <button
          onClick={() => setActiveTab('results')}
          style={{
            padding: '10px 20px',
            margin: '0 5px',
            backgroundColor: activeTab === 'results' ? '#007bff' : '#f8f9fa',
            color: activeTab === 'results' ? 'white' : 'black',
            border: '1px solid #dee2e6',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          回答結果
        </button>
      </div>

      {/* 質問作成タブ */}
      {activeTab === 'create' && (
        <form onSubmit={handleSubmit} className={styles.top_question}>
        <div style={{ marginBottom: '20px' }}>
          <label>質問:</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="質問を入力してください"
            className={styles.inputField}
            style={{ width: '100%', marginTop: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>シートID:</label>
          <input
            type="number"
            value={sheetId}
            onChange={(e) => setSheetId(Number(e.target.value))}
            className={styles.inputField}
            style={{ width: '100px', marginTop: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label>選択肢:</label>
          {choices.map((choice, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
              <input
                type="text"
                value={choice}
                onChange={(e) => handleChoiceChange(index, e.target.value)}
                placeholder={`選択肢 ${index + 1}`}
                className={styles.inputField}
                style={{ flex: 1, marginRight: '8px' }}
              />
              {choices.length > 2 && (
                <button
                  type="button"
                  onClick={() => handleRemoveChoice(index)}
                  style={{ padding: '8px 12px', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '4px' }}
                >
                  削除
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddChoice}
            style={{ marginTop: '8px', padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px' }}
          >
            選択肢を追加
          </button>
        </div>

          <button
            type="submit"
            className={styles.top_sendButton}
          >
            質問を作成
          </button>
        </form>
      )}

      {/* 質問一覧タブ */}
      {activeTab === 'questions' && (
        <div>
          <h2>質問一覧</h2>
          {questionsLoading ? (
            <p>読み込み中...</p>
          ) : (
            <div>
              {questionsData?.questions?.map((q: any) => (
                <div key={q.id} style={{ 
                  border: '1px solid #ddd', 
                  padding: '15px', 
                  margin: '10px 0', 
                  borderRadius: '4px' 
                }}>
                  <h3>質問 {q.id}: {q.question}</h3>
                  <p><strong>シートID:</strong> {q.sheet_id}</p>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>URL:</strong> 
                    <span style={{ 
                      marginLeft: '8px', 
                      color: '#007bff', 
                      fontFamily: 'monospace',
                      backgroundColor: '#f8f9fa',
                      padding: '2px 6px',
                      borderRadius: '3px'
                    }}>
                      /question/{q.id}
                    </span>
                  </div>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>選択肢:</strong>
                    <ul>
                      {q.choices.map((choice: any) => (
                        <li key={choice.id}>{choice.choice}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                    <button
                      onClick={() => window.open(`/question/${q.id}`, '_blank')}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      プレビュー
                    </button>
                    <button
                      onClick={() => copyToClipboard(q.id)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      URLコピー
                    </button>
                    <button
                      onClick={() => handleDeleteQuestion(q.id, q.question)}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      削除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 回答結果タブ */}
      {activeTab === 'results' && (
        <div>
          <h2>回答結果</h2>
          {answersLoading || questionsLoading ? (
            <p>読み込み中...</p>
          ) : (
            <div>
              {Object.entries(getAnswerStats()).map(([questionId, stats]: [string, any]) => (
                <div key={questionId} style={{ 
                  border: '1px solid #ddd', 
                  padding: '15px', 
                  margin: '10px 0', 
                  borderRadius: '4px' 
                }}>
                  <h3>{stats.question}</h3>
                  <div>
                    {stats.choices.map((choice: any) => (
                      <div key={choice.id} style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center',
                        padding: '5px 0',
                        borderBottom: '1px solid #eee'
                      }}>
                        <span>{choice.choice}</span>
                        <span style={{ 
                          backgroundColor: '#007bff', 
                          color: 'white', 
                          padding: '2px 8px', 
                          borderRadius: '12px',
                          fontSize: '12px'
                        }}>
                          {choice.count}票
                        </span>
                      </div>
                    ))}
                  </div>
                  <p style={{ marginTop: '10px', fontSize: '14px', color: '#666' }}>
                    総回答数: {stats.choices.reduce((sum: number, choice: any) => sum + choice.count, 0)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
