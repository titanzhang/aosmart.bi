import React from 'react';
import Dashboard from '../component/Dashboard';
import backendConfig from '../config/backend';

const date2str = function(date, sep='') {
  let month = date.getUTCMonth() + 1,
    day = date.getUTCDate(),
    year = date.getUTCFullYear();
  month = month < 10? '0' + month: month;
  day = day < 10? '0' + day: day;
  return `${month}${sep}${day}${sep}${year}`;
};

// date: MMDDYYYY
// account: site_store
function buildApiUrl({baseUrl, dateStart, dateEnd, accounts}) {
  let url = baseUrl, sep = '?';
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

const defaultMetrics = {
  sale_amount: {sum:0},
  sale_count: {sum:0},
  order_count: {sum:0},
  cost: {sum:0},
  profit: {sum:0},
  margin: {sum:0}
};

class DashboardContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      metrics: defaultMetrics,
      hists: [],
      isFilterEnabled: false
    };

    this.filter = {
      dateStart: date2str(new Date(Date.now() - 7 * 24 * 3600 * 1000)),
      dateEnd: date2str(new Date()),
      accounts: []
    };

  }

  async getData({dateStart, dateEnd, accounts, dataTypes}) {
    const responseHandler = {
      metric: (resp) => {
        if (!resp) return;
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
        this.setState({metrics: Object.assign(this.state.metrics, newModel)});
      },
      histogram: (resp) => {
        if (!resp) return;
        const saleAmountHist = {type: 'sale_amount', xList:[], yList:[]},
          saleCountHist = {type: 'sale_count', xList: [], yList: []},
          orderCountHist = {type: 'order_count', xList: [], yList: []};
        for (const data of resp) {
          const date = date2str(new Date(data.date), '/');
          saleAmountHist.xList.push(date); saleAmountHist.yList.push(data.saleAmount.toFixed(2));
          saleCountHist.xList.push(date); saleCountHist.yList.push(data.saleCount);
          orderCountHist.xList.push(date); orderCountHist.yList.push(data.orderCount);
        }
        this.setState({hists: [saleAmountHist, saleCountHist, orderCountHist]});
      }
    };

    async function callApi(baseUrl) {
      const url = buildApiUrl({
        baseUrl: baseUrl,
        dateStart: dateStart,
        dateEnd: dateEnd,
        accounts: accounts
      });

      const response = await fetch(url);
      const data = await response.json();
      if (data.status) {
        return data.data;
      } else {
        return false;
      }
    }

    const [respMetric, respHist] = await Promise.all([
      callApi(backendConfig.metric),
      callApi(backendConfig.histogram)
    ]);
    responseHandler.metric(respMetric);
    responseHandler.histogram(respHist);
  }


  componentDidMount() {
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
      this.setState({isFilterEnabled: (newList.length > 0)})
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
        .catch((e)=>{console.log(e)});
    }
  }

  render() {
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
      applyHandler: this.filterApply(),
      isEnabled: this.state.isFilterEnabled
    };
    return <Dashboard metrics={this.state.metrics} filter={filter} hists={this.state.hists}/>;
  }
}

export default DashboardContainer;
