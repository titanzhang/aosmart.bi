import React from 'react';
import DayPickerInput from 'react-day-picker/DayPickerInput';
import 'react-day-picker/lib/style.css';
// import formatDate from 'date-fns/format';
// import parseDate from 'date-fns/parse';
// import { format as formatDate, parse as parseDate } from 'date-fns';
require('./DataFilter.less');

function formatDate(date, sep='/') {
  const year = date.getUTCFullYear(),
    month = date.getUTCMonth() + 1,
    day = date.getUTCDate();
  return `${month<10?'0':''}${month}${sep}${day<10?'0':''}${day}${sep}${year}`;
}

function parseDate(str, sep='/') {
  const [month, date, year] = str.split(sep).map((v)=>parseInt(v));
  if (isNaN(month) || isNaN(date) || isNaN(year)) return;
  if ((month < 1|| month > 12) || (date < 1 || date > 31) || (year < 1970)) return;
  return new Date(year, month - 1, date);
}

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
  const SEP = '/', FORMAT = 'MM/DD/YYYY';
  return (
    <div>
      <div className='datafilter__row'>
        {/* <div className='col col-3'><label>Start data: <input type='text' placeholder='MMDDYYYY' defaultValue={dateStart} onChange={startDateChangeHandler}/></label></div> */}
        <span>Date:{' '}
          <DayPickerInput
            formatDate={formatDate}
            format={SEP}
            parseDate={parseDate}
            placeholder={FORMAT}
            value={dateStart}
            onDayChange={day => startDateChangeHandler(day)} />
          {' '}--{' '}
          <DayPickerInput
            formatDate={formatDate}
            format={SEP}
            parseDate={parseDate}
            placeholder={FORMAT}
            value={dateEnd}
            onDayChange={day => endDateChangeHandler(day)} />
        </span>
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
