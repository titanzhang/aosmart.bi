import React from 'react';
import NavSidebar from '../component/NavSidebar';
import DataUpload from '../component/DataUpload';
import { providers,  apis as providerApi } from '../config/provider.js';

const Texts = {
  nav_ebay: 'eBay',
  nav_amazon: 'Amazon',
  upload_ebay: 'Import eBay data',
  upload_amazon: 'Import Amazon data'
};

const defaultNavList = [
  { id: providers.ebay, title: Texts.nav_ebay, href: null, active: false },
  { id: providers.amazon, title: Texts.nav_amazon, href: null, active: false }
];

const uploadTitles = {};
uploadTitles[providers.ebay] = Texts.upload_ebay;
uploadTitles[providers.amazon] = Texts.upload_amazon;

// const orderFields = {
//   orderNo: 'orderNo',
//   sku: 'sku',
//   price: 'price',
//   quantity: 'quantity'
// };
//
// const headerOrderEbay = [
//   { name: orderFields.orderNo, index: 0 },
//   { name: orderFields.sku, index: 31},
//   { name: orderFields.price, index: 16},
//   { name: orderFields.quantity, index: 15}
// ];

class PageData extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      providerID: providers.ebay,
      navList: this.createNavList(providers.ebay)
    };
  }

  createNavList(currentProvider) {
    return defaultNavList.map( (navItem) => {
      const newItem = Object.assign({}, navItem);
      newItem.active = (newItem.id === currentProvider);
      newItem.clickHandler = this.createNavClickHandler(newItem.id);
      return newItem;
    });
  }

  createNavClickHandler(provider) {
    return () => {
      const navList = this.createNavList(provider);
      this.setState({
        providerID: provider,
        navList: navList
      });
    }
  }

  render() {
    return (
      <div>
        <NavSidebar linkList={this.state.navList} />
        <div className='main'>
          <DataUpload key={this.state.providerID} title={uploadTitles[this.state.providerID]} api={providerApi[this.state.providerID]} provider={this.state.providerID}/>
        </div>
      </div>
    );
  }
}

export default PageData;
