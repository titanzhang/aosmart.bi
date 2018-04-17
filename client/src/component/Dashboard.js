import React from 'react';

const MetricGrid = require('./MetricGrid');
import DataFilter from './DataFilter';
require('./Dashboard.less');
require('./button.less');

const Texts = {
  sale_amount: 'Sale Amount',
  sale_count: 'Sale Quantity',
  order_count: 'Order Count',
  cost: 'Cost',
  profit: 'Profit',
  margin: 'Margin'
};

const buildMetric = (model, name) => {
  if (!model) return null;
  return (
    <div className='col col-2'><MetricGrid title={Texts[name]} sum={model.sum} /></div>
  )
};

const Dashboard = (props) => {
  const metrics = props.metrics || {};

  return (
    <div className='dashboard'>
      <DataFilter {...props.filter} />
      <div className='dashboard__row'>
        {buildMetric(metrics.sale_amount, 'sale_amount')}
        {buildMetric(metrics.sale_count, 'sale_count')}
        {buildMetric(metrics.order_count, 'order_count')}
        {buildMetric(metrics.cost, 'cost')}
        {buildMetric(metrics.profit, 'profit')}
        {buildMetric(metrics.margin, 'margin')}
      </div>
    </div>
  );
}

export default Dashboard;
