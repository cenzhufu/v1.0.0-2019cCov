import React, { Component } from "react";
import {
  DatePicker,
  Button,
  // Switch,
  // Layout,
  // Modal,
  // Input,
  Select,
  message
} from "antd";
import * as intl from "react-intl-universal";
import moment from "moment";
// import moment from "moment";
// import dayjs from "dayjs";
import api from "../../../utils/api";
import request from "../../../utils/request.js";

import "../assets/styles/exportModal.scss";

const { RangePicker } = DatePicker;
const { Option } = Select;
const ERROR_TIP = intl.get("dd").d("系统异常，请稍后再试");

export class ExportModal extends Component {
  static defaultProps = {
    cameras: [],
    className: "",
    visible: false
  };
  constructor(props) {
    super(props);

    this.exportKey = "";
    this.exportTimer = null;

    this.state = {
      visible: props.visible,
      // showExportModal: false,
      // currentTime: dayjs().format("YYYY-MM-DD HH:mm:ss"),
      exportPercent: 0,
      isExporteing: false,
      exported: false,

      cameraIds: null,
      startDate: moment(),
      endDate: moment(),
      fileInfo: {}
    };
  }

  // componentWillReceiveProps(nextProps) {
  // const { visible } = nextProps;
  // if (visible && visible !== this.state.visible) {
  //   this.setState({
  //     visible
  //   });
  // }
  // }

  hanleCloseModal = e => {
    e.stopPropagation();
    e.cancelBubble = true;
    // this.setState({
    //   visible: false
    // });

    const { cancel } = this.props;
    if (cancel) {
      cancel();
    }
  };

  /**
   * 日期选择
   * @param {*} date
   * @param {*} dateString
   */
  handleChangeDate = (date, dateString) => {
    if (
      moment(date[1])
        .endOf("day")
        .subtract(30, "days") >= moment(date[0]).endOf("day")
    ) {
      message.warning("导出时间跨度最长为30天");
      return;
    }
    console.log("选中日期", { date, dateString });
    this.setState({
      startDate: date[0],
      endDate: date[1]
    });
  };

  /**
   * 摄像头选择
   * @param {*} cameras
   */
  hanldeChangeCamera = cameras => {
    console.log("选中摄像头", cameras);
    this.setState({
      cameraIds: cameras
    });
  };

  /**
   * 取消导出
   */
  handleCancelExport = () => {
    this.hanleCloseModal();
  };

  /**
   * 确定导出
   */
  handleOkExport = () => {
    const { cameraIds, startDate, endDate } = this.state;
    this.exportKey = Math.ceil(Math.random() * 10000);
    // .substr(0, 4);
    if (!startDate || !endDate) {
      message.warning(intl.get("sd").d("请选择日期"));
      return;
    }
    request({
      url: api.getExport,
      method: "post",
      data: {
        urlParams: {
          id: this.exportKey
        },
        sourceIdList:
          cameraIds || this.props.currentCameras.map(camera => camera.devId),
        startTime: startDate.format("YYYY-MM-DD"),
        endTime: endDate.format("YYYY-MM-DD")
      }
    })
      .then(res => {
        console.log("导出", res);
        if (res.errCode === 0) {
          if (res.data.totalSize === "0") {
            message.warning("无采集数据可导出");
            return;
          }

          this.setState({
            fileInfo: {
              fileName: moment().format("YYYY-MM-DD HH:mm:ss"),
              fileSize: Number(res.data.totalSize),
              groupName: res.data.detailMap.groupName
            },
            isExporteing: true,
            exported: false
          });
          this._getExportProgress();
        }
      })
      .catch(error => {
        message.error(ERROR_TIP);
        console.error(error);
      });
  };

  /**
   * 进度条获取
   */
  _getExportProgress = () => {
    const url = `/api/intellif/temperature/alarm/progress/${this.state.fileInfo.groupName}/${this.exportKey}`;
    request({
      url,
      method: "get"
    })
      .then(res => {
        console.log("导出进度", res);
        if (res.errCode === 0) {
          const exportPercent = (
            (Number(res.data.successNum) / this.state.fileInfo.fileSize) *
            100
          ).toFixed(1);

          this.setState({
            exportPercent
          });

          if (exportPercent < 100) {
            this.exportTimer = setTimeout(() => {
              this._getExportProgress();
            }, 1000);
          } else {
            clearTimeout(this.exportTimer);
            this.exportTimer = null;

            this.setState({
              isExporteing: false,
              exported: true,
              downloadUrl: res.data.detailMap.fileUrl
            });
          }
        } else {
          message.error("下载出错");
        }
      })
      .catch(error => {
        message.error(ERROR_TIP);
        console.error(error);
      });
  };

  render() {
    const {
      downloadUrl,
      // currentTime,
      exportPercent,
      isExporteing,
      exported,
      fileInfo,
      cameraIds,
      startDate,
      endDate
      // visible
    } = this.state;
    const { cameras, className, visible, currentCameras } = this.props;

    console.log("czf_visible", visible);
    return (
      <div
        style={!visible ? { display: "none" } : {}}
        className={`export-container ${className} `}
      >
        <div className="export-config">
          <div onClick={this.hanleCloseModal} className="export-close"></div>
          <span className="export-title">
            {intl.get("d").d("体温监测采集导出")}
          </span>
          <div className="export-config-item">
            <span className="export-label">
              {intl.get("d").d("选择日期")} :
            </span>
            <RangePicker
              value={[startDate, endDate]}
              style={{ width: 350 }}
              onChange={this.handleChangeDate}
              disabledDate={current => current > moment().endOf("day")}
            />
          </div>

          <div className="export-config-item">
            <span className="export-label">{intl.get("d").d("摄像头")} :</span>
            <Select
              mode="multiple"
              //   maxTagCount={4}
              //   value={currentCameras.map(item => {
              //     return item.devId;
              //   })}
              value={cameraIds || currentCameras.map(camera => camera.devId)}
              showArrow={true}
              placeholder="请选择摄像头"
              style={{ width: 350 }}
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
          <div className="export-config-opration">
            <div className="export-progress">
              {isExporteing && !exported && (
                <>
                  <span>{fileInfo.fileName}</span>
                  <span> 正在导出,&nbsp; </span>
                  <span>{exportPercent} %</span>
                </>
              )}
              {exported && (
                <a href={downloadUrl}>
                  <>
                    <span>{fileInfo.fileName}</span>
                    <span> 导出成功,点击下载</span>
                  </>
                </a>
              )}
            </div>

            <div className="export-opt">
              <Button
                onClick={this.hanleCloseModal}
                style={{ marginRight: "12px" }}
              >
                {intl.get("d").d("取消")}
              </Button>
              <Button
                disabled={isExporteing}
                onClick={this.handleOkExport}
                type="primary"
              >
                {intl.get("d").d("导出")}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default ExportModal;
