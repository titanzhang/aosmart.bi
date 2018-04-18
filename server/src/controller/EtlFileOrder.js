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

const orderFields = {
  orderNo: 'orderNo',
  totalPrice: 'totalPrice',
  product: 'product',
  sku: 'sku',
  price: 'price',
  quantity: 'quantity',
  buyer: 'buyer',
  buyerName: 'buyerName',
  buyerStreet1: 'buyerStreet1',
  buyerStreet2: 'buyerStreet2',
  buyerCity: 'buyerCity',
  buyerState: 'buyerState',
  buyerPostalCode: 'buyerPostalCode',
  buyerCountry: 'buyerCountry',
  paidDate: 'paidDate',
  orderID: 'orderID',
  itemID: 'itemID'
};

function createController(request) {

  function parseParameter(req) {
    if (!req.params.site || !req.body.store || !req.body.orders) {
      throw { message: 'Invalid parameter' };
    }
    return {
      site: req.params.site,
      store: req.body.store,
      orders: JSON.parse(req.body.orders)
    };
  }

  async function importData({data, site='ebay', store}) {

    // Convert data to DO
    const orderDOList = [];
    for (const orderInfo of Object.values(data)) {
      const buyer = orderInfo[orderFields.buyer], products = orderInfo[orderFields.product];
      let buyerDO, productDOs;
      if (buyer) {
        buyerDO = OrderDO.buyer({
          name: buyer[orderFields.buyerName],
          street1: buyer[orderFields.buyerStreet1],
          street2: buyer[orderFields.buyerStreet2],
          city: buyer[orderFields.buyerCity],
          state: buyer[orderFields.buyerState],
          country: buyer[orderFields.buyerCountry],
          postal_code: buyer[orderFields.buyerPostalCode]
        });
      }

      if (products && products.length > 0) {
        productDOs = [];
        for (const product of products) {
          productDOs.push(OrderDO.product({
            sku: product[orderFields.sku],
            quantity: product[orderFields.quantity],
            price: product[orderFields.price]
          }));
        }
      }

      orderDOList.push(OrderDO.order({
        order_no: orderInfo[orderFields.orderNo],
        buyer: buyerDO,
        amount_paid: orderInfo[orderFields.totalPrice],
        site: site,
        store: store,
        products: productDOs,
        date: orderInfo[orderFields.paidDate]
      }));
    }

    // Import to database
    return await OrderDAO.insertBulk({list: orderDOList});
  };

  return {
    run: async function() {
      const {site, store, orders} = parseParameter(request);
      const result = await importData({data: orders, store: store, site: site});

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
