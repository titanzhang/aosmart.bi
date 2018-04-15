import React from 'react';
import ReactDOM from 'react-dom';
import Loadable from 'react-loadable';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import NavHeader from './component/NavHeader';
import PageReport from './page/PageReport';
import PageData from './page/PageData';
require('./component/base.less');


// const Game = Loadable({
//   loader: () => (<span>Game</span>),
//   loading: () => <div>Loading...</div>,
// });
const Game = () => (<span>Game</span>);

const NavHeaderWrapper = () => (
  <Switch>
    <Route path="/" exact component={ () => (<NavHeader currentMenu='report'/>) }/>
    <Route path="/data" component={ () => (<NavHeader currentMenu='data'/>) }/>
  </Switch>
);

const PageWrapper = () => (
  <Switch>
    <Route path="/" exact component={PageReport}/>
    <Route path="/data" component={PageData}/>
    <Redirect to='/' />
  </Switch>
);

const WireFrame = () => (
  <Router>
    <div>
      <NavHeaderWrapper />
      <PageWrapper />
    </div>
  </Router>
);

ReactDOM.render(
  <WireFrame />,
  document.getElementById('root')
);
