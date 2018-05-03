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

    // Convert data to DO
    const costList = [];
    for (const costInfo of costs) {
      const orderNo = costInfo[Fields.orderNo];
      const cost = parseFloat(costInfo[Fields.cost]);
      if (!isNaN(cost)) {
        costList.push(OrderDO.order({
          order_no: orderNo,
          cot: OrderDO.cot({ shipping: cost })
        }));
      }
    }

    // Import to database
    return await OrderDAO.bulkUpdateCot({orders: costList});
  };

  return {
    run: async function() {
      const {costs} = parseParameter(request);
      const result = await importData({costs: costs});

      return {
        status: result.status,
        data: {
          success: result.success.length,
          fail: result.fail.length
        }
      };
    },
  };
};
