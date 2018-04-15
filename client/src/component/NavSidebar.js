import React from 'react';
require('./NavSidebar.less');

const LinkList = (props) => {
  const linkList = props.linkList;
  if (!linkList) return null;
  return linkList.map((link) => {
    const href = link.href || 'javascript:void(0);';
    const className = link.active? 'sidenav__link sidenav__link--active': 'sidenav__link';
    const clickHandler = link.clickHandler;

    if (clickHandler) {
      return (<a key={link.title} href={href} className={className} onClick={clickHandler}>{link.title}</a>);
    } else {
      return (<a key={link.title} href={href} className={className}>{link.title}</a>);
    }
  });
};

const NavSidebar = (props) => {
  return (
    <div className='sidenav'>
      <LinkList linkList={props.linkList} />
    </div>
  );
};

export default NavSidebar;
