const ProductDAL = require('../entry/dal.Product');
const ProductDAO = ProductDAL.DAO, ProductDO = ProductDAL.DO;

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
  sku: 'sku',
  effectiveDate: 'effectiveDate',
  fob: 'fob'
};

function createController(request) {

  function parseParameter(req) {
    if (!req.body.costs) {
      throw { message: 'Invalid parameter' };
    }
    return {
      costs: JSON.parse(req.body.costs)
    };
  }

  async function importData({costs}) {

    // Convert data to DO
    const costList = [];
    for (const costInfo of costs) {
      const sku = costInfo[Fields.sku], effectiveDate = new Date(costInfo[Fields.effectiveDate]);

      const fob = parseFloat(costInfo[Fields.fob]);
      if (!isNaN(fob)) {
        const costDO = ProductDO.cost({
          amount: fob,
          effective_date: effectiveDate
        });
        costList.push({sku: sku, cost: costDO});
      }
    }

    // Import to database
    return await ProductDAO.bulkAddCog({list: costList});
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
