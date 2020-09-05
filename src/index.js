import React, {useState, useCallback} from 'react'
import {render} from 'react-dom'
import {BrowserRouter as Router, Switch, Route, Link, useLocation} from 'react-router-dom'
import {Provider} from 'react-redux'
import store from './store'
import 'antd/dist/antd.css'
import {Menu} from 'antd'
import {MailOutlined, AppstoreOutlined, SettingOutlined} from '@ant-design/icons'
import _ from 'lodash'
import './page/common/styles/index.less'

import Home from './page/home/index'
import LibrarySubscribe from './page/library-subscribe/index'
import LibraryRuleList from './page/library-rule-list/index'
import CurrentConfig from './page/current-config/index'

const {SubMenu} = Menu

const routes = [
  {
    path: '/',
    component: Home,
  },
]

function Root() {
  return (
    <>
      <Provider store={store}>
        <Router>
          <Routes></Routes>
        </Router>
      </Provider>
    </>
  )
}

function Routes() {
  const {pathname} = useLocation()
  const menuKey = _.trimStart(pathname, '/').replace(/\//g, ':') || 'home'

  return (
    <>
      <Menu selectedKeys={[menuKey]} mode='horizontal'>
        <Menu.Item key='home' icon={<MailOutlined />}>
          <Link to='/'>Home</Link>
        </Menu.Item>

        <Menu.Item key='library:subscribe'>
          <Link to='/library/subscribe'>订阅管理</Link>
        </Menu.Item>

        <Menu.Item key='library:rule-list'>
          <Link to='/library/rule-list'>配置源管理</Link>
        </Menu.Item>

        <Menu.Item key='current-config'>
          <Link to='/current-config'>配置管理</Link>
        </Menu.Item>
      </Menu>

      {/* A <Switch> looks through its children <Route>s and renders the first one that matches the current URL. */}
      <div>
        <Switch>
          <Route exact path='/' component={Home}></Route>
          <Route exact path='/library/subscribe' component={LibrarySubscribe}></Route>
          <Route exact path='/library/rule-list' component={LibraryRuleList}></Route>
          <Route exact path='/current-config' component={CurrentConfig}></Route>
        </Switch>
      </div>
    </>
  )
}

render(<Root />, window.app)
