import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import NavHeader from './component/NavHeader';
import Loadable from 'react-loadable';
require('./component/base.less');

function Loading(props) {
  if (props.error) {
    // When the loader has errored
    return <div>Error!</div>;
  } else if (props.timedOut) {
    // When the loader has taken longer than the timeout
    return <div>Taking a long time...</div>;
  } else if (props.pastDelay) {
    // When the loader has taken longer than the delay
    return <div>Loading...</div>;
  } else {
    // When the loader has just started
    return null;
  }
}

const PageReport = Loadable({
  loader: () => import('./page/PageReport'),
  loading: (props) => Loading(props)
});

const PageData = Loadable({
  loader: () => import('./page/PageData'),
  loading: (props) => Loading(props)
});

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
