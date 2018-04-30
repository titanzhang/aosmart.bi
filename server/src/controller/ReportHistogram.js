const OrderDAL = require('../entry/dal.Order');
const Utils = require('../entry/common.Utils');
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
// /report/histogram?d=[start,end]&acc=[site_account, site_account]
function createController(request) {

  function parseParameter({req}) {
    const reqParam = {
      dateStart: null,
      dateEnd: null,
      accounts: [], // {site: ..., account: ...}
    };

    try {
      if (req.query.d) {
        let [dStart, dEnd] = JSON.parse(req.query.d);
        reqParam.dateStart = Utils.parseDate(dStart);
        reqParam.dateEnd = Utils.parseDate(dEnd);
      } else {
        reqParam.dateStart = Utils.clearTime(new Date(Date.now() - 7 * 24 * 3600 * 1000));
        reqParam.dateEnd = Utils.tomorrow();
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

      return reqParam;
    } catch(e) {
      throw { message: 'Invalid URL parameters' };
    }
  }

  async function getOrderHist({dateStart, dateEnd, accounts}) {
    const data = await OrderDAO.sumByDateAccountDaily({
      dateStart: dateStart,
      dateEnd: dateEnd,
      accounts: accounts
    });

    return data.map( (info) => {
      return {
        date: info.date.getTime(),
        orderCount: info.orderCount,
        saleCount: info.saleCount,
        saleAmount: info.saleAmount,
        cogAmount: info.cogAmount
      };
    })
  }

  return {
    run: async function() {
      const {dateStart, dateEnd, accounts, filter} = parseParameter({req:request});
      const result = await getOrderHist({
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
