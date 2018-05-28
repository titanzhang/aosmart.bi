import React from 'react';
require('./DropdownSelect.less');

// dataList: {name, value, selected}
const DropdownSelect = function({dataList, changeHandler}) {
  let selectedItem = null;
  for (const data of dataList) {
    if (data.selected) {
      selectedItem = data;
      break;
    }
  }

  return (
    <div className='dropselect'>
      <span className='dropselect__btn'>{selectedItem.name}</span>
      <ul className='dropselect_menu'>
        {dataList.map( (data, index) => (
          <li key={index} className='dropselect_menuitem' onClick={ () => changeHandler(data.value) }>{data.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default DropdownSelect;
