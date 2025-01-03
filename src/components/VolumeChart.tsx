import React from 'react';
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

interface VolumeHistoryData {
  date: string;
  volume: number;
}

interface VolumeChartProps {
  volumeHistory: VolumeHistoryData[];
}

const VolumeChart: React.FC<VolumeChartProps> = ({ volumeHistory }) => {
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
        text: 'Daily Volume',
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
        ticks: {
          display: false,
          color: '#00ff00',
          font: {
            family: "'Courier New', monospace"
          }
        },
        grid: {
          color: 'rgba(0, 255, 0, 0.1)',
        }
      },
      y: {
        ticks: {
          color: '#00ff00',
          font: {
            family: "'Courier New', monospace"
          },
          callback: function(value: any) {
            return value.toFixed(2); // Format volume with 2 decimal places
          }
        },
        grid: {
          color: '#003300'
        },
        beginAtZero: true
      }
    }
  };

  const data = {
    labels: volumeHistory.map(item => new Date(item.date).toLocaleDateString()),
    datasets: [
      {
        label: 'Volume (SRG)',
        data: volumeHistory.map(item => item.volume),
        backgroundColor: 'rgba(0, 255, 0, 0.5)',
      }
    ]
  };

  return (
    <div style={{ height: '300px', marginTop: '20px' }}>
      <Bar options={options} data={data} />
    </div>
  );
};

export default VolumeChart;
