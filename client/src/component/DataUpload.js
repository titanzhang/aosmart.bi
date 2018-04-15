import React from 'react';
// import CSV from 'csvtojson';
require('./DataUpload.less');
require('./button.less');

const Texts = {
  label_selectfile: 'Select a file',
  label_noheader: 'No header line',
  label_account: 'Account',
  button_import: 'Import',
  msg_no_file: 'No file selected',
  msg_no_account: 'No account specified',
  msg_upload_fail: 'Data processing failed'
};

class DataUpload extends React.Component {
  constructor(props) {
    super(props);
    this.api = props.api;
    this.provider = props.provider;
    this.file = null;
    this.noHeader = false;
    this.account = '';
  }

  selectFileHandler(event) {
    this.file = event.target.files[0];

    // const reader = new FileReader();
    // reader.onload = (e) => this.setFileContent(e.target.result);
    // reader.readAsText(file);
  }

  // setFileContent(content) {
  //   const result = [];
  //   const csv = CSV({noheader: false});
  //   csv.fromString(content.split('\n').slice(0, 10).join('\n'))
  //   .on('header', (header) => {
  //     // console.log(header);
  //   })
  //   .on('csv', (csvrow) => {
  //     const row = [];
  //     for (const field of this.headerDef) {
  //       row.push(csvrow[field.index]);
  //     }
  //     result.push(row);
  //   })
  //   .on('done', (error) => {
  //     if (error) console.log(error);
  //     console.log(result);
  //     this.setState({ previewList: result });
  //   });
  // }

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

      const data = new FormData();
      data.append('file', this.file);
      data.append('no_header', this.noHeader);
      data.append('account', this.account);

      fetch(this.api, {
        method: 'POST',
        body: data
      })
      .then( (response) => {
        console.log(response);
      })
      .catch( (error) => {
        console.log(error);
        alert(Texts.msg_upload_fail);
      });
    } catch(e) {
      alert(e);
    }
    // console.log(this.api, this.file, this.noHeader, this.account);
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
          <span className='btn btn--large' onClick={ () => this.upload() } >{Texts.button_import}</span>
        </div>
      </div>
    );
  }
}

export default DataUpload;
