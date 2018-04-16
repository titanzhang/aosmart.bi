const OrderDAL = require('../entry/dal.Order');
const OrderDAO = OrderDAL.DAO, OrderDO = OrderDAL.DO;

module.exports = (request, response) => {
  const controller = createController(request);

  Promise.resolve()
    .then( () => controller.run() )
    .then( (model) => {
      response.send(model);
    })
    .catch( (error) => {
      response.send({ status: false, error: (error.message || error) });
    });
};

// URL pattern
// /report/metric?d=[start,end]&acc=[site_account, site_account]&fl=[sa,sq,oc,co,pf,mg]
function createController(request) {

  function clearTime(date) {
    if (!date) date = new Date();
    return new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
  }

  function tomorrow(date) {
    if (!date) date = new Date();
    const tmr = new Date(date.getTime() + 24 * 3600 * 1000);
    return clearTime(tmr);
  }

  function parseDate(str) {
    const year = parseInt(str.substr(4, 4)),
      month = parseInt(str.substr(0, 2)) - 1,
      date = parseInt(str.substr(2, 2));
    return new Date(year, month, date);
  }

  function parseParameter({req}) {
    const reqParam = {
      dateStart: null,
      dateEnd: null,
      accounts: [], // {site: ..., account: ...}
      filter: []
    };

    try {
      if (req.query.d) {
        let [dStart, dEnd] = JSON.parse(req.query.d);
        reqParam.dateStart = parseDate(dStart);
        reqParam.dateEnd = parseDate(dEnd);
      } else {
        reqParam.dateStart = clearTime(new Date(Date.now() - 7 * 24 * 3600 * 1000));
        reqParam.dateEnd = tomorrow();
      }

      if (req.query.acc) {
        for (const account of [].concat(JSON.parse(req.query.acc))) {
          const sepIndex = account.indexOf('_');
          if (sepIndex < 0) continue;
          reqParam.accounts.push({
            site: account.substring(0, sepIndex),
            account: account.substring(sepIndex + 1)
          });
        }
      }

      if (req.query.fl) {
        reqParam.filter = [].concat(JSON.parse(req.query.fl));
      }

      return reqParam;
    } catch(e) {
      throw { message: 'Invalid URL parameters' };
    }
  }

  async function getOrderCount({dateStart, dateEnd, accounts}) {
    const data = await OrderDAO.countByDateAccount({
      dateStart: dateStart,
      dateEnd: dateEnd,
      accounts: accounts
    });

    const result = { orderCount: 0, saleCount: 0, saleAmount: 0, saleAmount2: 0 };
    if (data) {
      result.orderCount = data.orderCount;
      result.saleCount = data.saleCount;
      result.saleAmount = data.saleAmount;
      result.saleAmount2 = data.saleAmount2;
    }
    return result;
  }

  return {
    run: async function() {
      const {dateStart, dateEnd, accounts, filter} = parseParameter({req:request});
      const result = await getOrderCount({
        dateStart: dateStart,
        dateEnd: dateEnd,
        accounts: accounts
      });

      return {
        status: true,
        data: result
      };
    }
  };

}
