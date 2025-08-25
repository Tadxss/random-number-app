import { Chart as ChartJS } from 'chart.js/auto';
declare global {
  interface Window {
    Chart: typeof ChartJS;
  }
}
