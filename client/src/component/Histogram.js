import React from 'react';
import { Bar as BarChart, Line as LineChart } from 'react-chartjs';
import './Histogram.less';

// list: [{x: xx, y: yy}]
function Histogram({title, xList, yLabel, yList}) {
  if (!yList) return null;
  const dataSet = {
    label: yLabel,
    fillColor: 'rgba(10,100,220,0.5)',
    strokeColor: 'rgba(220,220,220,0.8)',
    highlightFill: 'rgba(100,200,100,0.75)',
    highlightStroke: 'rgba(220,220,220,1)',
    data: yList
  };
  const data = { labels: xList, datasets:[dataSet] };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scaleBeginAtZero: true,
  };
  return (
    <div className='hist'>
      <div className='hist__title'>{title}</div>
      <div><BarChart data={data} options={options}/></div>
    </div>
  );
}

export default Histogram;
