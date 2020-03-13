import { guid } from "../guid";
import moment from "moment";
const COMON_URL_PARAM = `?appKey=${guid()}&sign=${guid()}&timestamp=${moment().format(
  "X"
)}`;
const API1 = "/api/intellif";

export default {
  // login: "/admin/user/login",
  login: `/api/intellif/temperature/alarm/1`,
  logOut: "/admin/user/logout",
  getAllFactory: "/capability/api/factory/", //获取所有的厂家信息
  getLog: "/admin/log/query", //查询日志
  getBank: `/capability/api/bank/tree/${COMON_URL_PARAM}`, //获取人员库树结构
  uploadFile: `/capability/api/image/upload/file/${COMON_URL_PARAM}`, //上传
  vendorSearchFace: `/capability/api/face/search/uncombined/${COMON_URL_PARAM}`,
  vendorImgSearchFace: `/capability/api/face/search/picture/uncombined/${COMON_URL_PARAM}`,

  fucionSearchFace: `/capability/api/face/search/${COMON_URL_PARAM}`,
  fucionImgSearchFace: `/capability/api/face/search/picture/${COMON_URL_PARAM}`,

  updataPassword: `/admin/user/password/update/{id}`, //修改密码
  addaccount: `/admin/user/add`, //新增账号

  getCameraList: `${API1}/camera/allList`, //获取摄像头列表
  setTemperture: `${API1}/deviceConfig`, //温度配置
  getHistory: `${API1}/temperature/alarm/list`, //
  alarmInfo: `${API1}/temperature/alarm/:id`,
  getCaptureFace: `${API1}/temperature/alarm/face/:id`,
  // getCaptureFace: `${API1}/image/face/json/:id`,
  gettotal: `${API1}/camera/statistic/source`,
  getAlarmTotal: `${API1}/temperature/alarm/statistic/:id`,
  getAllCapture: `${API1}/temperature/face/list`,
  getCaptureInfo: `${API1}/image/face/json/:id`,
  getExport: `${API1}/temperature/alarm/export/:id`,
  getExportProgress: `${API1}/temperature/alarm/progress/:group/:id`,
  getTimeLineData: `${API1}/alarm/person`
};
