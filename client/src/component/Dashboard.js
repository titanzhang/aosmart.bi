import React from 'react';

const MetricGrid = require('./MetricGrid');
import Histogram from './Histogram';
import DataFilter from './DataFilter';
require('./Dashboard.less');
require('./button.less');

const Texts = {
  sale_amount: 'Sale Amount',
  sale_count: 'Sale Quantity',
  order_count: 'Order Count',
  cost: 'Cost',
  profit: 'Profit',
  margin: 'Margin',
  xTitle: {
    sale_amount: 'Date', sale_count: 'Date', order_count: 'Date', cost: 'Date'
  },
  yTitle: {
    sale_amount: 'Sale Amount',
    sale_count: 'Sale Count',
    order_count: 'Order Count',
    cost: 'Cost',
    profit: 'Profit',
    margin: 'Margin'
  }
};

const buildMetric = (model, name) => {
  if (!model) return null;
  return (
    <div className='col col-2'><MetricGrid title={Texts[name]} sum={model.sum} /></div>
  )
};

function buildHistogram({key, title, xList, yLabel, yList}) {
  return <div key={key} className='dashboard__row'><Histogram title={title} xList={xList} yLabel={yLabel} yList={yList} /></div>
}

const Dashboard = ({filter, metrics, hists}) => {
  return (
    <div className='dashboard'>
      <DataFilter {...filter} />
      <div className='dashboard__row'>
        {buildMetric(metrics.sale_amount, 'sale_amount')}
        {buildMetric(metrics.sale_count, 'sale_count')}
        {buildMetric(metrics.order_count, 'order_count')}
        {buildMetric(metrics.cost, 'cost')}
        {buildMetric(metrics.profit, 'profit')}
        {buildMetric(metrics.margin, 'margin')}
      </div>
      <div>
        {hists.map( (hist, index) => buildHistogram({
          key: index,
          title: Texts[hist.type],
          xList: hist.xList,
          yLabel: Texts.yTitle[hist.type],
          yList: hist.yList
        }))}
      </div>
    </div>
  );
}

export default Dashboard;
