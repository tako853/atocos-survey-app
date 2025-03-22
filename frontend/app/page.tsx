'use client';

import { gql, useQuery, useMutation } from '@apollo/client';
import { useState } from 'react';
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

// 回答を送信する Mutation
const SUBMIT_ANSWER = gql`
  mutation SubmitAnswer($questionId: Int!, $choiceId: Int!) {
    submitAnswer(questionId: $questionId, choiceId: $choiceId) {
      id
      questionId
      choiceId
    }
  }
`;

export default function Home() {
  const { loading, error, data } = useQuery(GET_QUESTIONS);
  const [submitAnswer] = useMutation(SUBMIT_ANSWER);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState(null);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const questions = data.questions;
  const currentQuestion = questions[currentIndex];

  const handleSubmit = async () => {
    if (!selectedChoice) return;
    await submitAnswer({
      variables: {
        questionId: Number(currentQuestion.id),
        choiceId: Number(selectedChoice),
      },
    });
    alert('回答を送信しました！');
  };

  return (
    <div className={styles.top_wrapper}>
      <h1>Questions from NestJS GraphQL</h1>
      <div className={styles.top_question}>
        <h2>{currentQuestion.question}</h2>
        <ul>
          {currentQuestion.choices.map((choice) => (
            <div key={choice.id} className={styles.top_question_choice}>
              <label className={styles.radioItem}>
                <input
                  type="radio"
                  name="choice"
                  className={styles.radioButton}
                  value={choice.id}
                  onChange={() => setSelectedChoice(choice.id)}
                />
                {choice.choice}
              </label>
            </div>
          ))}
        </ul>
      </div>
      <div>
        <button
          onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
          disabled={currentIndex === 0}
        >
          Previous
        </button>
        <button
          onClick={() =>
            setCurrentIndex((prev) => Math.min(prev + 1, questions.length - 1))
          }
          disabled={currentIndex === questions.length - 1}
        >
          Next
        </button>
      </div>
      <button onClick={handleSubmit} disabled={!selectedChoice} className={styles.top_sendButton}>
        回答を送信
      </button>
    </div>
  );
}
