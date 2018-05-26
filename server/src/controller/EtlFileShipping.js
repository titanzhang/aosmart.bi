const OrderDAL = require('../entry/dal.Order');
const OrderDAO = OrderDAL.DAO, OrderDO = OrderDAL.DO;
const ReportDAL = require('../entry/dal.Report');
const ReportDAO = ReportDAL.DAO, ReportDO = ReportDAL.DO;

module.exports = (request, response) => {
  const controller = createController(request);

  Promise.resolve()
    .then( () => controller.run() )
    .then( (model) => {
      response.send(model);
    })
    .catch( (error) => {
      // console.log(error);
      response.send({ status: false, error: (error.message || error) });
    });
};

const Fields = {
  orderNo: 'orderNo',
  cost: 'cost'
};

function createController(request) {

  function parseParameter(req) {
    if (!req.body.data) {
      throw { message: 'Invalid parameter' };
    }
    return {
      costs: JSON.parse(req.body.data)
    };
  }

  async function importData({costs}) {

    // Check order existance
    const orderNoMap = {};
    for (const costInfo of costs) {
      orderNoMap[costInfo[Fields.orderNo]] = 1;
    }
    const orderNoList = Object.keys(orderNoMap);
    const skuList = await OrderDAO.getSkuList({ orderNoList: orderNoList });

    // Update COT in Order & Report
    const costList = [], reportDoList = [];
    for (const costInfo of costs) {
      const orderNo = costInfo[Fields.orderNo];
      const cost = parseFloat(costInfo[Fields.cost]);
      if ( (!isNaN(cost)) && (skuList[orderNo] !== undefined) && cost !== 0 ) {
        costList.push(OrderDO.order({
          order_no: orderNo,
          cot: OrderDO.cot({ shipping: cost })
        }));

        const skus = skuList[orderNo] || [];
        for (const sku of skus) {
          reportDoList.push(
            ReportDO.report({
              order: ReportDO.order({order_no: orderNo, cot_shipping: cost}),
              product: ReportDO.product({sku: sku})
            })
          );
        }

      }
    }

    const [orderResponse, reportResponse] = await Promise.all([
      OrderDAO.bulkUpdateCot({ orders: costList }),
      ReportDAO.bulkUpdate({list: reportDoList})
    ]);

    return {order: orderResponse, report: reportResponse};
  };

  return {
    run: async function() {
      const {costs} = parseParameter(request);
      const {order: orderResp, report: reportResp} = await importData({costs: costs});

      return {
        status: orderResp.status,
        data: {
          success: orderResp.success.length,
          fail: orderResp.fail.length
        }
      };
    },
  };
};
