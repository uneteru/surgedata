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
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Hourly Price History',
        color: '#00ff00',
        font: {
          family: "'Courier New', monospace",
          size: 20
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
        },
        callbacks: {
          label: function(context: any) {
            return `Price: $${context.parsed.y.toFixed(8)}`;
          }
        }
      }
    },
    elements: {
      line: {
        tension: 0.4,  // Makes the line smoother
        borderWidth: 2,
        borderColor: '#00ff00',
        fill: true,
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, 'rgba(0, 255, 0, 0.2)');
          gradient.addColorStop(1, 'rgba(0, 255, 0, 0)');
          return gradient;
        }
      },
      point: {
        radius: 0,  // Hides the points
        hitRadius: 10,  // Area around point that will register hover
        hoverRadius: 4  // Size of point when hovering
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#00ff00',
          font: {
            family: "'Courier New', monospace"
          },
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 12  // Show fewer ticks for cleaner look
        },
        grid: {
          color: '#003300',
          drawBorder: false
        }
      },
      y: {
        ticks: {
          color: '#00ff00',
          font: {
            family: "'Courier New', monospace"
          },
          callback: function(value: any) {
            return '$' + Number(value).toFixed(8);
          }
        },
        grid: {
          color: '#003300',
          drawBorder: false
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index'
    }
  };

  const data = {
    labels: priceHistory.map(entry => entry.date),
    datasets: [
      {
        label: 'Price (SRG)',
        data: priceHistory.map(entry => entry.price),
        borderColor: '#00ff00',
        backgroundColor: 'rgba(0, 255, 0, 0.1)',
        pointHoverBackgroundColor: '#00ff00'
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
