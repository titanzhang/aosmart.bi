import React from 'react';
import Dashboard from '../component/Dashboard';
import backendConfig from '../config/backend';

const date2str = function(date) {
  let month = date.getMonth() + 1,
    day = date.getDate(),
    year = date.getFullYear();
  month = month < 10? '0' + month: month;
  day = day < 10? '0' + day: day;
  return `${month}${day}${year}`;
};

class DashboardContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metrics: {
        sale_amount: {sum:0},
        sale_count: {sum:0},
        order_count: {sum:0},
        cost: {sum:0},
        profit: {sum:0},
        margin: {sum:0}
      }
    };

    this.filter = {
      dateStart: date2str(new Date(Date.now() - 7 * 24 * 3600 * 1000)),
      dateEnd: date2str(new Date()),
      accounts: []
    };

  }

  // date: MMDDYYYY
  // account: site_store
  buildApiCall({dateStart, dateEnd, accounts}) {
    let url = backendConfig.metric, sep = '?';
    if (dateStart && dateEnd) {
      url += `${sep}d=${encodeURIComponent(JSON.stringify([dateStart, dateEnd]))}`;
      sep = '&';
    }
    if (accounts && accounts.length > 0) {
      url += `${sep}acc=${encodeURIComponent(JSON.stringify(accounts))}`;
      sep = '&';
    }
    return url;
  }

  getData({dateStart, dateEnd, accounts}) {
    const url = this.buildApiCall({
      dateStart: dateStart,
      dateEnd: dateEnd,
      accounts: accounts
    });

    return fetch(url)
      .then( (response) => response.json())
      .then( (data) => {
        if (data.status) {
          return data.data;
        } else {
          return false;
        }
      });
  }

  updateData(resp) {
    const newModel = {};
    if (resp.saleAmount !== undefined) {
      newModel.sale_amount = {sum:resp.saleAmount.toFixed(2)};
    }
    if (resp.saleCount !== undefined) {
      newModel.sale_count = {sum: resp.saleCount};
    }
    if (resp.orderCount !== undefined) {
      newModel.order_count = {sum: resp.orderCount};
    }
    this.setState({model: Object.assign(this.state.metrics, newModel)});
  }

  componentDidMount() {
    // Promise.resolve()
    //   .then(()=>this.getData())
    //   .then( (resp) => this.updateData(resp) )
    //   .catch((e)=>{});
  }

  filterStoreChange(site, name) {
    return (event) => {
      const store = `${site}_${name}`;
      const newList = [];
      for (const account of this.filter.accounts) {
        if (account !== store) newList.push(account);
      }
      if (event.target.checked) {
        newList.push(store);
      }
      this.filter.accounts = newList;
    };
  }

  filterDateChange(type) {
    return (event) => {
      this.filter[type] = event.target.value;
    }
  }

  filterApply() {
    return () => {
      Promise.resolve()
        .then(()=>this.getData(this.filter))
        .then( (resp) => this.updateData(resp) )
        .catch((e)=>{});
    }
  }

  render() {
    const metrics = {
      sale_amount: this.state.metrics.sale_amount,
      sale_count: this.state.metrics.sale_count,
      order_count: this.state.metrics.order_count,
      cost: this.state.metrics.cost,
      profit: this.state.metrics.profit,
      margin: this.state.metrics.margin
    };
    const filter = {
      sites: [
        { name: 'ebay', stores: [{name: 'aosmart'}, {name: 'aosmart1'}, {name: 'aosmart2'}] },
        { name: 'amazon', stores: [{name: 'aosmart'}, {name: 'aosmart1'}, {name: 'aosmart2'}] },
      ],
      dateStart: this.filter.dateStart,
      dateEnd: this.filter.dateEnd,
      storeChangeHandler: this.filterStoreChange.bind(this),
      startDateChangeHandler: this.filterDateChange('dateStart'),
      endDateChangeHandler: this.filterDateChange('dateEnd'),
      applyHandler: this.filterApply()
    };
    return <Dashboard metrics={metrics} filter={filter}/>;
  }
}

export default DashboardContainer;
