const React = require('react');
require('./MetricGrid.less');

const MetricGrid = (props) => {
  return (
    <div className='metric_grid'>
      <div className='metric_grid__title'>{props.title}</div>
      <p className='metric_grid__sum'>{props.sum}</p>
    </div>
  );
};

module.exports = MetricGrid;
