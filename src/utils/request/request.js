import axios from "axios"; // CancelTokenSource // AxiosInstance, // AxiosRequestConfig, // AxiosResponse,
// import config from "config";
import Cookies from "js-cookie";

class RequestClass {
  constructor(axiosInstance) {
    this._axios = axiosInstance;

    this.isCancel = axios.isCancel;
  }

  /**
   * 创建一个axios实例
   * @returns {RequestClass} axios实例
   */
  static createInstance() {
    let newAxios = axios.create({});
    return new RequestClass(newAxios);
  }

  /**
   * 通用请求接口
   * @param {IFRequestConfig} config 配置项
   * @returns {Promise<IFResponse<any>>} response
   * @memberof RequestClass
   */
  request(config) {
    return this._axios(config);
  }

  /**
   * 发送get请求
   * @param  {string} url    url地址
   * @param {?Object} query 查询
   * @param  {Partial<IFRequestConfig>} [options={}] axios额外选项
   * @return {Promise<IFResponse<any>>}        promise对象
   */
  get(url, query = null, options = {}) {
    let realUrl = url;
    // 添加querystring
    if (query) {
      let keys = Object.keys(query);
      let queryItems = [];
      for (let key of keys) {
        let value = query[key];
        // 过滤value的类型

        let itemstring = `${encodeURIComponent(key)}=${encodeURIComponent(
          value
        )}`;
        queryItems.push(itemstring);
      }
      if (queryItems.length > 0) {
        let querystring = queryItems.join("&");
        realUrl = `${realUrl}?${querystring}`;
      }
    }

    let promise = this._axios.get(realUrl, {
      ...options,
    });

    return promise;
  }

  /**
   * 发送post请求
   * @param  {string} url        url地址
   * @param  {any} [data={}]    数据
   * @param  {Partial<IFRequestConfig>} [options={}] 额外选项
   * @return {Promise<IFResponse<any>>}              [description]
   */
  post(url, data = {}, options = {}) {
    let realUrl = url;

    let promise = this._axios.post(realUrl, data, {
      ...options,
    });

    return promise;
  }

  /**
   * 发送delete请求
   * @param  {string} url     [description]
   * @param  {IFRequestConfig} [options={}] [description]
   * @return {Promise<IFResponse<any>>}         [description]
   */
  delete(url, options = {}) {
    let realUrl = url;

    let promise = this._axios.delete(realUrl, {
      ...options,
    });

    return promise;
  }

  /**
   * 发送put请求
   * @param  {string} url        [description]
   * @param  {any} data       [description]
   * @param  {IFRequestConfig} options    [description]
   * @return {Promise<IFResponse<any>>}            [description]
   */
  put(url, data = {}, options = {}) {
    let realUrl = url;

    let promise = this._axios.put(realUrl, data, {
      ...options,
    });

    return promise;
  }

  /**
   * 给request添加拦截器
   * @NOTE: 所添加的拦截器按照添加的顺序反向进行调用，底层也是会将这些返回值封装Promise，从而形成链式调用的形式
   * @param {Function} fullfil (Object) => Object, 接收一个配置，返回另一个配置
   * @param {Function} reject  [description]
   * @return {number}  handle， 用来用取消
   */
  addRequestInterceptor(fullfil, reject) {
    return this._axios.interceptors.request.use(fullfil, reject);
  }

  /**
   * 移除handle对应的request拦截器
   * @param  {number} handle 可通过addRequestInterceptor返回值获得
   * @return {void}        [description]
   */
  removeRequestInterceptor(handle) {
    this._axios.interceptors.request.eject(handle);
  }

  /**
   * 添加responese拦截器
   * @NOTE: 所添加的拦截器按照添加的顺序进行调用，底层也是会将这些返回值封装Promise，从而形成链式调用的形式
   * @param {[type]} fullfil [description]
   * @param {Promise<Error>} reject  [description]
   * @return {number} handle， 用来用取消
   */
  addResponeseInterceptor(fullfil, reject) {
    return this._axios.interceptors.response.use(fullfil, reject);
  }

  /**
   * 移除handle对应的responese拦截器
   * @param  {number} handle 可通过addResponeseInterceptor返回值获得
   * @return {void}         [description]
   */
  removeResponeseInterceptor(handle) {
    this._axios.interceptors.response.eject(handle);
  }

  /**
   * 获得可取消的handle
   * @returns {IFCancelTokenSource} IFCancelTokenSource
   * @memberof RequestClass
   */
  getCancelSource() {
    const CancelToken = axios.CancelToken;
    return CancelToken.source();
  }
}

//修改统一默认配置
const home = window.config.environments.apiBaseURL;
let defaultAxios = axios.create({
  baseURL: `${window.location.protocol}//${home}`
});

if (Cookies.get("token")) {
  const token = Cookies.get("token");
  // defaultAxios.defaults.headers.common["token"] = token;
  defaultAxios.defaults.headers.common['Authorization'] = 'Bearer ' + 'Y2xpZW50YXBwOjEyMzQ1Ng==';
}

//http request 登录拦截
defaultAxios.interceptors.request.use(
  config => {
    if (config.url.search(/login/) === -1) {
      const userInfo = Cookies.get("userInfo");
      if (!userInfo) {
        window.location.reload();
        // this.props.history.replace("/login");
      }
    }

    return config;
  },
  error => {
    return Promise.reject(error);
  }
);

const IFRequest = new RequestClass(defaultAxios);

export {
  IFRequest,
  RequestClass
};