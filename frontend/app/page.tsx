'use client';

import { gql, useQuery } from '@apollo/client';
import { useState } from 'react';

// GraphQL クエリ
const GET_QUESTIONS_WITH_CHOICES = gql`
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

type Choice = {
  id : number,
  choice: string,
}

export default function Home() {
  const { loading, error, data } = useQuery(GET_QUESTIONS_WITH_CHOICES);
  const [currentIndex, setCurrentIndex] = useState(0);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  const questions = data.questions;
  const currentQuestion = questions[currentIndex];

  return (
    <div>
      <h1>Questions from NestJS GraphQL</h1>
      <div>
        <h2>{currentQuestion.question}</h2>
        <ul>
          {currentQuestion.choices.map((choice: Choice) => (
            <li key={choice.id}>{choice.choice}</li>
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
    </div>
  );
}
