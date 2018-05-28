import React from 'react';
import NavSidebar from '../component/NavSidebar';
import OrderUpload from '../component/DataUpload';
import CogUpload from '../component/CogUpload';
import UspsUpload from '../component/UspsUpload';
import DhlUpload from '../component/DhlUpload';
import { providers,  apis as providerApi } from '../config/provider.js';
import AccountMetadata from '../common/AccountMetadata';

const Texts = {
  nav_ebay: 'eBay Order',
  nav_amazon: 'Amazon Order',
  nav_cog: 'COG',
  nav_usps: 'USPS Cost',
  nav_dhl: 'DHL Cost',
  upload_ebay: 'Import eBay order',
  upload_amazon: 'Import Amazon order',
  upload_cog: 'Import Cost-of-Goods',
  upload_usps: 'Import USPS shipping cost',
  upload_dhl: 'Import DHL shipping cost',
  msg_upload_fail: 'Data processing failed',
  msg_upload_success: 'Data processing done'
};

const defaultNavList = [
  { id: providers.ebay, title: Texts.nav_ebay, href: null, active: false },
  { id: providers.amazon, title: Texts.nav_amazon, href: null, active: false },
  { id: providers.cog, title: Texts.nav_cog, href: null, active: false },
  { id: providers.usps, title: Texts.nav_usps, href: null, active: false },
  { id: providers.dhl, title: Texts.nav_dhl, href: null, active: false },
];

const uploadTitles = {};
uploadTitles[providers.ebay] = Texts.upload_ebay;
uploadTitles[providers.amazon] = Texts.upload_amazon;
uploadTitles[providers.cog] = Texts.upload_cog;
uploadTitles[providers.usps] = Texts.upload_usps;
uploadTitles[providers.dhl] = Texts.upload_dhl;

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

  buildUploadForm({provider}) {
    // if (provider === providers.ebay || provider === providers.amazon) {
    if (provider === providers.ebay) {
      return (
        <OrderUpload
          key={provider}
          title={uploadTitles[provider]}
          api={providerApi[provider]}
          provider={provider}
          account={AccountMetadata.getList({provider:provider})[0]}
          callback={this.uploadCallback()}
        />
      );
    } else if (provider === providers.cog) {
      return (
        <CogUpload
          key={provider}
          title={uploadTitles[provider]}
          api={providerApi[provider]}
          provider={provider}
          callback={this.uploadCallback()}
        />
      );
    } else if (provider === providers.usps) {
      return (
        <UspsUpload
          key={provider}
          title={uploadTitles[provider]}
          api={providerApi[provider]}
          provider={provider}
          callback={this.uploadCallback()}
        />
      );
    } else if (provider === providers.dhl) {
      return (
        <DhlUpload
          key={provider}
          title={uploadTitles[provider]}
          api={providerApi[provider]}
          provider={provider}
          callback={this.uploadCallback()}
        />
      );
    }
  }

  render() {
    return (
      <div>
        <NavSidebar linkList={this.state.navList} />
        <div className='main'>
          {this.buildUploadForm({provider: this.state.providerID})}
        </div>
      </div>
    );
  }
}

export default PageData;
