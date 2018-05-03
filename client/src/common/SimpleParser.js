import CSV from 'csvtojson';

const Parser = function() {
  return {
    createMapping: function({name, index, parser}) {
      return { name: name, index: index, parser: parser };
    },
    parse: function({text, noHeader, dataMapping, defaultRow = {}}) {
      return new Promise( (resolve, reject) => {
        try {
          const result = [];
          const csv = CSV({noheader: noHeader});
          csv.fromString(text)
          .on('csv', (csvrow) => {
            const row = Object.assign({}, defaultRow);
            for (const field of dataMapping) {
              const data = csvrow[field.index].trim();
              if (data.length === 0) return;
              row[field.name] = field.parser? field.parser(data): data;
            }
            result.push(row);
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
    }
  };
}

export default Parser;
