import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import {CSVLink} from 'react-csv';
import { FormattedMessage } from 'react-intl';
import {Category} from '../../../../../api/category/categorys';
import {DialogUpdate} from '../../utils/modal_dialog'

global.Buffer = global.Buffer || require("buffer").Buffer;

class UploadKnowledge extends React.Component {
  constructor() {
    super();

    this.uploadFile = React.createRef();
    this.state = {
      messageId: 'updateMessageContent',
    }
  }

  handleChange(e) {
    const file = e.target.files[0];
    if(file) {
      const fileTypes = '.csv';
      const nameEnd = file.name.substr(file.name.lastIndexOf('.'));
      if(fileTypes !== nameEnd) {
        this.setState({messageId: 'UnSupportFileType'}, () => $('#modal-default').modal('show'));
      }
    }else {
      this.setState({messageId: 'fileEmpty'}, () => $('#modal-default').modal('show'));
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    const file = this.uploadFile.current.files[0];
    let  inputFile = this.uploadFile.current;
    const mergeSimilar = (arr) => {
      let resData = [];
      let eachData = {
        standard: '',
        similar: [],
        categoryPath: '',
        solution: '',
      };
      for(let i = 0; i < arr.length;) {
        if(resData.length === 0) {
          resData.push(arr[i]);
          arr.splice(arr.indexOf(arr[i]),1);
          continue;
        }
        if(arr[i].standard === resData[0].standard) {
          resData.push(arr[i]);
          arr.splice(arr.indexOf(arr[i]),1);
          continue;
        }
        i++;
      }

      for(let eachItem of resData) {
        if(eachItem.categoryPath !== '') {
          eachData.standard = eachItem.standard;
          eachData.categoryPath = eachItem.categoryPath;
        }
        if(eachItem.solution !== '') {
          eachData.solution = eachItem.solution;
        }
        eachData.similar.push(eachItem.similar);
      }

      return eachData;
    };
    const getParentCategory = (categoryId, categoryArr) => {
      let category;
      for(let eachItem of categoryArr) {
        if(categoryId === eachItem._id) {
          category = eachItem;
        }
      }
      return category;
    };
    const getCategoryInfo = (path, parentCategory) => {
      let categoryInfo = {
        parentId: '',
        isExist: false,
      };

      let categotyId = '';
      for(let eachItem of parentCategory.subClass) {
        if(eachItem.name === path) {
          categotyId = eachItem.id;
          break;
        }
      }
      if(categotyId === '') {
        categoryInfo.parentId = parentCategory._id;
      }else {
        categoryInfo.isExist = true;
        categoryInfo.parentId = categotyId;
      }
      return categoryInfo;
    };

    if(file) {
      const fileTypes = '.csv';
      const nameEnd = file.name.substr(file.name.lastIndexOf('.'));
      if(fileTypes !== nameEnd) {
        this.setState({messageId: 'UnSupportFileType'}, () => $('#modal-default').modal('show'));
      }else {
        const reader = new FileReader();
        const self = this;

        reader.onload = function(e) {
          let contents = reader.result;
          let subStr = contents.match(/(\S*)\r\n/);
          if(!subStr && typeof(subStr)!='undefined' && subStr!=0){
            subStr = contents.match(/(\S*)\n/);
          }
          if(!subStr && typeof(subStr)!='undefined' && subStr!=0) {
            self.setState({messageId: 'fileError'}, () => $('#modal-default').modal('show'));
            return;
          }
          subStr = subStr[1];
          subStr = subStr.replace(/"/g,'');
          subStr = subStr.split(',');
          if(subStr.indexOf('????????????') === -1 || subStr.indexOf('????????????') === -1 ||
            subStr.indexOf('??????') === -1 || subStr.indexOf('????????????') === -1) {

            self.setState({messageId: 'fileFormatError'}, () => $('#modal-default').modal('show'));
            return;
          }
          contents = contents.replace('????????????','standard');
          contents = contents.replace('????????????','similar');
          contents = contents.replace('??????','categoryPath');
          contents = contents.replace('????????????','solution');
          const parse = require('csv-parse/lib/sync');
          contents = parse(contents,{ columns: true, auto_parse: true });
          let mergeData = [];
          //??????????????????
          while (contents.length !== 0) {
            let returnData = mergeSimilar(contents);
            if(returnData.standard !== '' && returnData.categoryPath !== '' && returnData.solution !== '') {
              mergeData.push(returnData)
            }
          }

          //???????????????????????????id????????????????????????????????????????????????????????????????????????????????????
          for(let eachItem of mergeData) {
            let path = eachItem.categoryPath.split('/');
            const rootCategory = Category.find({name: '????????????'}).fetch();
            const categorys = Category.find({}).fetch();
            let parentCategory = rootCategory[0];
            let categoryInfo, k;

            if(path.length > 4) {
              self.setState({messageId: 'levelTooMany'}, () => $('#modal-default').modal('show'));
              return;
            }
            for(let i = 1; i < path.length; i++) {
              categoryInfo = getCategoryInfo(path[i], parentCategory);
              if(categoryInfo.isExist) {
                parentCategory = getParentCategory(categoryInfo.parentId, categorys);
              }else {
                k = i;
                break;
              }
            }

            if(categoryInfo && categoryInfo.isExist) {
              eachItem.category = categoryInfo.parentId;
            }else {
              let tmpCategoryInfo = categoryInfo;
              for(let i = k; i < path.length; i++ ){
                const newCategoryId = new Mongo.ObjectID()._str;
                const categoryInfo = {
                  id: newCategoryId,
                  name: path[i],
                  subClass: [],
                };

                Meteor.call('categorys.insert',categoryInfo);
                Meteor.call('categorys.addupdate',tmpCategoryInfo.parentId, categoryInfo);
                if(i === path.length - 1) {
                  eachItem.category = newCategoryId;
                }else {
                  tmpCategoryInfo.parentId = newCategoryId;
                }
              }
            }
          }

          Meteor.call('knowledges.batchImport', mergeData);
          inputFile.value = '';

          self.setState({messageId: 'fileUploadSuccess'}, () => $('#modal-default').modal('show'));
        };

        reader.readAsText(file,'UTF-8');
      }
    }else {
      this.setState({messageId: 'fileUploadFile'}, () => $('#modal-default').modal('show'));
    }
  }

  render() {
    const headers = [
      {label: '????????????', key: 'standard'},
      {label: '????????????', key: 'similar'},
      {label: '??????', key: 'categoryPath'},
      {label: '????????????', key: 'solution'},
    ];

    const data = [
      {standard: '?????????????????????', similar: '???????????????????????????', categoryPath: '/????????????/????????????', solution: '?????????????????????????????????'},
      {standard: '?????????????????????', similar: '???????????????????????????????????????', categoryPath: '', solution: ''},
      {standard: '????????????????????????', similar: '???????????????????????????', categoryPath: '/????????????/????????????/????????????', solution: '?????????12306?????????'},
      {standard: '????????????????????????', similar: '?????????????????????????????????', categoryPath: '', solution: ''},
      {standard: '????????????????????????', similar: '?????????????????????????????????', categoryPath: '', solution: ''},
    ];

    return(
      <div className="col-xs-12 knowledge">
        <div className="box box-info">
          <div className="box-header with-border">
            <h3 className="box-title">
              <i className="fa fa-pencil" />
              <FormattedMessage
                id="uploadKnowledge"
                defaultMessage="???????????????"
              />
            </h3>
          </div>
          <form className="form-horizontal">
            <div className="box-body">
              <div className="form-group">
                <label htmlFor="inputEmail3" className="col-sm-2 control-label">
                  <FormattedMessage
                    id="selectFile"
                    defaultMessage="????????????"
                  />
                </label>
                <div className="col-sm-10">
                  <input
                    type="file" ref={this.uploadFile} id="exampleInputFile"
                    onChange={this.handleChange.bind(this)}
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="inputPassword3" className="col-sm-2 control-label">
                  <FormattedMessage
                    id="UploadRules"
                    defaultMessage="????????????"
                  />
                </label>
                <div className="col-sm-10">
                  <p>1. ?????????????????????.csv {/*<button type="button" className="btn btn-info">??????CSV??????</button>*/}
                    <CSVLink
                      data={data}
                      headers={headers}
                      filename="????????????.csv"
                      className="btn btn-info"
                      target="_blank"
                    >
                      ??????CSV??????
                    </CSVLink>
                  </p>
                  <p>2. CSV?????????????????????UTF-8</p>
                  <p>3. ???1????????????????????????2????????????????????????3????????????(???????????????????????????????????????/????????????/????????????/????????????)??????4?????????????????????</p>
                </div>
              </div>
            </div>
            <div className="box-footer col-button">
              <button type="submit" className="btn btn-info pull-right" onClick={this.handleSubmit.bind(this)}>
                <FormattedMessage
                  id="saveknowledge"
                  defaultMessage="???????????????"
                />
              </button>
              <button type="submit" className="btn btn-default pull-right">
                <FormattedMessage
                  id="return"
                  defaultMessage="??????"
                />
              </button>
            </div>
          </form>
        </div>

        <DialogUpdate messageId={this.state.messageId} />
      </div>
    );
  }
}

export default withTracker(() => {
  Meteor.subscribe('categorys');

  return {
    categorys: Category.find({}).fetch(),
  };
})(UploadKnowledge);
