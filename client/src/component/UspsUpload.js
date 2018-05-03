import React from 'react';
import DataParser from '../common/UspsParser';
require('./DataUpload.less');
require('./button.less');

const Texts = {
  label_selectfile: 'Select a file',
  label_noheader: 'No header line',
  button_import: 'Import',
  button_uploading: 'Processing ...',
  msg_no_file: 'No file selected',
  msg_upload_fail: 'Data processing failed'
};

class UspsUpload extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isUploading: false
    };
    this.api = props.api;
    this.provider = props.provider;
    this.file = null;
    this.noHeader = false;
    this.callback = props.callback;
  }

  selectFileHandler(event) {
    this.file = event.target.files[0];
  }

  noHeaderHandler(event) {
    this.noHeader = event.target.checked;
  }

  readFile(file) {
    return new Promise( (resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (evt) => resolve(evt.target.result);
      reader.readAsText(file);
    });
  }

  async groupSend({dataList, size, api}) {
    const groups = [];
    let group = [];
    for (const data of dataList) {
      if (group.length >= size) {
        groups.push(group);
        group = [];
      }
      group.push(data);
    }
    if (group.length > 0) groups.push(group);

    const result = { status: true, data: { success: 0, fail: 0 } };
    for (const group of groups) {
      const resp = await this.send({data: group, api: api});
      result.status = result.status && resp.status;
      if (resp.data) {
        result.data.success += resp.data.success;
        result.data.fail += resp.data.fail;
      }
    }

    return result;
  }

  async send({data, api}) {
    const formBody = [];
    formBody.push(`data=${encodeURIComponent(JSON.stringify(Object.values(data)))}`);

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

      this.setState({isUploading: true});
      this.readFile(this.file)
        .then( (content) => DataParser().parse({text: content, noHeader: this.noHeader}))
        .then( (data) => this.groupSend({
          dataList: Object.values(data),
          size: 200,
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
    const SEP = '/', FORMAT = 'MM/DD/YYYY';
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
          {this.buildUploadButton()}
        </div>
      </div>
    );
  }
}

export default UspsUpload;
