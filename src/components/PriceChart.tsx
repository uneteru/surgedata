import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface PriceHistoryData {
  date: string;
  price: number;
}

interface PriceChartProps {
  priceHistory: PriceHistoryData[];
}

const PriceChart: React.FC<PriceChartProps> = ({ priceHistory }) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#00ff00',
          font: {
            family: "'Courier New', monospace",
          }
        }
      },
      title: {
        display: true,
        text: 'Price History',
        color: '#00ff00',
        font: {
          family: "'Courier New', monospace",
          size: 16
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#00ff00',
        bodyColor: '#00ff00',
        borderColor: '#00ff00',
        borderWidth: 1,
        titleFont: {
          family: "'Courier New', monospace"
        },
        bodyFont: {
          family: "'Courier New', monospace"
        }
      }
    },
    scales: {
      x: {
        grid: {
          color: 'rgba(0, 255, 0, 0.1)',
        },
        ticks: {
          color: '#00ff00',
          font: {
            family: "'Courier New', monospace"
          }
        }
      },
      y: {
        grid: {
          color: 'rgba(0, 255, 0, 0.1)',
        },
        ticks: {
          color: '#00ff00',
          font: {
            family: "'Courier New', monospace"
          }
        }
      }
    }
  };

  const data = {
    labels: priceHistory.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Price (SRG)',
        data: priceHistory.map(item => item.price),
        borderColor: '#00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.5)',
        borderWidth: 2,
        pointBackgroundColor: '#00ff00',
        pointBorderColor: '#000',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#00ff00',
        tension: 0.4
      }
    ]
  };

  return (
    <div className="price-chart">
      <Line options={options} data={data} />
    </div>
  );
};

export default PriceChart;
