/* eslint-disable import/no-unresolved */
import { Meteor } from 'meteor/meteor';
import React, { Component } from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import CallOutMessage from './warnings/callout_message';
import Footer from './footer';

/* eslint-disable react/prop-types */
export default class SignIn extends Component {
  constructor(props) {
    super(props);

    this.state = {
      emailOrUsername: '',
      password: '',
      hasError: false,
      isLoggingIn: false,
      isActivated: false,
      activateError: false,
      emailOrUsernameExist: true,
    };

    this.initData = {
      hasError: false,
      isLoggingIn: false,
      isActivated: false,
      activateError: false,
      emailOrUsernameExist: true,
      emailOrUsernameEmpty: false,
      pwdEmpty: false,
    };

    this.onSubmit = this.onSubmit.bind(this);
    this.onChangeemailOrUsername = this.onChangeemailOrUsername.bind(this);
    this.onChangePassword = this.onChangePassword.bind(this);
  }

  onChangeemailOrUsername(event) {
    this.setState({emailOrUsername: event.target.value, ...this.initData});
  }

  onChangePassword(event) {
    this.setState({password: event.target.value, ...this.initData});
  }

  onSubmit(event) {
    event.preventDefault();
    if(!this.state.emailOrUsername){
      this.setState({
        emailOrUsernameEmpty: true,
      });
      return;
    }
    if(!this.state.password){
      this.setState({
        pwdEmpty: true,
      });
      return;
    }

    const self = this;
    this.getLdapUserInfo(this.state.emailOrUsername, this.state.password)
      .then(function (result) {
        self.setState({isLoggingIn: true});

        if(result.dn) {
          Meteor.loginWithPassword(self.state.emailOrUsername, self.state.password, (err) => {
            if(!err) {
              self.props.history.push('/dashboard');
              Meteor.call('loginHistorys.sign.in', Meteor.userId(), new Date())
            }
          })
        } else {
          const emailOrUsername = self.state.emailOrUsername;

          Meteor.call('findByemailOrUsername.userinfo', emailOrUsername, function (err, result) {
            if (err) {
              return;
            } else {
              if (result === 'NoUser') {
                self.setState({emailOrUsernameExist: false, isLoggingIn: false});
                return;
              } else {
                self.setState({isActivated: result});
              }
            }

            if (self.state.isActivated) {
              Meteor.loginWithPassword(self.state.emailOrUsername, self.state.password, (error) => {
                if (error) {
                  self.setState({hasError: true, isLoggingIn: false});
                } else {
                  Meteor.call('hasPermission', function (err, result) {
                    if (!err){
                      Session.set('permission', result);
                      localStorage.removeItem(Meteor.userId() + 'permission');
                      localStorage.setItem(Meteor.userId() + 'permission',  result);
                      self.props.history.push('/dashboard');
                      Meteor.call('loginHistorys.sign.in', Meteor.userId(), new Date())
                    }
                  });
                }
              });
            } else {
              self.setState({activateError: true, isLoggingIn: false});
            }
            // self.setState({isLoggingIn: false});
          });
        }
      }).catch(function (err) {
        console.log(err)
      });
  }

  getLdapUserInfo(username, password) {
    return new Promise(function (resolve, reject) {
      Meteor.call('ldap.userInfo',username, password, (err, result) => {
        if(err) {
          console.log('GET_LDAP_USERINFO_ERR:', err);
          reject({})
        }else {
          resolve(result)
        }
      })
    })
  }

  getLoginResponseMessage() {
    let message = '';
    if (this.state.emailOrUsernameEmpty) {
      message = <CallOutMessage description="???????????????" />;
    }else if (this.state.pwdEmpty) {
      message = <CallOutMessage description="???????????????" />;
    } else if (!this.state.emailOrUsernameExist) {
      message = <CallOutMessage description="???????????????????????????" />;
    } else if (this.state.hasError) {
      message = <CallOutMessage description="????????????????????????????????????" />;
    } else if (this.state.activateError) {
      message = <CallOutMessage description="???????????????" />;
    }
    return message;
  }

  displayLoggingIn() {
    let loading = '';
    if (this.state.isLoggingIn) {
      loading = (
        <div className="login-box-msg">
          <i className="fa fa-cog fa-spin fa-2x fa-fw" />
        </div>
      );
    }
    return loading;
  }

  render() {
    return (
      <div>
        {/*?????????*/}
        <div className="main-header home-header">
          <nav className="navbar navbar-default navbar-fixed-top">
            <div className="container">
              <div className="navbar-header">
                <button
                  type="button" className="navbar-toggle collapsed" data-toggle="collapse"
                  data-target="#navbar-collapse"
                >
                  <i className="fa fa-bars" />
                </button>
                <a href="/" className="navbar-brand">
                  <img alt="hand" src="img/aibot_logo.png" />
                </a>
              </div>

              <div id="navbar" className="navbar-collapse collapse">
                <div className="home-sign">
                  <ul className="nav navbar-nav navbar-right">
                    <li><Link to="/sign-in">
                      <FormattedMessage
                        id="signin"
                        defaultMessage="??????"
                      />
                        </Link>
                    </li>
                    <li><Link to="/sign-up">
                      <FormattedMessage
                        id="register"
                        defaultMessage="??????"
                      />
                        </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </nav>
        </div>

        {/*?????????*/}
        <div className="login-box">
          <div className="login-logo">
            <a href="/"><b>aibot Chat</b></a>
          </div>

          <div className="login-box-body">
            <p className="login-box-msg">
              <FormattedMessage
                id="signTitle"
                defaultMessage="???????????????"
              />
            </p>
            {this.displayLoggingIn()}
            {this.getLoginResponseMessage()}

            <form onSubmit={this.onSubmit}>
              <div className="form-group has-feedback">
                <input
                  type="text"
                  className="form-control"
                  placeholder="??????/?????????"
                  onChange={this.onChangeemailOrUsername}
                  value={this.state.emailOrUsername}
                />
                <span className="fa fa-envelope form-control-feedback" />
              </div>

              <div className="form-group has-feedback">
                <input
                  type="password"
                  className="form-control"
                  placeholder="??????"
                  onChange={this.onChangePassword}
                  value={this.state.password}
                />
                <span className="fa fa-lock form-control-feedback" />
              </div>

              <div className="row">
                <div className="pull-right col-xs-4">
                  <button type="submit" className="btn btn-primary btn-block btn-flat">
                    <FormattedMessage
                      id="signin"
                      defaultMessage="??????"
                    />
                  </button>
                </div>
              </div>
            </form>

            <Link to="/forget-password">
              <FormattedMessage
                id="forgetPwd"
                defaultMessage="????????????"
              />
            </Link><br />
            <Link to="/sign-up">
              <FormattedMessage
                id="register"
                defaultMessage="??????"
              />
            </Link>
          </div>
        </div>

        {/*footer*/}
        <Footer />
      </div>
    );
  }
}
