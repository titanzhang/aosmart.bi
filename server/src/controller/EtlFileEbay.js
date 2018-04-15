const CSV = require('csvtojson');
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

const CountryCode = {
  default: 'Other',
  us: 'US'
};
const CountryMapping = {
  'United States': CountryCode.us
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

const Parser = {
  price: (v) => {
    return parseFloat(v.replace(/[$]/gi, ''));
  },
  quantity: parseInt,
  date: (v) => {
    return (new Date(v)).getTime();
  },
  country: (v) => {
    return CountryMapping[v] || v;
  }
};

const dataMapping = [
  { name: orderFields.orderNo, index: 0 },
  { name: orderFields.totalPrice, index: 20, parser: Parser.price }, // total amount of the order
  { name: orderFields.sku, index: 31 }, // Per item
  { name: orderFields.price, index: 16, parser: Parser.price }, // Per item
  { name: orderFields.quantity, index: 15, parser: Parser.quantity }, // Per item
  { name: orderFields.buyerName, index: 2 },
  { name: orderFields.buyerStreet1, index: 5 },
  { name: orderFields.buyerStreet2, index: 6 },
  { name: orderFields.buyerCity, index: 7 },
  { name: orderFields.buyerState, index: 8} ,
  { name: orderFields.buyerPostalCode, index: 9 },
  { name: orderFields.buyerCountry, index: 10 , parser: Parser.country },
  { name: orderFields.paidDate, index: 25, parser: Parser.date },
  { name: orderFields.orderID, index: 11 } // eBay orderID, will be set if the order consists of multiple items
];

function createController(request) {

  function parseParameter(req) {
      if (!req.file || req.body.no_header === undefined || req.body.account === undefined || req.body.account.length === 0) {
        throw { message: 'Invalid parameter' };
      }

      return {
        noHeader: req.body.no_header === 'true',
        account: req.body.account,
        file: req.file
      };
  }

  function copyFieldInfos(source, target, fields) {
    for (const field of fields) {
      target[field] = source[field];
    }
  };

  function parseBuyerInfo(row, info) {
    const buyInfo = {};
    copyFieldInfos(row, buyInfo, [
      orderFields.buyerName,
      orderFields.buyerStreet1,
      orderFields.buyerStreet2,
      orderFields.buyerCity,
      orderFields.buyerState,
      orderFields.buyerPostalCode,
      orderFields.buyerCountry
    ]);

    if (info) {
      info[orderFields.buyer] = buyInfo;
    }
    return buyInfo;
  };

  function parseItemInfo(row, info) {
    const itemInfo = {};
    copyFieldInfos(row, itemInfo, [
      orderFields.sku,
      orderFields.price,
      orderFields.quantity
    ]);

    if (info) {
      if (!info[orderFields.product]) info[orderFields.product] = [];
      info[orderFields.product].push(itemInfo);
    }
    return itemInfo;
  };

  function parseOrderInfo(row, info) {
    if (!info) info = {};
    copyFieldInfos(row, info, [
      orderFields.totalPrice,
      orderFields.paidDate
    ]);
    return info;
  };

  function addRow(result, row) {
    const orderNo = row[orderFields.orderNo];
    const orderInfo = result[orderNo] || {};

    orderInfo[orderFields.orderNo] = orderNo;
    if (!orderInfo[orderFields.product]) orderInfo[orderFields.product] = [];

    if (row[orderFields.orderID].length > 0) {
      // multi-item order - parent order
      parseOrderInfo(row, orderInfo);
      parseBuyerInfo(row, orderInfo);
    } else {
      if (!isNaN(row[orderFields.totalPrice])) {
        // single item order
        parseOrderInfo(row, orderInfo);
        parseBuyerInfo(row, orderInfo);
        parseItemInfo(row, orderInfo);
      } else {
        // multi-item order - sub order
        parseItemInfo(row, orderInfo);
      }
    }

    result[orderNo] = orderInfo;
  };

  function parseFile(file, noHeader) {

    return new Promise( (resolve, reject) => {
      try {
        const result = {}; // {orderNo: data}
        const csv = CSV({noheader: noHeader});
        csv.fromString(file.buffer.toString())
        .on('csv', (csvrow) => {
          const row = {};
          for (const field of dataMapping) {
            const data = csvrow[field.index].trim();
            row[field.name] = field.parser? field.parser(data): data;
          }
          addRow(result, row);
        })
        .on('done', (error) => {
          if (error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      } catch (e) {
        reject(e);
      }
    });
  };

  const importData = async function({data, site='ebay', account}) {

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
        store: account,
        products: productDOs,
        date: orderInfo[orderFields.paidDate]
      }));
    }

    // Import to database
    return await OrderDAO.insertBulk({list: orderDOList});
  };

  return {
    run: async function() {
      const {noHeader, account, file} = parseParameter(request);
      const data = await parseFile(file, noHeader);
      const result = await importData({data: data, account: account});

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
