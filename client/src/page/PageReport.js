import React from 'react';
import NavSidebar from '../component/NavSidebar';
import Dashboard from '../container/DashboardContainer';

const Texts = {
  nav_dashboard: 'Dashboard',
  nav_details: 'Details'
}
const dashboardNavList = [
  { title: Texts.nav_dashboard, href: null, active: true },
  { title: Texts.nav_details, href: null, active: false }
];

const PageReport = (props) => {
  return (
    <div>
      <NavSidebar linkList={dashboardNavList} />
      <div className='main'>
        <Dashboard />
      </div>
    </div>
  );
};

export default PageReport;
