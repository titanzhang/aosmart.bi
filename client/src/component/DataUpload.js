import React from 'react';
import DataParser from '../common/DataParser';
import AccountSelector from './AccountSelector';
// import CSV from 'csvtojson';
require('./DataUpload.less');
require('./button.less');

const Texts = {
  label_selectfile: 'Select a file',
  label_noheader: 'No header line',
  label_account: 'Account',
  button_import: 'Import',
  button_uploading: 'Processing ...',
  msg_no_file: 'No file selected',
  msg_no_account: 'No account specified',
  msg_upload_fail: 'Data processing failed'
};

class DataUpload extends React.Component {
  constructor(props) {
    const {api, provider, account, callback} = props;
    super(props);
    this.state = {
      isUploading: false
    };
    this.api = api;
    this.provider = provider;
    this.file = null;
    this.noHeader = false;
    this.account = '';
    this.accounts = account.stores;
    this.callback = callback;
  }

  selectFileHandler(event) {
    this.file = event.target.files[0];
  }

  noHeaderHandler(event) {
    this.noHeader = event.target.checked;
  }

  accountHandler(account) {
    this.account = account;
  }

  readFile(file) {
    return new Promise( (resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => resolve(evt.target.result);
      reader.readAsText(file);
    });
  }

  async groupSendOrders({orders, size, store, api}) {
    const orderGroups = [];
    let group = [];
    for (const order of orders) {
      if (group.length >= size) {
        orderGroups.push(group);
        group = [];
      }
      group.push(order);
    }
    if (group.length > 0) orderGroups.push(group);

    const result = { status: true, data: { success: 0, fail: 0 } };
    for (const orderGroup of orderGroups) {
      const resp = await this.sendOrders({orders: orderGroup, store: store, api: api});
      result.status = result.status && resp.status;
      if (resp.data) {
        result.data.success += resp.data.success;
        result.data.fail += resp.data.fail;
      }
    }

    return result;
  }

  async sendOrders({orders, store, api}) {
    const formBody = [];
    formBody.push(`orders=${encodeURIComponent(JSON.stringify(Object.values(orders)))}`);
    formBody.push(`store=${encodeURIComponent(store)}`);

    const response = await fetch(api, {
      method: 'POST',
      body: formBody.join('&'),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    });

    return response.json();
  }

  upload() {
    try {
      if (!this.file) throw Texts.msg_no_file;
      if (!this.account || this.account.trim().length === 0) throw Texts.msg_no_account;

      this.setState({isUploading: true});
      this.readFile(this.file)
        .then( (content) => DataParser().parse({text: content, noHeader: this.noHeader}))
        .then( (orders) => this.groupSendOrders({
          orders: Object.values(orders),
          size: 100,
          store: this.account,
          api: this.api
        }))
        .then( (response) => {
            this.setState({isUploading: false});
            setTimeout(()=>this.callback({response: response}),0);
        })
        .catch( (error) => {
          this.setState({isUploading: false});
          setTimeout(()=>this.callback({error: Texts.msg_upload_fail}),0);
        })
    } catch(e) {
      this.setState({isUploading: false});
      setTimeout(()=>this.callback({error: e}),0);
    }
  }

  buildUploadButton() {
    if (this.state.isUploading) {
      return <span className='btn btn--large'>{Texts.button_uploading}</span>
    } else {
      return <span className='btn btn--large' onClick={ () => this.upload() } >{Texts.button_import}</span>
    }
  }

  render() {
    return (
      <div className='dataupload'>
        <div className='dataupload__row'><div className='dataupload__title'>{this.props.title}</div></div>
        <div className='dataupload__row'>
          <label className='btn'><input onChange={(e)=>this.selectFileHandler(e)} type='file' style={{display:'none'}} />{Texts.label_selectfile}</label>
        </div>
        <div className='dataupload__row'>
          <label>
            <input name='no_header' type='checkbox' onChange={ (e)=>this.noHeaderHandler(e) } />
            {Texts.label_noheader}
          </label>
        </div>
        <div className='dataupload__row'>
          <label>
            {Texts.label_account + ' '}
            <AccountSelector accountList={this.accounts} changeHandler={(account)=>this.accountHandler(account)} />
          </label>
        </div>
        <div className='dataupload__row'>
          {this.buildUploadButton()}
        </div>
      </div>
    );
  }
}

export default DataUpload;
