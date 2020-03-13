/* eslint-disable no-undef */
import React, { Component } from "react";
import { Switch, Layout, Modal, Input, Select, message } from "antd";
import * as intl from "react-intl-universal";
// import moment from "moment";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import TempMqttClient from "../../utils/mqtt/tempertureMqtt";
import AlarmItem from "./views/AlarmItem";
import RealtimeCapture from "./views/RealtimeCapture";
import api from "../../utils/api";
import request from "../../utils/request.js";
import AlarmAudio from "./views/AlarmAudio";
// import Confidence from "./views/Confidence";
import PreviewDetail from "./views/PreviewDetail";

import ExportModal from "./views/ExportModal";
import ShowMorePanel from "./views/ShowMorePanel";
// import faceUrl from "./assets/images/face.png";
import AlarmDetail from "./views/AlarmDetail";
// import zoomUrl from "./assets/images/zoom.svg";
// import playUrl from "./assets/images/play.svg";
import controlImg from "./assets/images/control-fill.svg";
import exportImg from "./assets/images/export.svg";
import doubleRight from "./assets/images/double right.svg";
import "./assets/styles/index.scss";
import moment from "moment";

// const { RangePicker } = DatePicker;
const { Header, Sider, Content } = Layout;
const { Option } = Select;
const ALARM_COUNT = 15; //最多现实告警数量
const ERROR_TIP = intl.get("dd").d("系统异常，请稍后再试");
window.document.cameraInfo = [];

const moclAlarm = [
  {
    AlarmId: "29074",
    bankName: "云天励飞011111111111",
    personName: "",
    // personName: "张三11111111111111", //通过人名是否为空判断比中状态
    confidence: 0.9745,
    CameraId: NaN,
    FaceId: false,
    address: "生态科技园10栋B座15楼3",
    alarmTime: "2020-02-20 17:13:17",
    bigImageId: null,
    bigImageUrl: null,
    degree: 37.8,
    faceId: 281544984794183,
    id: 65075,
    photoData:
      "http://192.168.22.236/ifsrc/engine1/eng1store1_0/FaceWareHouse/src_0_1000/20200213/20200213T235958_523_523_0_1000.jpg",
    imageUrl:
      "http://192.168.11.236//ifsrc/engine1/eng1store1_0/FaceWareHouse/src_0_1000/20200213/20200213T235958_523_523_0_1000.jpg",
    sourceId: 1002,
    tempAlarmFlag: 1,
    wearMask: 2
  }
];

// const AUTO_VIEW = window.config.autoView;
const TIME = window.config.viewTime || 3000;

let MAX_CAMERA = 4;
let IS_NOTBOOK = false;
const scree_width = window.screen.width;
if (scree_width <= 1366) {
  MAX_CAMERA = 1;
  IS_NOTBOOK = true;
}

const alarmIndoMock = {
  address: "生态科技园10栋B座15楼1",
  alarmTime: "2020-02-21 23:59:59",
  bankName: "测试库",
  bigImageId: "281554303472140",
  bigImageUrl:
    "http://192.168.11.236/ifsrc/engine1/eng1store1_0/ImgWareHouse/src_0_1000/20200213/20200213T235959_524_1000.jpg",
  confidence: 0.941707,
  degree: 30,
  faceId: "281554303472140",
  id: "7393",
  imageUrl:
    "http://192.168.11.236/ifsrc/engine1/eng1store1_0/FaceWareHouse/src_0_1000/20200213/20200213T235959_524_524_0_1000.jpg",
  personName: "疑似病例",
  // personName: "",
  photoData:
    "http://192.168.11.236/ifaas/api/uploads/202002/2020-02-11-19-10-35-147_format_f.jpg",
  sourceId: "1000",
  tempAlarmFlag: 1,
  wearMask: 1,
  haveMask: false,
  tempAlarm: true
};

let AUTO_VIEW = true;
export class TemperatureMonitor extends Component {
  constructor(props) {
    super(props);

    this.highTemp = 0;
    this.lowerTemp = 0;
    this.camera = null;
    this.client = null;
    this.currentTime = dayjs().valueOf();

    this.currentCameras = [];

    // this.cameraIds = Cookies.get("cameras")
    //   ? Cookies.get("cameras").split(",")
    //   : [];
    this.dotTimer = null;
    this.autoTimer = null;
    this.totalAlarmPersonTimer = null;

    this.autoView = AUTO_VIEW; //存放上一次的弹窗开关

    this.state = {
      currentCameraData: null,
      // currentCameraName: "深圳湾生态科技园10栋15楼", //但钱摄像头名
      showConfig: false, //是否显示配置页面
      alarmList: [], //告警列表
      captureList: [], //拽拍列表
      cameraList: [],
      alarmVisible: false, //是否查看告警
      alarmItemInfo: alarmIndoMock, // {}, //查看告警信息
      palyVideoVisible: false, //是否播放视频
      viewPicVisible: false, //是否查看大图

      totalPerson: "--",
      totalAlarmPerson: "--",

      highTemp: 0,
      lowerTemp: 0,
      currentCameras: [], //当前显示的摄像头

      // autoViewShow: true, //显示自动弹窗
      alarmType: "temp", //temp  疑似发热  noMask 未戴口罩
      playAudio: false, //播放告警铃声

      autoView: AUTO_VIEW, //开启自动弹窗
      autoShowView: false, //展示自动弹窗详情
      autoAlarmItemInfo: {},

      showExportModal: false,
      // exportTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      // exportPercent: 0,
      // isExport: false
      showMoreAll: false,
      showMoreType: "", // alarm  capture

      viewCaptureVisible: false,
      captureItemInfo: {}
    };
  }

  componentDidMount = () => {
    this._getCameraList();
    // this._getHistoryAlarmList();
    // this.getTotal();
    this._getInitTemp();
    this._onListenTempMqtt();

    this.totalAlarmPersonTimer = setInterval(() => {
      if (
        moment().valueOf() -
          moment()
            .startOf("day")
            .valueOf() <
        1000
      ) {
        this.setState({ totalAlarmPerson: 0 });
      }
    }, 1000);

    // setTimeout(() => {
    //   this.handleAutoView({});
    // }, 10000);
  };

  componentWillUnmount() {
    TempMqttClient.unsubscribe(this.client); //取消订阅
    clearInterval(this.totalAlarmPersonTimer);
  }

  /**
   * 获取初始告警温度
   */
  _getInitTemp = () => {
    request({
      url: api.setTemperture,
      method: "get"
    })
      .then(res => {
        console.log("init_res", res);
        const { errCode, data } = res;
        if (errCode === 0) {
          this.highTemp = data.highLimit || 0;
          this.lowerTemp = data.lowLimit || 0;
          this.setState({
            highTemp: data.highLimit || 0,
            lowerTemp: data.lowLimit || 0
          });
        }
      })
      .catch(err => {
        message.error(ERROR_TIP);
        console.error(err);
      });
  };

  /**
   * 获取摄像头列表
   */
  _getCameraList = () => {
    request({
      url: api.getCameraList,
      method: "get"
    })
      .then(res => {
        // console.log("res", res);

        if (res.errCode === 0 && res.data.length > 0) {
          // window.document.cameraInfo = [...[res.data[0]]];
          const data = res.data;
          let cameraIds = Cookies.get("cameraIds");
          if (cameraIds) {
            cameraIds = cameraIds.split(",");
            let currentCameras = [];
            for (let i = 0; i < data.length; i++) {
              const camera = data[i];

              // if (camera.port === 37777) {
              //   camera.modelType = 3;
              // } else {
              //   camera.modeType = 2;
              // }

              if (cameraIds.includes(camera.devId)) {
                currentCameras.push(camera);
              }
            }

            this.currentCameras = currentCameras;

            this.setState({
              cameraList: res.data,
              currentCameras: currentCameras
            });

            setTimeout(() => {
              this._startPlay(currentCameras);
            }, 100);
          } else {
            this.setState({
              cameraList: res.data
            });
          }
        } else {
          message.error("摄像头列表获取失败");
        }
      })
      .catch(err => {
        message.error(ERROR_TIP);
        console.error(err);
      });
  };

  getTotal = () => {
    this._getTotalData();
    this._getAlarmTotalData();
  };

  /**
   * 获取累计通过人数
   */
  _getTotalData = () => {
    request({
      url: api.gettotal,
      method: "post",
      data: {
        idList: this.currentCameras.map(item => {
          return item.devId;
        })
      }
    })
      .then(res => {
        // console.log("RRRRRRRRRRRRRRR", res);
        if (res.errCode === 0) {
          // message.success(res.data);
          this.setState({
            totalPerson: res.data
          });
        }
        // else {
        //   this.setState({
        //     totalPerson: 0
        //   });
        // }
      })
      .catch(err => {
        message.error(ERROR_TIP);
        console.error(err);
      });
  };

  /**
   * 获取今日发热人
   */
  _getAlarmTotalData = () => {
    request({
      url: api.getAlarmTotal,
      method: "post",
      data: {
        idList: this.currentCameras.map(item => {
          return item.devId;
        }),
        urlParams: {
          id: this.currentTime
        }
      }
    })
      .then(res => {
        if (res.errCode === 0) {
          this.setState({
            totalAlarmPerson: res.count
          });
        } else {
          this.setState({
            totalAlarmPerson: 0
          });
        }
      })
      .catch(err => {
        message.error(ERROR_TIP);
        console.error(err);
      });
  };

  /**
   * 获取历史告警消息
   */
  _getHistoryAlarmList = () => {
    const devIdList = this.currentCameras.map(item => {
      return item.devId;
    });

    // console.log("this_currentCameras", this.currentCameras);
    request({
      url: api.getHistory,
      method: "post",
      data: {
        pageNo: 1,
        pageSize: 10,
        devIdList
      }
    })
      .then(res => {
        if (res.errCode === 0) {
          // console.log("历史", res);
          const data = res.data;
          // const cameraIds = this.currentCameras.map(item => {
          //   return item.devId;
          // });

          let alarmList = [];
          for (let i = 0; i < data.length; i++) {
            if (devIdList.includes(data[i].sourceId)) {
              alarmList.push(data[i]);
            }
          }

          this.setState({
            alarmList: alarmList
          });
        }
      })
      .catch(error => {
        message.error(ERROR_TIP);
        console.error(error);
      });
  };

  /**
   * 温度配置服务
   */
  _setTempertureService = () => {
    request({
      url: api.setTemperture,
      method: "post",
      data: {
        cameraInfoDtoList: [],
        lowLimit: this.lowerTemp,
        highLimit: this.highTemp
      }
    })
      .then(res => {
        if (res.errCode === 0) {
          message.success("配置设置成功");
          this.setState({
            highTemp: this.highTemp,
            lowerTemp: this.lowerTemp
          });
        } else {
          message.error("配置设置失败");
        }
      })
      .catch(error => {
        message.error(ERROR_TIP);
        console.error(error);
      });
  };

  /**
   * 监听温度MQTT
   */
  _onListenTempMqtt = () => {
    //连接 mqtt 服务，生成客户端
    this.client = TempMqttClient.connect();
    //MqttClient 订阅
    TempMqttClient.listen(this.client, res => {
      const cameraIds = this.currentCameras.map(item => {
        return item.devId;
      });

      // console.log('sssssssssss', {a:this.currentCameras,b:this.state.currentCameras});
      console.log("czf_温度mqtt", { res, cameraIds });
      //过滤非当前摄像头告警
      if (cameraIds.includes(String(res.sourceId))) {
        let alarmList = [{ ...res }, ...this.state.alarmList];
        if (alarmList.length > ALARM_COUNT) {
          alarmList.length = ALARM_COUNT;
        }

        let totalAlarmPerson = this.state.totalAlarmPerson;
        if (res.tempAlarmFlag === 1) {
          //只累加温度告警人数
          totalAlarmPerson = Number(totalAlarmPerson) + 1;
          this.playAlarmAudio("temp");
        } else if (res.wearMask === 2) {
          this.playAlarmAudio("noMask");
        }

        this.handleNoticeAlarm(); //点亮右上角的告警小红点

        if (this.state.autoView) {
          this.handleAutoView({ ...res }); //自动弹窗
        }

        this.setState({
          alarmList,
          totalAlarmPerson
        });
      }
    });
  };

  /**
   * 自动弹窗告警详情
   * @param {*} alarmItemInfo
   */
  handleAutoView = alarmItemInfo => {
    if (this.state.autoShowView) {
      this.setState(
        {
          autoShowView: false
        },
        () => {
          this._getAlarmDetails(alarmItemInfo.id);
        }
      );
    } else {
      this._getAlarmDetails(alarmItemInfo.id);
    }
  };

  _getAlarmDetails = id => {
    this.__getAlarmDetailsService(id)
      .then(res => {
        if (res.errCode === 0) {
          const data = res.data;

          let haveMask = true;
          switch (data.wearMask) {
            //是否戴口罩0不额定 1是 2否
            case 1:
              haveMask = true;
              break;
            case 2:
              haveMask = false;
              break;
            default:
              break;
          }

          let tempAlarm = true;
          switch (data.tempAlarmFlag) {
            //是否是温度告警 0-否 1-是
            case 1:
              tempAlarm = true;
              break;
            case 0:
              tempAlarm = false;
              break;
            default:
              break;
          }

          if (this.autoTimer) {
            clearTimeout(this.autoTimer);
            this.autoTimer = null;
          }

          this.setState(
            {
              autoShowView: true,
              autoAlarmItemInfo: { tempAlarm, haveMask, ...data }
            },
            () => {
              this.autoTimer = setTimeout(() => {
                this.setState({
                  autoShowView: false
                });
              }, TIME);
            }
          );
        }
      })
      .catch(error => {
        // message.error(ERROR_TIP);
        console.error(error);
      });
  };

  /**
   * 显示配置modal
   */
  handleSetConfig = () => {
    this.highTemp = this.state.highTemp;
    this.lowerTemp = this.state.lowerTemp;
    this.autoView = this.state.autoView;
    this.setState({
      showConfig: true
    });
  };

  onChangeLowerTemp = e => {
    this.lowerTemp = Number(e.target.value);
  };

  onChangeHeighTemp = e => {
    this.highTemp = Number(e.target.value);
  };

  /**
   * 摄像头选择
   * @param {*} camera
   */
  onChangeCamera = cameraIds => {
    if (cameraIds.length > MAX_CAMERA) {
      message.warning(`最多只能选择${MAX_CAMERA}个摄像头`);
      return;
    }
    console.log("选择的摄像头", cameraIds);
    const { cameraList } = this.state;
    let currentCameras = [];
    for (let i = 0, len = cameraList.length; i < len; i++) {
      if (cameraIds.includes(cameraList[i].devId)) {
        currentCameras.push(cameraList[i]);
      }
    }

    this.setState({
      currentCameras
    });
  };

  /**
   * 确定配置
   */
  handleSure = () => {
    const { lowerTemp, highTemp, autoView } = this;
    const { currentCameras } = this.state;
    // console.log("配置确定", {
    //   lowerTemp,
    //   highTemp,
    //   autoView
    // });

    if (this.__inNumber(lowerTemp) && this.__inNumber(highTemp)) {
      //TODO:

      if (lowerTemp > highTemp) {
        message.warning("请设置正确的温度范围");
        return;
      }

      this._setTempertureService();

      this.setState({
        autoView
      });


      let str = [];
      for (let i = 0; i < currentCameras.length; i++) {
        str.push(currentCameras[i].devId);
      }
      // console.log("str", str);
      Cookies.set("cameraIds", str.join());

      setTimeout(() => {
        this._startPlay(currentCameras);
      }, 100);

    } else {
      message.warning("请输入正确的温度");
    }
  };

  /**
   * 开始预览监控视频
   * @param {*} currentCameras 选中的摄像头
   */
  _startPlay = currentCameras => {
    //TODO:
    // this.autoView = this.state.autoView;
    this.currentCameras = currentCameras;
    if (this.state.showConfig) {
      this.setState({
        showConfig: false
      });
    }
    if (currentCameras.length === 0) {
      this.setState({
        totalPerson: "--",
        totalAlarmPerson: "--"
      });
    } else {
      this.getTotal();
    }

    //将摄像头信息传递iframe
    this._selectedCamera(currentCameras);
    // this._setTempertureService();

    this._getHistoryAlarmList();
    // this.getTotal(camera.devId);
  };

  _selectedCamera = currentCameras => {
    console.log("选中的摄像头信息", currentCameras);
    //将摄像头信息传递iframe
    window.document.cameraInfo = currentCameras;
  };

  /**
   * Number判断
   * @param {*} numb
   * @returns
   */
  __inNumber = numb => {
    if (typeof numb === "number" && !isNaN(numb)) {
      return true;
    } else {
      return false;
    }
  };

  /**
   * 关闭配置
   */
  handleCloseConfig = () => {
    this.setState({
      showConfig: false,
      currentCameras: this.currentCameras
    });
  };

  /**
   * 查看告警消息详情
   * @param {*} alarmItemInfo
   */
  handleViewDetails = alarmItemInfo => {
    this.__getAlarmDetailsService(alarmItemInfo.id)
      .then(res => {
        if (res.errCode === 0) {
          const data = res.data;

          let haveMask = alarmItemInfo.haveMask;
          switch (data.wearMask) {
            //是否戴口罩0不额定 1是 2否
            case 1:
              haveMask = true;
              break;
            case 2:
              haveMask = false;
              break;
            default:
              break;
          }

          let tempAlarm = alarmItemInfo.tempAlarm;
          switch (data.tempAlarmFlag) {
            //是否是温度告警 0-否 1-是
            case 1:
              tempAlarm = true;
              break;
            case 0:
              tempAlarm = false;
              break;
            default:
              break;
          }
          this.setState({
            alarmVisible: true,
            alarmItemInfo: { tempAlarm, haveMask, ...data }
          });
        } else {
          message.error("查看详情失败");
        }
      })
      .catch(err => {
        message.error(ERROR_TIP);
        console.error(err);
      });
  };

  __getAlarmDetailsService = id => {
    return request({
      url: api.alarmInfo,
      method: "get",
      data: {
        urlParams: {
          id: id
        }
      }
    });
  };

  /**
   * 关闭弹窗
   */
  handleCancel = () => {
    this.setState({
      alarmVisible: false
    });
  };

  /**
   *播放告警音
   *
   */
  playAlarmAudio = (alarmType = "temp") => {
    document.title = document.title.replace("【新事件】", "");
    document.title = document.title = "【新事件】" + document.title;
    if (!this.state.playAudio) {
      this.setState(
        {
          playAudio: true,
          alarmType
        },
        () => {
          setTimeout(() => {
            document.title = document.title.replace("【新事件】", "");
            this.setState({
              playAudio: false
            });
          }, 3000);
        }
      );
    }
  };

  /**
   * 是否自动弹窗开关
   * @param {*} checked
   */
  hadleChangeAutoShow = checked => {
    this.autoView = checked;
    // this.setState({
    //   autoView: checked
    // });
  };

  /**
   * 告警小圆点提示
   */
  handleNoticeAlarm = () => {
    const { handleNotificationAlert } = this.props;

    if (handleNotificationAlert) {
      handleNotificationAlert(true);
      if (this.dotTimer) {
        clearTimeout(this.dotTimer);
        this.dotTimer = null;
      }

      this.dotTimer = setTimeout(() => {
        handleNotificationAlert(false);
      }, 8000);
    }
  };

  /**
   * 显示导出modal
   */
  handleShowExport = () => {
    this.setState({ showExportModal: true });
  };

  handleCloseExport = () => {
    this.setState({ showExportModal: false });
  };

  /**
   * 查看抓拍详情
   */
  handleViewCaptureDetails = captureInfo => {
    this.__getCaptureDetailsService(captureInfo.id)
      .then(res => {
        if (res.errCode === 0) {
          this.setState({
            viewCaptureVisible: true,
            captureItemInfo: res.data
          });
        }
      })
      .catch(error => {});
  };

  __getCaptureDetailsService = faceId => {
    return request({
      url: api.getCaptureInfo,
      method: "get",
      data: {
        urlParams: {
          id: faceId
        }
      }
    });
  };

  handleCloseViewCapturePic = () => {
    this.setState({
      viewCaptureVisible: false
    });
  };

  /**
   * 查看全部抓拍
   */
  handleMoreCapture = () => {
    this.setState({
      showMoreAll: true,
      showMoreType: "capture"
    });
  };

  /**
   * 查看全部告警
   */
  handleMoreAlarm = () => {
    this.setState({
      showMoreAll: true,
      showMoreType: "alarm"
    });
  };

  /**
   * 返回
   */
  handleGoBack = () => {
    this.setState({
      showMoreAll: false,
      showMoreType: ""
    });
  };

  render() {
    const {
      viewPicVisible,
      // palyVideoVisible,
      // currentCameraName,
      alarmList,
      alarmVisible,
      alarmItemInfo,
      showConfig,
      // currentCameraData,
      cameraList,
      totalPerson,
      totalAlarmPerson,
      currentCameras,
      alarmType,
      playAudio,
      // autoViewShow,
      autoShowView,
      autoView,
      autoAlarmItemInfo,
      showExportModal,
      showMoreAll,
      showMoreType,

      viewCaptureVisible,
      captureItemInfo
      // showMoreCapture
      // exportTime,
      // exportPercent,
      // isExport
    } = this.state;

    const len = this.currentCameras.length;
    let cameraTip = "--";
    if (len === 1) {
      cameraTip = this.currentCameras[0].devName;
    } else if (len > 1) {
      cameraTip = `${this.currentCameras[0].devName}等${len}个摄像头`;
    }

    // let isCompared = true;

    // if (!alarmItemInfo.personName) {
    //   isCompared = false;
    // }
    console.log("alarmItemInfo", {
      alarmItemInfo,
      showExportModal,
      cameraIds: this.cameraIds,
      browserType
    });
    return (
      <>
        {showMoreAll && (
          // <Layout className="temperture-more-container">
          <ShowMorePanel
            type={showMoreType}
            currentCameras={this.currentCameras}
            cameras={cameraList}
            goBack={this.handleGoBack}
          />
          // </Layout>
        )}

        {!showMoreAll && (
          <Layout className="temperture-monitor-container">
            {/* {showMoreCapture && <Content>showMoreCapture</Content>} */}
            {/* {!showMoreAll && (
            <> */}
            <Header className="temperture-monitor-header">
              <div style={{ marginLeft: "10px" }}>{cameraTip}</div>

              <div className="temperture-monitor-setting">
                <div onClick={this.handleShowExport} className="export-wraper">
                  <img src={exportImg} alt="" />
                  <span
                    style={{
                      marginLeft: "10px"
                    }}
                  >
                    {intl.get("d").d("导出")}
                  </span>
                  <ExportModal
                    visible={showExportModal}
                    cancel={this.handleCloseExport}
                    className="export-position"
                    cameras={cameraList}
                    currentCameras={currentCameras}
                  />
                </div>

                <div onClick={this.handleSetConfig} className="setting-wrap">
                  <img src={controlImg} alt="" />
                  <span
                    style={{
                      marginLeft: "10px"
                    }}
                  >
                    {intl.get("d").d("配置")}
                  </span>
                </div>
              </div>
            </Header>
            <Layout
              style={{
                backgroundColor: "#F1F2F3 "
              }}
            >
              <Content
                style={
                  IS_NOTBOOK
                    ? {
                        height: "calc(100vh - 124px)",
                        marginRight: "344px",
                        overflow: "hidden"
                      }
                    : {
                        // height: "calc(100vh - 178px)",
                        height: "calc(100vh - 160px)",
                        marginRight: "344px",
                        overflow: "hidden"
                      }
                }
              >
                <RealtimeCapture
                  isNone={
                    showConfig ||
                    alarmVisible ||
                    viewPicVisible ||
                    autoShowView ||
                    viewCaptureVisible ||
                    showExportModal
                  }
                  totalPerson={totalPerson}
                  totalAlarmPerson={totalAlarmPerson}
                  data={this.currentCameras}
                  currentCameras={this.currentCameras}
                  showMore={this.handleMoreCapture}
                  handleView={this.handleViewCaptureDetails}
                />
              </Content>
              <Sider
                width={browserType && browserType === "ie" ? 340 : 320}
                style={
                  IS_NOTBOOK
                    ? {
                        height: "calc(100vh - 124px)",
                        position: "fixed",
                        right: "24px"
                        // overflow: "auto"
                      }
                    : {
                        height: "calc(100vh - 160px)",
                        position: "fixed",
                        right: "24px"
                        // overflow: "auto"
                      }
                }
                className="temperture-monitor-sider"
              >
                {/* <div className="temperture-monitor"> */}
                <div className="temperture-monitor-sider-title">
                  <span> {intl.get("s").d("告警消息")} </span>
                  <div
                    style={{ cursor: "pointer" }}
                    onClick={this.handleMoreAlarm}
                  >
                    <span className="temperture-monitor-sider-all">
                      {intl.get("s").d("全部")}
                    </span>
                    <img src={doubleRight} alt="" />
                  </div>
                </div>

                <div
                  className={
                    alarmList.length !== 0
                      ? "temperture-monitor-alarm-container"
                      : "no-alarm-data"
                  }
                >
                  {alarmList.length !== 0 ? (
                    alarmList.map(item => {
                      return (
                        <AlarmItem
                          className="bounceInDown"
                          key={item.id}
                          alarmInfo={item}
                          onClickDetai={this.handleViewDetails}
                        />
                      );
                    })
                  ) : (
                    <div>暂无告警消息</div>
                  )}
                </div>
                {/* </div> */}
              </Sider>
              <AlarmDetail
                visible={autoShowView}
                alarmItemInfo={autoAlarmItemInfo}
                onClose={() => this.setState({ autoShowView: false })}
              />
            </Layout>
            {/* </>
          )} */}
            <Modal
              title={intl.get("d").d("配置")}
              visible={showConfig}
              //   footer={null}
              width={366}
              onOk={this.handleSure}
              centered={true}
              maskClosable={false}
              onCancel={this.handleCloseConfig}
              wrapClassName="config-modal-container"
              //   style={{ backgroundColor: "#993844" }}
              destroyOnClose
            >
              <div className="config-container">
                <span className="alarm-config-title">
                  {intl.get("e").d("告警温度范围设置")}
                </span>
                <div className="temperture-ranger-input">
                  <Input
                    defaultValue={this.state.lowerTemp}
                    onChange={this.onChangeLowerTemp}
                    style={{
                      width: "96px"
                    }}
                    placeholder="请输入"
                  />
                  <span>℃</span>
                  <span style={{ display: "inline-block", width: "10px" }}>
                    ~
                  </span>
                  <Input
                    defaultValue={this.state.highTemp}
                    onChange={this.onChangeHeighTemp}
                    style={{
                      width: "96px"
                    }}
                    placeholder="请输入"
                  />
                  <span>℃</span>
                </div>
                <span className="alarm-config-title">
                  {intl.get("e").d("摄像头选择")}
                </span>
                <Select
                  mode="multiple"
                  value={currentCameras.map(item => {
                    return item.devId;
                  })}
                  showArrow={true}
                  placeholder="请选择摄像头"
                  //   style={{ width: 120 }}
                  onChange={this.onChangeCamera}
                >
                  {cameraList.map(camera => {
                    return (
                      <Option key={camera.devId} value={camera.devId}>
                        {camera.devName}
                      </Option>
                    );
                  })}
                </Select>

                <div className="alarm-config-auto-view">
                  <span style={{ marginRight: "20px" }}>
                    {intl.get("d").d("告警是否开启弹窗")}:
                  </span>
                  <Switch
                    defaultChecked={autoView}
                    checkedChildren="开"
                    unCheckedChildren="关"
                    // defaultChecked
                    onChange={this.hadleChangeAutoShow}
                  />
                </div>
              </div>
            </Modal>
            {/* 查看告警详情 */}

            <PreviewDetail
              visible={alarmVisible}
              data={alarmItemInfo}
              onClose={this.handleCancel}
            />

            <Modal
              title=""
              visible={viewCaptureVisible}
              footer={null}
              width={800}
              //   onOk={this.handleOk}
              centered={true}
              maskClosable={false}
              onCancel={this.handleCloseViewCapturePic}
              wrapClassName="pic-modal-container"
              bodyStyle={{
                padding: "0"
              }}
              //   style={{ backgroundColor: "#993844" }}
            >
              <div className="big-pic-container">
                <img src={captureItemInfo.uri} height="100%" alt="" />
              </div>
            </Modal>

            {playAudio && <AlarmAudio alarmType={alarmType} />}
          </Layout>
        )}
      </>
    );
  }
}

export default TemperatureMonitor;
