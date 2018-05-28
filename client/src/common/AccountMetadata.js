import { providers } from '../config/provider.js';

const metadata = {
  sites: [
    {
      name: 'ebay',
      provider: providers.ebay,
      stores: [
        {name: 'afl-ebay', country: []},
        {name: 'ancer-us', country: []},
        {name: 'anysaving', country: []},
        {name: 'bestsaving', country: []}
      ]
    },

    {
      name: 'amazon',
      provider: providers.amazon,
      stores: [
        {name: 'Ezone', country: ['us', 'ca', 'mx']},
        {name: 'Aosmart', country: ['us', 'ca', 'mx']},
        {name: 'Alf', country: ['ca', 'mx']},
        {name: 'Techfaith', country: ['us', 'ca', 'mx']}
      ]
    }

  ]
};

const AccountMetadata = {
  getList: function({provider}={}) {
    const result = [];
    for (const site of metadata.sites) {
      if (provider === undefined || site.provider === provider) {
        result.push({
          name: site.name,
          provider: site.provider,
          stores: site.stores.map( (store) => ({
            name: store.name,
            country: [].concat(store.country)
          }) )
        });
      }
    }
    return result;
  }
};

export default AccountMetadata;
