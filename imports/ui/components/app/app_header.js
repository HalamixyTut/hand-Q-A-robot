import React from 'react';
import PropTypes from 'prop-types';
import { FormattedMessage } from 'react-intl';
import AppHeaderBulletinMenu from './header_menus/app_header_bulletin_menu';
import AppHeaderUserMenu from './header_menus/app_header_user_menu';

const AppHeader = ({ user, history }) => (
  <header className="main-header">
    <a href="/dashboard" className="logo">
      <span className="logo-mini"></span>
      <span className="logo-lg">
        <b>
          <FormattedMessage
            id="haibotLink"
            defaultMessage="螺钉机器人"
          />
        </b>
      </span>
    </a>

    <nav className="navbar navbar-static-top">
      <a
        href="#" className="sidebar-toggle" data-toggle="push-menu"
        role="button"
      >
        <span className="sr-only">Toggle navigation</span>
      </a>

      <div className="navbar-custom-menu">
        <ul className="nav navbar-nav">
          <AppHeaderBulletinMenu />
          {/*待定后续开发*/}
          {/*<AppHeaderNotificationMenu />*/}
          <AppHeaderUserMenu user={user} history={history} />
        </ul>
      </div>
    </nav>

  </header>
);

AppHeader.propTypes = {
  user: PropTypes.object,
  history: PropTypes.object,
};

export default AppHeader;
