import React, { Component } from "react";
import {
  Empty,
  message,
  Layout,
  Select,
  DatePicker,
  Button,
  Pagination,
  Modal,
  Drawer,
  Spin
} from "antd";
import * as intl from "react-intl-universal";
import AlarmItem from "./AlarmItem";
import CaptureItem from "./CaptureItem";
import PreviewDetail from "./PreviewDetail";
import TimeLineEvent from "../TimeLineEvent/TimeLineEvent";
// import dayjs from "dayjs";
import moment from "moment";
import api from "../../../utils/api";
import request from "../../../utils/request.js";

import "../assets/styles/showMorePanel.scss";
// import '../assets/'

const { Content } = Layout;
const { Option } = Select;
const { RangePicker } = DatePicker;
const FORMAT = "YYYY-MM-DD HH:mm:ss";
const ERROR_TIP = intl.get("dd").d("系统异常，请稍后再试");

const mockData = [];
for (let i = 0; i < 56; i++) {
  mockData.push({
    id: i,
    imageUrl:
      "http://192.168.11.236/ifsrc/engine1/eng1store1_0/ImgWareHouse/src_0_1000/20200213/20200213T235959_524_1000.jpg",
    degree: "37.8",
    time: "2020-01-10 20:05:52"
  });
}

const ALARM_PAGESIZE = window.config.showAlarmCount || 15;
const CAPTURE_PAGESIZE = window.config.showCaptureCount || 56;

export class ShowMorePanel extends Component {
  static defaultProps = {
    cameras: [],
    currentCameras: [],
    goBack: () => {},
    type: "" //  alarm  capture
  };

  constructor(props) {
    super(props);
    this.state = {
      currentCameraId: props.currentCameras.map(item => {
        return item.devId;
      }),
      total: 0,
      page: 1,
      // pageSize: 6,
      dataList: [],
      startDate: moment()
        .startOf("day")
        .format(FORMAT),
      endDate: moment()
        .endOf("day")
        .format(FORMAT),
      timeLineData: {},
      alarmVisible: false, //是否查看告警
      alarmItemInfo: {}, //查看告警信息
      viewCaptureVisible: false,
      captureItemInfo: {},
      loading: false
    };
  }

  componentDidMount() {
    this._getMoreData();
  }

  /**
   * 返回
   */
  handleBack = () => {
    const { goBack } = this.props;
    if (goBack) {
      goBack();
    }
  };

  /**
   * 获取跟多数据
   */
  _getMoreData = () => {
    this.setState({
      dataList: [],
      loading: true
    });
    const { type } = this.props;
    if (type === "alarm") {
      this.__getMoreAlarm();
    } else {
      this.__getMoreCapture();
    }
  };

  /**
   * 获取更多告警
   */
  __getMoreAlarm = () => {
    const { page, currentCameraId, startDate, endDate } = this.state;
    request({
      url: api.getHistory,
      method: "post",
      data: {
        pageNo: page,
        pageSize: ALARM_PAGESIZE,
        devIdList: currentCameraId,
        startTime: startDate,
        endTime: endDate
      }
    })
      .then(res => {
        console.log("更多告警", res);
        if (res.errCode === 0) {
          this.setState({
            total: res.total,
            dataList: res.data,
            loading: false
          });
        } else {
          this.setState({
            total: 0,
            dataList: [],
            loading: false
          });
        }
      })
      .catch(error => {
        message.error(ERROR_TIP);
        console.error(error);
      });
  };

  /**
   * 获取更多抓拍
   */
  __getMoreCapture = () => {
    const { page, currentCameraId, startDate, endDate } = this.state;

    request({
      url: api.getAllCapture,
      method: "post",
      data: {
        pageNo: page,
        pageSize: CAPTURE_PAGESIZE,
        devIdList: currentCameraId,
        startTime: startDate,
        endTime: endDate
      }
    })
      .then(res => {
        console.log("更多抓拍", res);
        if (res.errCode === 0) {
          this.setState({
            total: res.total,
            dataList: res.data,
            loading: false
          });
        } else {
          this.setState({
            total: 0,
            dataList: [],
            loading: false
          });
        }
      })
      .catch(error => {
        message.error(ERROR_TIP);
        console.error(error);
      });
  };

  /**
   * 日期选择
   * @param {*} date
   * @param {*} dateString
   */
  handleChangeDate = (date, dateString) => {
    console.log("选中日期", { date, dateString });
    this.setState({
      startDate: dateString[0] ? `${dateString[0]} 00:00:00` : "",
      endDate: dateString[1] ? `${dateString[1]} 23:59:59` : ""
    });
  };

  /**
   * 摄像头选择
   * @param {*} cameras
   */
  hanldeChangeCamera = cameras => {
    console.log("选中摄像头", cameras);
    this.setState({
      currentCameraId: cameras
    });
  };

  onChangePage = (page, pageSize) => {
    this.setState(
      {
        page
      },
      () => {
        this._getMoreData();
      }
    );
  };

  /**
   * 查询
   */
  handleSearch = () => {
    this.setState(
      {
        page: 1
      },
      () => {
        this._getMoreData();
      }
    );
  };

  /**
   * 查看事件流
   * @memberof ShowMorePanel
   */
  handleViewTimeLine = alarmItemInfo => {
    console.log("czf_timeLineData", alarmItemInfo);
    if (alarmItemInfo.personName) {
      //  布控比中
      this.setState({
        showTimeLine: true,
        timeLineData: alarmItemInfo
      });
    }
  };

  handleCloseTimeLine = () => {
    this.setState({
      showTimeLine: false,
      timeLineData: {}
    });
  };

  /**
   * 查看告警详情
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

  handleCancel = () => {
    this.setState({
      alarmVisible: false
    });
  };

  /**
   * 查看抓拍大图
   * @memberof ShowMorePanel
   */
  handleViewCapturePic = captureInfo => {
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

  render() {
    const { cameras, type } = this.props;
    const {
      currentCameraId,
      dataList,
      page,
      total,
      endDate,
      startDate,
      timeLineData,
      alarmVisible,
      alarmItemInfo,
      viewCaptureVisible,
      captureItemInfo,
      showTimeLine,
      loading
    } = this.state;

    return (
      <Layout
        className="more-container"
        style={{
          height: "calc(100vh - 64px)"
          // height: "calc(100vh-64px)"
        }}
      >
        {/* <Header> */}
        <Content className="more-content">
          <div className="more-content-header-container">
            <div className="more-return">
              <Button onClick={this.handleBack}>
                {intl.get("d").d("返回")}
              </Button>
            </div>

            <div className="more-header">
              <div className="more-date">
                <span className="more-date-label">
                  {intl.get("d").d("选择日期")} :
                </span>
                <RangePicker
                  defaultValue={[
                    moment(startDate, FORMAT),
                    moment(endDate, FORMAT)
                  ]}
                  // value={[moment(startDate, FORMAT), moment(endDate, FORMAT)]}
                  className="more-date-select"
                  disabledDate={current => current > moment().endOf("day")}
                  onChange={this.handleChangeDate}
                />
              </div>
              <div className="more-camera">
                <span className="more-camera-label">
                  {intl.get("d").d("摄像头")} :
                </span>
                <Select
                  mode="multiple"
                  defaultValue={currentCameraId}
                  showArrow={true}
                  placeholder="请选择摄像头"
                  style={{ minWidth: 550 }}
                  onChange={this.hanldeChangeCamera}
                >
                  {cameras.map(camera => {
                    return (
                      <Option key={camera.devId} value={camera.devId}>
                        {camera.devName}
                      </Option>
                    );
                  })}
                </Select>
              </div>
              <Button
                // disabled={isExport}
                onClick={this.handleSearch}
                type="primary"
              >
                {intl.get("d").d("查询")}
              </Button>
            </div>
          </div>
          <div style={{ display: "flex" }}>
            <div style={{ flexGrow: 1, width: "100vw" }}>
              <div
                // style={{
                // width:
                // Object.keys(timeLineData).length > 0
                //   ? "calc(100vw - 550px)"
                //   : "100vw"
                // }}
                className={
                  dataList.length ? "more-content-container" : "more-no-data"
                }
              >
                {type === "alarm" &&
                  dataList.map(item => {
                    return (
                      <AlarmItem
                        key={item.id}
                        className={`bounceIn${
                          timeLineData.id === item.id ? " selected" : ""
                        }`}
                        style={{
                          width: "340px",
                          margin: "8px",
                          boxShadow: " 0px 0px 5px 2px rgba(0, 0, 0, 0.2)"
                        }}
                        alarmInfo={item}
                        onClickTimeLine={this.handleViewTimeLine}
                        onClickDetai={this.handleViewDetails}
                        // onClick={this.handleViewTimeLine}
                      />
                    );
                  })}
                {type === "capture" &&
                  dataList.map(item => {
                    return (
                      <CaptureItem
                        style={{
                          width: "116px",
                          height: "168px",
                          padding: "8px",
                          margin: "8px",
                          display: "inline-block",
                          //   margin: "8px",
                          boxShadow: " 0px 0px 2px 1px rgba(0, 0, 0, 0.2)"
                        }}
                        className="bounceIn"
                        key={item.id}
                        captureInfo={item}
                        onClick={this.handleViewCapturePic}
                      />
                    );
                  })}

                {dataList.length === 0 && !loading && <Empty />}

                <Spin size="large" spinning={loading} />
              </div>

              <div className="more-page">
                {!(dataList.length === 0 && !loading) ? (
                  <Pagination
                    total={total}
                    showTotal={total => `总共 ${total} 个`}
                    pageSize={
                      type === "alarm" ? ALARM_PAGESIZE : CAPTURE_PAGESIZE
                    }
                    defaultCurrent={1}
                    current={page}
                    onChange={this.onChangePage}
                    // current={current}
                  />
                ) : (
                  ""
                )}
              </div>
            </div>
            {/* {type === 'alarm' && Object.keys(timeLineData).length > 0 && <TimeLineEvent captureParam={timeLineData} onClick={this.handleViewDetails} onClose ={this.handleCloseTimeLine} />} */}
            {/* {type === "alarm" && Object.keys(timeLineData).length > 0 && (
              <TimeLineEvent
                captureParam={timeLineData}
                onClose={this.handleCloseTimeLine}
              />
            )} */}

            <Drawer
              title="事件流"
              placement="right"
              closable={false}
              width={550}
              className="more-drawer-container"
              onClose={this.handleCloseTimeLine}
              visible={showTimeLine}
            >
              <TimeLineEvent
                captureParam={timeLineData}
                onClose={this.handleCloseTimeLine}
              />
            </Drawer>
          </div>
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
        </Content>
      </Layout>
    );
  }
}

export default ShowMorePanel;
