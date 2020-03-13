import React, { Component } from "react";
import { Layout, message } from "antd";
import * as intl from "react-intl-universal";
import Swiper from "swiper/dist/js/swiper.js";
import "swiper/dist/css/swiper.min.css";
import CaptureItem from "./CaptureItem";
import RealtimeVideo from "./RealtimeVideo";
// import { guid } from "../../../utils/guid";
import MqttClient from "../../../utils/mqtt";
import api from "../../../utils/api";
import request from "../../../utils/request.js";

import "../assets/styles/realtimeCapture.scss";
import faceUrl from "../assets/images/face.png";
import doubleRight from "../assets/images/double right.svg";
import moment from "moment";
import { isEqual } from "lodash";

const { Header, Content } = Layout;
let MAX_CAPERTURE = 13;
const scree_width = window.screen.width;
if (scree_width <= 1366) {
  MAX_CAPERTURE = 8;
}
const ERROR_TIP = intl.get("dd").d("系统异常，请稍后再试");

const mpck = [];

for (let i = 0; i < 13; i++) {
  mpck.push({
    id: i,
    imageUrl: faceUrl,
    degree: 37.5,
    time: 888885458
  });
}
export class RealtimeCapture extends Component {
  constructor(props) {
    super(props);
    this.swiperRef = React.createRef();
    this.swiper = null;
    this.taskIds = [];

    this.state = {
      captureList: [], //抓拍列表
      totalPerson: props.totalPerson,
      currentCameras: props.currentCameras
    };
  }

  componentDidMount = () => {
    this._horizontalScrolling();
    this._onListenMqtt();
    const { currentCameras } = this.props;
    if (currentCameras.length > 0) {
      this.__getMoreCapture(currentCameras.map(camera => camera.devId));
    }
  };

  componentWillUnmount() {
    MqttClient.unsubscribe(this.client); //取消订阅
  }

  componentWillReceiveProps(nestProps) {
    const { currentCameras, totalPerson } = nestProps;
    let list = [];
    for (let i = 0; i < currentCameras.length; i++) {
      list.push(currentCameras[i].taskId);
    }
    this.taskIds = list;
    // 重新选择摄像头后做筛选
    if (currentCameras.length === 0) {
      this.setState({
        captureList: []
      });
    } else {
      if (!isEqual(currentCameras, this.props.currentCameras)) {
        this.__getMoreCapture(currentCameras.map(camera => camera.devId));
      }
    }
    if (this.props.totalPerson !== totalPerson) {
      this.setState({
        totalPerson
        // captureList: []
      });
    }
  }

  /**
   * 获取更多抓拍
   */
  __getMoreCapture = currentCameraId => {
    request({
      url: api.getAllCapture,
      method: "post",
      data: {
        pageNo: 1,
        pageSize: MAX_CAPERTURE,
        devIdList: currentCameraId,
        startTime: "2015-01-01 00:00:00",
        endTime: moment().format("YYYY-MM-DD HH:mm:ss")
      }
    })
      .then(res => {
        console.log("更多抓拍", res);
        if (res.errCode === 0) {
          this.setState({
            captureList: res.data
          });
        }
      })
      .catch(error => {
        message.error(ERROR_TIP);
        console.error(error);
      });
  };

  /**
   * 监听MQTT
   */
  _onListenMqtt = () => {
    //连接 mqtt 服务，生成客户端
    this.client = MqttClient.connect();

    //MqttClient 订阅
    MqttClient.listen(this.client, res => {
      console.log("czf_mqtt", res);
      // if (res) {
      // console.log("1111111", this.taskIds);

      //过滤非当前摄像头抓拍
      if (
        res.FaceId &&
        res.TaskId &&
        this.taskIds.includes(String(res.TaskId))
      ) {
        //累计抓拍人数
        this.setState({
          totalPerson: Number(this.state.totalPerson) + 1
        });

        this._getCaptureFace(res.FaceId, String(res.TaskId));
      }
      // }
    });
  };

  /**
   * 获取抓拍人脸
   * @param {*}
   */
  _getCaptureFace = (faceId, taskId) => {
    request({
      url: api.getCaptureFace,
      method: "get",
      data: {
        urlParams: {
          id: faceId
        }
      }
    })
      .then(res => {
        console.log("抓拍人脸信息", res.data);
        // console.log(("2222", Number(this.state.totalPerson) + 1));
        if (res.errCode === 0 && res.data.degree) {
          let captureList = [
            {
              ...res.data,
              taskId,
              uid: moment().valueOf()
            },
            ...this.state.captureList
          ];

          if (captureList.length > MAX_CAPERTURE) {
            captureList.length = MAX_CAPERTURE;
          }
          this.setState({
            captureList
            // totalPerson: Number(this.state.totalPerson) + 1
          });
        }
      })
      .catch(err => {
        message.error(ERROR_TIP);
        console.error(err);
      });
  };

  /**
   * 横向滚动
   */
  _horizontalScrolling = () => {
    const swiper = new Swiper(".swiper-container", {
      //   slidesPerView: "auto",
      slidesPerView: 3,
      //   slidesPerGroup: 3.8,
      spaceBetween: 32, //滑块之间距离
      mousewheel: true, //鼠标是否可以移动
      //   centerInsufficientSlides: true,

      freeMode: true,
      observer: true,
      autoWidth: true,
      scrollbar: {
        //滚动条
        el: ".swiper-scrollbar"
      },
      dragSize: 30
    });

    // swiper.scrollbar.$el.css("height", "18px");
    // swiper.scrollbar.$el.css("background", "#D1D1D1");
    // swiper.scrollbar.$el.css("border-radius", "7px");
    // console.log("swiper.scrollbar", swiper.scrollbar);

    this.swiper = swiper;
  };

  handleMoreCapture = () => {
    const { showMore } = this.props;
    if (showMore) {
      showMore();
    }
  };

  /**
   * 查看详情
   */
  handleView = captureInfo => {
    const { handleView } = this.props;
    if (handleView) {
      handleView(captureInfo);
    }
  };

  render() {
    // const { data, currentCameras } = this.props;
    const { captureList, totalPerson } = this.state;
    const { totalAlarmPerson, currentCameras } = this.props;

    // console.log("czf_currentCameras", currentCameras);
    return (
      <Layout className="realtime-capture-container">
        <Header className="realtime-capture-header">
          <div className="reltime-capture-total">
            <span
              style={{
                fontSize: "20px",
                color: "#0D1C27"
              }}
            >
              {intl.get("d").d("累计通过人数")}：
            </span>
            <span
              style={{
                fontSize: "32px",
                color: "#4A4D51"
              }}
            >
              {totalPerson}
            </span>
          </div>
          <div className="reltime-capture-today">
            <span
              style={{
                fontSize: "20px",
                color: "#0D1C27"
              }}
            >
              {intl.get("d").d("今日发热人数")}：
            </span>
            <span
              style={{
                fontSize: "32px",
                color: " #FF5D71"
              }}
            >
              {totalAlarmPerson}
            </span>
          </div>
        </Header>
        <Content className="realtime-capture-content">
          <RealtimeVideo isNone={this.props.isNone} data={currentCameras} />

          {/* <div className="wrap">
            <div className="item1"></div>
            <div className="item2"></div>
            <div className="item3"></div>
            <div className="item4"></div>
          </div> */}

          {/* <div>
            <div
              className="swiper-container vendor-result-item-list"
              ref={this.swiperRef}
            >
              <div className="swiper-wrapper">
                {captureList.map((item, index) => {
                  return <CaptureItem key={item.id} captureInfo={item} />;
                })}
              </div>
              <div className="swiper-scrollbar" />
            </div>
          </div> */}

          <div className="capture-footer">
            <div className="realtime-capture-title">
              <span style={{ marginLeft: "12px" }}>
                {intl.get("s").d("通过人员抓拍")}
              </span>
              <div
                style={{ cursor: "pointer", marginRight: 12 }}
                onClick={this.handleMoreCapture}
              >
                <span className="realtime-capture-all">
                  {intl.get("s").d("全部")}
                </span>
                <img src={doubleRight} alt="" />
              </div>
            </div>
            <div
              className={
                captureList.length !== 0
                  ? "realtime-capture-person-container capture-data"
                  : "realtime-capture-person-container no-capture-data"
              }
            >
              {captureList.length !== 0 &&
                captureList.map(item => {
                  return (
                    <CaptureItem
                      style={{ padding: "8px 8px 0 8px" }}
                      className="bounceInLeft"
                      key={item.uid || item.id}
                      onClick={this.handleView}
                      captureInfo={item}
                    />
                  );
                })}
              {captureList.length === 0 && (
                // <div className="no-capture-data">
                <span> 暂无抓拍人员 </span>
                // </div>
              )}
            </div>
          </div>
        </Content>
        {/* <Footer className="realtime-capture-footer"> */}
        {/* <div className="nn">
            <div className="realtime-capture-title">
              <span> {intl.get("s").d("通过人员抓拍")} </span>
              <span className="realtime-capture-all">
                {intl.get("s").d("全部")}
              </span>
            </div>
            <div
              className={
                captureList.length !== 0
                  ? "realtime-capture-person-container"
                  : "no-capture-data"
              }
            >
              {captureList.length !== 0 &&
                captureList.map(item => {
                  return <CaptureItem key={item.id} captureInfo={item} />;
                })}
              {captureList.length === 0 && (
                // <div className="no-capture-data">
                <p> 暂无抓拍人员 </p>
                // </div>
              )}
            </div>
          </div> */}

        {/* <div
            className="swiper-container vendor-result-item-list"
            ref={this.swiperRef}
          >
            <div className="swiper-wrapper">
              {captureList.map((item, index) => {
                return <CaptureItem key={item.id} captureInfo={item} />;
              })}
            </div>
            <div className="swiper-scrollbar" />
          </div> */}
        {/* </Footer> */}
      </Layout>
    );
  }
}

export default RealtimeCapture;
