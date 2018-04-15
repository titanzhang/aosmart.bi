const React = require('react');

const MetricGrid = require('./MetricGrid');
require('./Dashboard.less');

const Texts = {
  sale_amount: 'Sale Amount',
  sale_quantity: 'Sale Quantity',
  order_count: 'Order Count',
  cost: 'Cost',
  profit: 'Profit',
  margin: 'Margin'
};

const Dashboard = () => (
  <div className='dashboard'>
    <div className='dashboard__row'>
      <div className='col col-2'><MetricGrid title={Texts.sale_amount} sum='10000' /></div>
      <div className='col col-2'><MetricGrid title={Texts.sale_quantity} sum='100' /></div>
      <div className='col col-2'><MetricGrid title={Texts.order_count} sum='20' /></div>
      <div className='col col-2'><MetricGrid title={Texts.cost} sum='910' /></div>
      <div className='col col-2'><MetricGrid title={Texts.profit} sum='8501' /></div>
      <div className='col col-2'><MetricGrid title={Texts.margin} sum='0.25' /></div>
    </div>
  </div>
);

module.exports = Dashboard;
