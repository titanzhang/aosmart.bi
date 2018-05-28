const OrderDAL = require('../entry/dal.Order');
const OrderDAO = OrderDAL.DAO, OrderDO = OrderDAL.DO;
const ProductDAL = require('../entry/dal.Product');
const ProductDAO = ProductDAL.DAO, ProductDO = ProductDAL.DO;
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

  async function getMetadata() {
    const cogMap = {};
    const cogs = await ProductDAO.getCostList({});
    for (const {sku, cog} of cogs) {
      for (const skuid of sku) {
        cogMap[skuid] = cog;
      }
    }
    return {cogs: cogMap};
  }

  async function importData({data, cogs, site='ebay', store}) {
    function getCog({sku, date, cogs}) {
      if (!cogs) return 0;
      const cogHist = cogs[sku];
      if (cogHist === undefined) return 0;

      for (const {amount, effective_date} of cogHist) {
        if (date.getTime() >= effective_date) {
          return amount;
        }
      }
      return 0;
    }

    // Convert data to OrderDO
    const orderDOList = [];
    for (const orderInfo of Object.values(data)) {
      const buyer = orderInfo[orderFields.buyer], products = orderInfo[orderFields.product];
      let buyerDO, productDOs = [];
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
        for (const product of products) {
          productDOs.push(OrderDO.product({
            sku: product[orderFields.sku],
            quantity: product[orderFields.quantity],
            price: product[orderFields.price],
            cog: getCog({
              sku: product[orderFields.sku],
              date: new Date(orderInfo[orderFields.paidDate]),
              cogs: cogs
            })
          }));
        }
      }

      let cot;
      if (site === 'ebay') { // eBayFVF and paypalFee hack
        const revenue = orderInfo[orderFields.totalPrice];
        cot = OrderDO.cot({
          commission: revenue * 0.07628,
          payment: 0.3 + revenue * 0.029
        });
      }

      orderDOList.push(OrderDO.order({
        order_no: orderInfo[orderFields.orderNo],
        buyer: buyerDO,
        amount_paid: orderInfo[orderFields.totalPrice],
        cot: cot,
        site: site,
        store: store,
        products: productDOs,
        date: orderInfo[orderFields.paidDate]
      }));
    }

    // Import order to database
    const orderResp = await OrderDAO.insertBulk({list: orderDOList});
    const failIDs = {};
    for (const id of orderResp.fail) {
      failIDs[id] = true;
    }

    // Convert data to ReportDO
    const reportDOList = [];
    for (const orderDO of orderDOList) {
      if (failIDs[orderDO.order_no] === true) continue;

      const reportOrderDO = ReportDO.order({
        order_no: orderDO.order_no,
        site: orderDO.site,
        store: orderDO.store,
        amount_paid: orderDO.amount_paid,
        date: orderDO.date
      });
      for (const productDO of orderDO.products) {
        const reportProductDO = ReportDO.product({
          sku: productDO.sku,
          quantity: productDO.quantity,
          price: productDO.price,
          cog: productDO.cog
        });
        reportDOList.push(ReportDO.report({
          order: reportOrderDO,
          product: reportProductDO
        }));
      }
    }

    const reportResp = await ReportDAO.bulkUpdate({list: reportDOList});

    return {order: orderResp, report: reportResp};
  };

  return {
    run: async function() {
      const {site, store, orders} = parseParameter(request);
      const {cogs} = await getMetadata();
      const {order: orderResp, report: reportResp} = await importData({data: orders, cogs: cogs, store: store, site: site});

      return {
        status: orderResp.status,
        data: {
          success: Math.min(orderResp.success.length, reportResp.success.length),
          fail: Math.max(orderResp.fail.length, reportResp.fail.length)
        }
      };
    },
  };
};
