import React from 'react';
require('./DataFilter.less');

const Stores = function({site, storeList, storeChangeHandler}) {
  return (
    <div className='col col-2'>
      <div>{site}</div>
      {storeList.map( (store) => {
        const v = `${site}_${store.name}`;
        return <div key={v}><label><input type='checkbox' onChange={storeChangeHandler(site, store.name)} defaultChecked={store.selected}/>{store.name}</label></div>
      })}
    </div>
  );
};

const Sites = function({list, storeChangeHandler}) {
  return (
    <div className='datafilter__row'>
      { list.map( (site) => <Stores key={site.name} site={site.name} storeList={site.stores} storeChangeHandler={storeChangeHandler}/> ) }
    </div>
  );
};

const DataFilter = ({dateStart, dateEnd, sites, storeChangeHandler, startDateChangeHandler, endDateChangeHandler, applyHandler}) => {
  return (
    <div>
      <div className='datafilter__row'>
        <div className='col col-3'><label>Start data: <input type='text' placeholder='MMDDYYYY' defaultValue={dateStart} onChange={startDateChangeHandler}/></label></div>
        <div className='col col-3'><label>End data: <input type='text' placeholder='MMDDYYYY' defaultValue={dateEnd} onChange={endDateChangeHandler}/></label></div>
      </div>
      <div className='datafilter__row'>
        <Sites list={sites} storeChangeHandler={storeChangeHandler}/>
      </div>
      <div className='datafilter__row'>
        <div className='col col2'><span className='btn' onClick={applyHandler}>Apply</span></div>
      </div>
    </div>
  );
};

export default DataFilter;
