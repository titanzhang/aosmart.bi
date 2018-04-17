import React from 'react';
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
    super(props);
    this.state = {
      isUploading: false
    };
    this.api = props.api;
    this.provider = props.provider;
    this.file = null;
    this.noHeader = false;
    this.account = '';
    this.callback = props.callback;
  }

  selectFileHandler(event) {
    this.file = event.target.files[0];
  }

  noHeaderHandler(event) {
    this.noHeader = event.target.checked;
  }

  accountHandler(event) {
    this.account = event.target.value;
  }

  upload() {
    try {
      if (!this.file) throw Texts.msg_no_file;
      if (!this.account || this.account.trim().length === 0) throw Texts.msg_no_account;

      this.setState({isUploading: true});
      const data = new FormData();
      data.append('file', this.file);
      data.append('no_header', this.noHeader);
      data.append('account', this.account);

      fetch(this.api, {
        method: 'POST',
        body: data
      })
      .then( (response) => response.json() )
      .then( (response) => {
        this.setState({isUploading: false});
        setTimeout(()=>this.callback({response: response}),0);
      })
      .catch( (error) => {
        this.setState({isUploading: false});
        setTimeout(()=>this.callback({error: Texts.msg_upload_fail}),0);
      });
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
            <input name='account' type='text' onChange={ (e) => this.accountHandler(e) } />
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
