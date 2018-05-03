import React from 'react';
import Dashboard from '../component/Dashboard';
import backendConfig from '../config/backend';
import Utils from '../common/Utils';

// account: site_store
function buildApiUrl({baseUrl, dateStart, dateEnd, accounts}) {
  let url = baseUrl, sep = '?';
  if (dateStart && dateEnd) {
    url += `${sep}d=${encodeURIComponent(JSON.stringify([
      Utils.formatDate(dateStart, ''),
      Utils.formatDate(dateEnd, '')]))}`;
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
      dateStart: new Date(Date.now() - 7 * 24 * 3600 * 1000),
      dateEnd: new Date(),
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
        if (resp.cogAmount !== undefined) {
          newModel.cost = {sum: resp.cogAmount.toFixed(2)};
        }
        if (resp.saleAmount !== undefined && resp.cogAmount !== undefined) {
          const profit = resp.saleAmount - resp.cogAmount;
          newModel.profit = {sum: profit.toFixed(2)};
          const margin = resp.saleAmount > 0? profit * 100/resp.saleAmount: 0.00;
          newModel.margin = {sum: `${margin.toFixed(1)} %`};
        }
        this.setState({metrics: Object.assign(this.state.metrics, newModel)});
      },
      histogram: (resp) => {
        if (!resp) return;
        const saleAmountHist = {type: 'sale_amount', xList:[], yList:[]},
          saleCountHist = {type: 'sale_count', xList: [], yList: []},
          orderCountHist = {type: 'order_count', xList: [], yList: []},
          costHist = {type: 'cost', xList: [], yList: []},
          profitHist = {type: 'profit', xList: [], yList: []},
          marginHist = {type: 'margin', xList: [], yList: []};
        for (const data of resp) {
          const date = Utils.formatDate(new Date(data.date), '/');
          saleAmountHist.xList.push(date); saleAmountHist.yList.push(data.saleAmount.toFixed(2));
          saleCountHist.xList.push(date); saleCountHist.yList.push(data.saleCount);
          orderCountHist.xList.push(date); orderCountHist.yList.push(data.orderCount);
          costHist.xList.push(date); costHist.yList.push(data.cogAmount.toFixed(2));
          const profit = data.saleAmount - data.cogAmount;
          profitHist.xList.push(date); profitHist.yList.push(profit.toFixed(2));
          const margin = data.saleAmount > 0? profit * 100/data.saleAmount: 0.00;
          marginHist.xList.push(date); marginHist.yList.push((profit * 100 / data.saleAmount).toFixed(1));
        }
        this.setState({hists: [saleAmountHist, saleCountHist, orderCountHist, costHist, profitHist, marginHist]});
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
    return (date) => {
      this.filter[type] = date;
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
