'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  choices: Array<{
    id: number;
    choice: string;
    count: number;
  }>;
  totalAnswers: number;
}

export default function BarChart({ choices, totalAnswers }: BarChartProps) {
  const data = {
    labels: choices.map(choice => {
      const percentage = totalAnswers > 0 ? ((choice.count / totalAnswers) * 100).toFixed(1) : '0.0';
      return [`${choice.choice}`, `(${choice.count}票, ${percentage}%)`];
    }),
    datasets: [
      {
        label: '回答数',
        data: choices.map(choice => choice.count),
        backgroundColor: [
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 99, 132, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 99, 132, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y' as const,
    resizeDelay: 0,
    interaction: {
      intersect: false,
    },
    layout: {
      padding: {
        left: 15,
        right: 15,
        top: 10,
        bottom: 5,
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context: any) {
            const count = context.parsed.x;
            const percentage = totalAnswers > 0 ? ((count / totalAnswers) * 100).toFixed(1) : '0.0';
            return `${count}票 (${percentage}%)`;
          }
        }
      }
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          font: {
            size: 12,
          },
        },
        grid: {
          display: true,
        },
      },
      y: {
        type: 'category',
        position: 'left',
        ticks: {
          maxRotation: 0,
          minRotation: 0,
          font: {
            size: 12,
          },
          callback: function(value: any, index: number) {
            const label = this.getLabelForValue(value);
            
            // 配列形式のラベル（改行あり）の場合
            if (Array.isArray(label)) {
              const firstLine = label[0];
              if (firstLine.length > 30) {
                return [firstLine.substring(0, 27) + '...', label[1]];
              }
              return label;
            }
            
            // 文字列形式のラベル（後方互換性）
            if (label.length > 50) {
              return label.substring(0, 47) + '...';
            }
            return label;
          },
          padding: 10,
        },
        grid: {
          display: true,
        },
        offset: true,
      },
    },
  };

  return (
    <div style={{ 
      height: `${Math.max(choices.length * 80 + 20, 180)}px`,
      width: '100%',
      maxWidth: '100%',
      overflow: 'hidden',
      position: 'relative'
    }}>
      <Bar data={data} options={options} />
    </div>
  );
}