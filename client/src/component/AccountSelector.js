import React from 'react';
import DropdownSelect from './DropdownSelect';

const Texts = {
  default_item: 'Select an account'
};

class AccountSelector extends React.Component {
    constructor(props) {
      super(props)

      const {accountList, changeHandler} = props;
      this.state = {
        accountList: [{name: Texts.default_item, value: null, selected: true}].concat(
          accountList.map( (account) => ({name: account.name, value: account.name.toLowerCase(), selected: false}) )
        )
      }
      this.accountChange = changeHandler;
    }

    onAccountChange(value) {
        const newList = this.state.accountList.map( (account) => (
          {name: account.name, value: account.value, selected: account.value === value}
        ));
        this.setState({accountList: newList});
        this.accountChange(value);
    }

    render() {
      return (
        <DropdownSelect dataList={this.state.accountList} changeHandler={ (account)=>this.onAccountChange(account) } />
      );
    }
}

export default AccountSelector;
