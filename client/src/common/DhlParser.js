import SimpleParser from './SimpleParser';
const simpleParser = SimpleParser();

const Fields = {
  orderNo: 'orderNo',
  cost: 'cost'
};

const DataParser = {
  orderNo: (v) => {
    return v.replace(/[ .]/g, '');
  },
  amount: (v) => {
    const result = parseFloat(v.replace(/[$]/gi, ''));
    return isNaN(result)? 0: result;
  }
};

const dataMapping = [
  simpleParser.createMapping({ name: Fields.orderNo, index: 11, parser: DataParser.orderNo }),
  simpleParser.createMapping({ name: Fields.cost, index: 29, parser: DataParser.amount })
];

const Parser = function() {
  return {
    parse: function({text, noHeader}) {
      return simpleParser.parse({
        text: text,
        noHeader: noHeader,
        dataMapping: dataMapping
      });
    }
  };
}

export default Parser;
