/* global window */
import axios from 'axios';
import qs from 'qs';
import lodash from 'lodash';
import {
  message,
  notification
} from 'antd';
import Cookies from 'js-cookie';

import intl from 'react-intl-universal';

let logoutLock = false;

/**
 * [buildParam description]
 * @param  {[type]} url    [description]
 * @param  {[type]} params [description]
 * @return {[type]}        [description]
 */
function buildParam(url, params, options) {
  if (options && !params) {
    let opt = '';
    for (const key in options) {
      const item = options[key];
      // console.log('options', item);
      opt += `?${key}=${item}`;
    }
    return `${url}${opt}`;
  }

  if (!params) {
    return url;
  }
  let Url = url.replace(
    /\/:(\w+)/gm,
    index =>
    // eslint-disable-next-line
    `/${index == '/:id' ? '' : index.replace(/\/:/g, '') + '/'}${
        params[`${index.replace(/\/:/g, '')}`]
      }`
  );
  // return Url;
  if (!options) {
    return Url;
  } else {
    let opt = '';
    for (const key in options) {
      const item = options[key];
      console.log('options', item);
      opt += `?${key}=${item}`;
    }

    return `${Url}${opt}`;
  }
}

/**
 * [fetch description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
const _fetch = options => {
  let {
    method = 'get', data = {}, url, timeout = 60000
  } = options;
  try {
    url = buildParam(url, data.urlParams, data.options);
  } catch (e) {
    throw new Error('请求链接参数错误.');
  }

  delete data.urlParams;
  const cloneData = lodash.cloneDeep(data);

  //配置axios请求默认值
  // let token = '';
  // if (Cookies.get('token')) {
  //   token = Cookies.get('token');
  // }
  //默认Url地址
  // axios.defaults.baseURL = window.$IF.env.apiBaseURL;
  // 手动跨域
  // axios.defaults.headers.common['Authorization'] = 'Bearer ' + token;

  //修改统一默认配置
  const home = window.config.environments.apiBaseURL;
  axios.defaults.baseURL = `${window.location.protocol}//${home}`;
  // const home = window.config.environments.apiBaseURL;
  // let defaultAxios = axios.create({
  //   baseURL: `${window.location.protocol}//${home}`
  // });



  axios.defaults.timeout = 60000;

  switch (method.toLowerCase()) {
    case 'get':
      return axios.get(url, {
        params: cloneData
      });
    case 'delete':
      return axios.delete(url, {
        data: cloneData
      });
    case 'post':
      return axios.post(url, cloneData, {
        timeout: timeout
      });
    case 'put':
      return axios.put(url, cloneData);
    case 'patch':
      return axios.patch(url, cloneData);
    case 'form':
      return axios.post(url, qs.stringify(cloneData), {
        headers: {
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Authorization: 'Basic ' + btoa('clientweb:123456'),
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        }
      });
    case 'upload':
      if (options.progress) {
        return axios.post(url, data, {
          onUploadProgress: options.progressCallback
        });
      } else {
        return axios.post(url, data, {
          headers: {
            Accept: 'application/json, text/javascript, */*; q=0.01',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
          }
        });
      }
      default:
        return axios(options);
  }
};

/**
 * [request description]
 * @param  {[type]} options [description]
 * @return {[type]}         [description]
 */
export default function request(options) {
  return _fetch(options)
    .then(response => {
      const {
        data
      } = response;
      // eslint-disable-next-line
      return Promise.resolve({
        ...data
      });
    })
  // .catch(error => {
  //   const {
  //     response
  //   } = error;
  //   let msg;
  //   let statusCode;

  //   const currentUrl = window.location.pathname;
  //   const urlPathName = currentUrl.slice(currentUrl.lastIndexOf('/'));

  //   console.error(error);

  //   if (
  //     urlPathName !== '/login' &&
  //     error.toString().indexOf('timeout') > -1
  //   ) {
  //     // message.error(intl.get('SEARCH_REQUEST_TIMEOUT'));
  //     // setTimeout(errorCallBack, 5000);
  //     let key = 'SEARCH_REQUEST_TIMEOUT';
  //     notification.error({
  //       key,
  //       message: intl.get('ERROR_TIP'),
  //       description: intl.get('SEARCH_REQUEST_TIMEOUT')
  //     });
  //     // eslint-disable-next-line
  //     return Promise.resolve({
  //       error: true,
  //       statusCode: statusCode,
  //       statusMessage: msg
  //     });
  //   }

  //   if (response && response instanceof Object) {
  //     const {
  //       data,
  //       status,
  //       statusText
  //     } = response;
  //     statusCode = status;
  //     msg = data.message || statusText;

  //     if (urlPathName !== '/login') {
  //       message.destroy();
  //       //对异常情况产生的退出加锁，避免message单例在回调执行期内，比如message目前设置5s后才执行回调函数，小于5s间隔内的频繁请求导致回掉一直被替换无法执行
  //       if (logoutLock) {
  //         // eslint-disable-next-line
  //         return Promise.resolve({
  //           error: true,
  //           statusCode: -1,
  //           statusMessage: 'error(0)'
  //         });
  //       }

  //       logoutLock = true;
  //       if (
  //         // eslint-disable-next-line
  //         status == 403 &&
  //         // eslint-disable-next-line
  //         statusText == 'Forbidden' &&
  //         error.message &&
  //         // eslint-disable-next-line
  //         error.message.indexOf('no privilege') != -1
  //       ) {
  //         message.error(intl.get('NO_AUTHORIRY_FOR_SERVICE'), 1, () => {});
  //         setTimeout(errorCallBack, 3000);
  //       } else if (
  //         // eslint-disable-next-line
  //         status == 405 &&
  //         // eslint-disable-next-line
  //         statusText == 'Forbidden' &&
  //         error.message &&
  //         // eslint-disable-next-line
  //         error.message.indexOf('no privilege') != -1
  //       ) {
  //         message.error(intl.get('FORBIDDEN_IP'), 1, () => {});
  //         setTimeout(errorCallBack, 3000);
  //       } else if (
  //         status == 401 &&
  //         data.error &&
  //         data.error.indexOf('invalid_token') != -1
  //       ) {
  //         message.error(intl.get('MESSAGE_ACCOUNT_CONFLICT'), 1, () => {});
  //         setTimeout(errorCallBack, 3000);
  //       } else {
  //         message.error(
  //           intl.get('SERVICE_UNUSUAl_FOR_REASE', {
  //             reason: response.status
  //           }),
  //           1,
  //           () => {}
  //         );
  //         setTimeout(errorCallBack, 3000);
  //         //复现未加锁不能退出的情况
  //         // setInterval(function(){
  //         //   request({
  //         //     url: api.getUserRightSever,
  //         //     method: 'Get',
  //         //     data: {
  //         //       urlParams: {
  //         //         id: 'sujiangang'
  //         //       }
  //         //     }
  //         //   })
  //         // },1000)
  //       }
  //       removeCache();
  //     }
  //   } else if (urlPathName !== '/login') {
  //     if (logoutLock) return;
  //     logoutLock = true;
  //     message.destroy();
  //     message.error(intl.get('SERVICE_UNUSUAl'), 1, () => {});
  //     setTimeout(errorCallBack, 3000);
  //     //接口出错清除前端存储信息
  //     removeCache();
  //   }
  //   recordError({
  //     options,
  //     error: response,
  //     currentUrl
  //   });
  //   // eslint-disable-next-line
  //   return Promise.resolve({
  //     error: true,
  //     statusCode: statusCode,
  //     statusMessage: msg
  //   });
  // });
}

/**
 * [removeCache description]
 * @return {[type]} [description]
 */
function removeCache() {
  //退出登录清除localStorage中的用户信息
  window.localStorage.removeItem('userInfo');
  window.localStorage.removeItem('oauth');
  //退出登录清除cookie中的用户信息
  Cookies.remove('token');
  //退出登录清除已填写的检索事由
  window.localStorage.removeItem('searchReasonParam');
}

/**
 * [errorCallBack description]
 * @return {[type]} [description]
 */
function errorCallBack() {
  window.location = '/login';
}

/**
 * [recordError description]
 * @param  {[type]} error [description]
 * @return {[type]}       [description]
 */
function recordError(error) {
  localStorage.setItem(String(new Date().getTime()), JSON.stringify(error));
}