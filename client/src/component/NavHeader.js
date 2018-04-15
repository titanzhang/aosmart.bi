const React = require('react');
require('./NavHeader.less');

const Texts = {
  menu_title: 'AOSmart',
  menu_report: 'Report',
  menu_data: 'Data',
};

const headerItems = {
  report: [Texts.menu_report, '/'],
  data: [Texts.menu_data, '/data'],
};

const buildMenu = (name, currentMenu) => {
  const [text, link] = headerItems[name];
  if (!text) return null;
  if (name === currentMenu) {
    return <li className='nav-item col active'><a className='navlink' href={link || 'javascript:void(0);'}>{text}</a></li>;
  }
  else {
    return <li className='nav-item col'><a className='navlink' href={link || 'javascript:void();'}>{text}</a></li>;
  }
};

const NavHeader = (props) => {
  return (
    <nav className='navbar'>
      <div className='container row'>
        <div className='navbar-title col'><a className='navlink' href='/'>{Texts.menu_title}</a></div>
        <ul className='navbar-menu col'>
          {buildMenu('report', props.currentMenu)}
          {buildMenu('data', props.currentMenu)}
        </ul>
      </div>
    </nav>
  );
};

module.exports = NavHeader;
