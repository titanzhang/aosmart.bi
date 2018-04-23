import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
// import formatDate from 'date-fns/format';
// import parseDate from 'date-fns/parse';
import { format as formatDate, parse as parseDate } from 'date-fns';
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

const buildApplyButton = function({isEnabled, applyHandler}) {
  if (!isEnabled) return null;
  return <div className='col col2'><span className='btn' onClick={applyHandler}>Apply</span></div>
};

const DataFilter = ({dateStart, dateEnd, sites, storeChangeHandler, startDateChangeHandler, endDateChangeHandler, applyHandler, isEnabled}) => {
  const FORMAT = 'MM/DD/YYYY';
  return (
    <div>
      <div className='datafilter__row'>
        {/* <div className='col col-3'><label>Start data: <input type='text' placeholder='MMDDYYYY' defaultValue={dateStart} onChange={startDateChangeHandler}/></label></div> */}
        <div className='col col-3'><label>Start date:{' '}
          <DayPickerInput
            formatDate={formatDate}
            format={FORMAT}
            parseDate={parseDate}
            placeholder={FORMAT}
            value={dateStart}
            onDayChange={day => startDateChangeHandler(day)} />
          </label>
        </div>
        <div className='col col-3'><label>Start date:{' '}
          <DayPickerInput
            formatDate={formatDate}
            format={FORMAT}
            parseDate={parseDate}
            placeholder={FORMAT}
            value={dateEnd}
            onDayChange={day => endDateChangeHandler(day)} />
          </label>
        </div>
      </div>
      <div className='datafilter__row'>
        <Sites list={sites} storeChangeHandler={storeChangeHandler}/>
      </div>
      <div className='datafilter__row'>
        {buildApplyButton({isEnabled:isEnabled, applyHandler: applyHandler})}
      </div>
    </div>
  );
};

export default DataFilter;
