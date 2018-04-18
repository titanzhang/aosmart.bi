import React from 'react';
import NavSidebar from '../component/NavSidebar';
import DataUpload from '../component/DataUpload';
import { providers,  apis as providerApi } from '../config/provider.js';

const Texts = {
  nav_ebay: 'eBay',
  nav_amazon: 'Amazon',
  upload_ebay: 'Import eBay order',
  upload_amazon: 'Import Amazon order',
  msg_upload_fail: 'Data processing failed',
  msg_upload_success: 'Data processing done'
};

const defaultNavList = [
  { id: providers.ebay, title: Texts.nav_ebay, href: null, active: false },
  { id: providers.amazon, title: Texts.nav_amazon, href: null, active: false }
];

const uploadTitles = {};
uploadTitles[providers.ebay] = Texts.upload_ebay;
uploadTitles[providers.amazon] = Texts.upload_amazon;

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

  uploadCallback() {
    return ({response, error}) => {
      if (error) {
        alert(error.message || error);
      }
      if (response) {
        if (!response.status) {
          alert(`${Texts.msg_upload_fail}(success:${response.data? response.data.success: 'N/A'}, fail:${response.data? response.data.fail: 'N/A'})`);
        } else {
          alert(`${Texts.msg_upload_success}(success:${response.data.success}, fail:${response.data.fail})`)
        }
      }
    }
  }

  render() {
    return (
      <div>
        <NavSidebar linkList={this.state.navList} />
        <div className='main'>
          <DataUpload
            key={this.state.providerID}
            title={uploadTitles[this.state.providerID]}
            api={providerApi[this.state.providerID]}
            provider={this.state.providerID}
            callback={this.uploadCallback()}
          />
        </div>
      </div>
    );
  }
}

export default PageData;
