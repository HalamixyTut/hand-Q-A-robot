/* eslint-disable import/no-unresolved,jsx-a11y/label-has-for*/
import React, {Component} from 'react';
import {FormattedMessage, intlShape} from 'react-intl';
import Validator from '../utils/validator';
import {handleSbumit as Submit} from '../utils/common';

export default class LdapSetting extends Component {
  static contextTypes = {
    intl: intlShape,
  };

  constructor() {
    super();

    this.validator = new Validator();
    this.state = {
      ldap: {},
      radioValue: 0,
    }
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.ldap._id) {
      this.setState({ldap: nextProps.ldap, radioValue: nextProps.ldap.isOpen})
    }
  }

  // eslint-disable-next-line react/sort-comp
  handleChange (attr, e) {
    let ldap = this.state.ldap;

    switch (attr) {
      case 'isOpen':
        ldap.isOpen = (e.target.value == 1 ? true : false); this.setState({radioValue: e.target.value}); break;
      case 'url':
        ldap.url = e.target.value;break;
      case 'timeout':
        ldap.timeout = e.target.value;break;
      case 'baseDN':
        ldap.baseDN = e.target.value;break;
      case 'whiteList':
        ldap.whiteList = this.getList(e.target.value);break;
      default:
        break;
    }

    this.setState(ldap)
  }

  handleClick = (e) => {
    if(this.state.radioValue) {
      Submit(this, 'ldaps.insertOrUpdate', this.state.ldap);
    } else {
      Submit(this, 'ldaps.updateIsOpen', this.state.ldap);
    }
  };

  getList = (str) => {
    if(str === '') {
      return []
    }
    let s = str.replace(new RegExp(',+','gm'),',');
    if(s[s.length -1] === ',') {
      s = s.substring(0, s.length -1)
    }
    s = s.split(',');
    return s;
  };

  render() {
    let ldap = this.state.ldap;
    const formatMessage = this.context.intl.formatMessage;
    return (
      <div className="statistic-content">
        <section className="content">
          <div className="row">
            <div className="col-md-6">
              <div className="box">
                <div className="box-header">
                  <h3 className="box-title">
                    <FormattedMessage
                      id="sysManage"
                      defaultMessage="????????????"
                    />
                    /
                    <FormattedMessage
                      id="LdapSetup"
                      defaultMessage="ldap??????"
                    />
                  </h3>
                </div>
                <form role="form">
                  <div className="box-body">
                    <div className="form-group">
                      <label>
                        <FormattedMessage
                          id="LdapServer"
                          defaultMessage="????????????LDAP??????"
                        />
                      </label>
                      <div className="radio">
                        <label>
                          <input
                            type="radio"
                            name="ldapRadio"
                            value="1"
                            className="minimal"
                            checked={this.state.radioValue == 1 ? true : false}
                            onChange={this.handleChange.bind(this, 'isOpen')}
                          />
                          <FormattedMessage
                            id="start"
                            defaultMessage="??????"
                          />
                        </label>
                      </div>
                      <div className="radio">
                        <label>
                          <input
                            type="radio"
                            name="ldapRadio"
                            value="0"
                            className="minimal"
                            checked={this.state.radioValue == 0 ? true : false}
                            onChange={this.handleChange.bind(this, 'isOpen')}
                          />
                          <FormattedMessage
                            id="dontstart"
                            defaultMessage="?????????"
                          />
                        </label>
                      </div>
                    </div>
                    {this.state.radioValue == 1 ?
                      <div>
                        <div className="form-group">
                          <label htmlFor="ldapUrl">LDAP URL</label>
                          <input
                            type="text" value={ldap.url ? ldap.url : ''} onChange={this.handleChange.bind(this, 'url')}
                            className="form-control" id="ldapUrl" placeholder="ldap://xxx.xxx.xxx.xxx:xx"
                          />
                          {this.validator.message('url', ldap.url, 'required',{
                            required: 'LDAP URL'+formatMessage({id: 'isRequired'}),
                          })}
                        </div>
                        <div className="form-group">
                          <label htmlFor="ldapTimeout">
                            <FormattedMessage
                              id="ldaptimeout"
                              defaultMessage="LDAP ??????????????????(?????????ms)"
                            />
                          </label>
                          <input
                            type="text" value={ldap.timeout ? ldap.timeout : ''} onChange={this.handleChange.bind(this, 'timeout')}
                            className="form-control" id="ldapTimeout"
                          />
                          {this.validator.message('timeout', ldap.timeout, 'required|number',{
                            required: 'timeout'+formatMessage({id: 'isRequired'}),
                            number: formatMessage({id: 'isNumber'}),
                          })}
                        </div>
                        <div className="form-group">
                          <label htmlFor="ldapBaseDN">LDAP baseDn</label>
                          <input
                            type="text" value={ldap.baseDN ? ldap.baseDN : ''} onChange={this.handleChange.bind(this, 'baseDN')}
                            className="form-control" id="ldapBaseDN" placeholder="dc=xxx,dc=xxx,dc=com"
                          />
                          {this.validator.message('baseDN', ldap.baseDN, 'required',{
                            required: 'baseDN'+formatMessage({id: 'isRequired'}),
                          })}
                        </div>
                        <div className="form-group">
                          <label htmlFor="ldapWhiteList">
                            <FormattedMessage
                              id="whitelist"
                              defaultMessage="LDAP ?????????"
                            />
                          </label>
                          <p>
                            <FormattedMessage
                              id="whitelistinstructions"
                              defaultMessage="?????????????????????????????????LDAP????????????????????????????????????????????????????????????????????????????????????????????????????????????,?????????"
                            />
                          </p>
                          <input
                            type="text" value={ldap.whiteList ? ldap.whiteList.toString() : ''} onChange={this.handleChange.bind(this, 'whiteList')}
                            className="form-control" id="ldapWhiteList" placeholder="admin"
                          />
                        </div>
                      </div>
                      : null
                    }
                  </div>

                  <div className="box-footer">
                    <button type="button" className="btn btn-primary pull-right" onClick={this.handleClick}>
                      <FormattedMessage
                        id="save"
                        defaultMessage="??????"
                      />
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>
    )
  }
}
