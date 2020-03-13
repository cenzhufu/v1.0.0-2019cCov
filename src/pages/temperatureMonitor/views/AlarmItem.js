import React, { Component } from "react";
import * as PropTypes from "prop-types";
// import moment from "moment";
import dayjs from "dayjs";
import * as intl from "react-intl-universal";
// import { Modal } from "antd";

import Confidence from "./Confidence";

// import timeImg from "../assets/images/time.svg";
// import locationImg from "../assets/images/location.svg";
import noComparedImg from "../assets//images/noCompared.svg";
import faceUrl from "../assets/images/face.png";
import "../assets/styles/alarmItem.scss";

export class AlarmItem extends Component {
  static defaultProps = {
    alarmInfo: {
      url: faceUrl,
      temperture: "37",
      time: "2020/02/23 19:33:90",
      address: "深圳科技生态原10栋"
    },
    onClickTimeLine: () => {},
    onClickDetai: () => {},
    // onClick: () => {},
    style: {},
    className: ""
  };

  static propsTypes = {
    alarmInfo: PropTypes.object,
    onClickTimeLine: PropTypes.func,
    onClickDetai: PropTypes.func
    // onClick: PropTypes.func
  };

  constructor(props) {
    super(props);

    this.state = {
      status: 1 // 0 ：未处理 1：已处理
    };
  }

  /**
   * 查看告警详情
   */
  handleViewDetails = () => {
    const { onClickDetai, alarmInfo } = this.props;
    if (onClickDetai) {
      let tempAlarm = true;
      switch (alarmInfo.tempAlarmFlag) {
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

      let haveMask = alarmInfo.haveMask;
      switch (alarmInfo.wearMask) {
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

      onClickDetai({ tempAlarm, haveMask, ...alarmInfo });
    }
    if (this.state.status) {
      this.setState({
        status: 0
      });
    }
  };

  /**
   * 查看事件流
   */
  handleViewTimeLine = e => {
    e.stopPropagation();
    e.cancelBubble = true;
    const { onClickTimeLine, alarmInfo } = this.props;
    if (onClickTimeLine) {
      let tempAlarm = true;
      switch (alarmInfo.tempAlarmFlag) {
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

      let haveMask = alarmInfo.haveMask;
      switch (alarmInfo.wearMask) {
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

      onClickTimeLine({ tempAlarm, haveMask, ...alarmInfo });
    }
  };

  render() {
    const { alarmInfo, style, className } = this.props;
    const { status } = this.state;

    let haveMask = true;
    switch (alarmInfo.wearMask) {
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
    switch (alarmInfo.tempAlarmFlag) {
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

    let isCompared = true; //是否比中

    if (!alarmInfo.personName) {
      isCompared = false;
    }
    const mo = dayjs(alarmInfo.alarmTime);
    const month = mo.month() + 1 < 10 ? `0${mo.month() + 1}` : mo.month() + 1; //此处月份从0开始，当前月要+1
    const date = mo.date() < 10 ? `0${mo.date()}` : mo.date();
    const hour = mo.hour(); //
    const minute = mo.minute() < 10 ? `0${mo.minute()}` : mo.minute();
    const time = `${month}/${date} ${hour}:${minute}`;

    return (
      <div
        onClick={this.handleViewDetails}
        style={style}
        className={`alarm-item-container animated ${className}`}
      >
        {status === 1 && <span className="alarm-item-dot" />}

        <div className="alarm-item-header">
          {tempAlarm ? (
            <span className="alarm-item-temperture">{alarmInfo.degree} ℃</span>
          ) : (
            <span className="alarm-item-temperture-no">
              {alarmInfo.degree} ℃
            </span>
          )}

          {!haveMask && (
            <span className="alarm-item-no-mask">
              {intl.get("d").d("未戴口罩")}
            </span>
          )}
        </div>

        <div className="alarm-info-container">
          <div className="alarm-info-img">
            <div
              // onClick={this.handleViewDetails}
              style={{ width: "100px", height: "100px", cursor: "pointer" }}
            >
              <img
                // src={`http://192.168.8.235${alarmInfo.imageUrl}`}
                src={alarmInfo.imageUrl}
                width="100px"
                height="100px"
                alt=""
              />
            </div>

            {/* <p className="alarm-img-time" title={time}>
              {time}
            </p> */}
          </div>

          <div className="alarm-info-img" style={{ margin: "0 8px 0 16px" }}>
            <div
              onClick={this.handleViewTimeLine}
              style={
                isCompared
                  ? { width: "100px", height: "100px", cursor: "pointer" }
                  : {
                      width: "100%",
                      height: "100px",
                      lineHeight: "100px",
                      textAlign: "center",
                      background: "#F1F2F3",
                      cursor: "pointer"
                    }
              }
            >
              {isCompared ? (
                <img
                  // src={`http://192.168.11.101${alarmInfo.imageUrl}`}
                  src={alarmInfo.photoData}
                  width="100px"
                  height="100px"
                  alt=""
                />
              ) : (
                <img src={noComparedImg} width="50px" height="50px" alt="" />
              )}
            </div>

            {/* <p className="alarm-img-location" title={alarmInfo.address}>
              {alarmInfo.address}
            </p> */}
          </div>

          <div className="alarm-info">
            <span className="alarm-person-name" title={alarmInfo.personName}>
              {alarmInfo.personName}
            </span>
            <span className="alarm-bamk-name" title={alarmInfo.bankName}>
              {isCompared && alarmInfo.bankName}
            </span>

            <Confidence
              thresould={alarmInfo.confidence}
              isCompared={isCompared}
            />
          </div>
        </div>

        <div className="alarm-footer">
          <span className="alarm-img-time" title={time}>
            {time}
          </span>

          <span className="alarm-img-location" title={alarmInfo.address}>
            {alarmInfo.address}
          </span>
        </div>
      </div>
    );
  }
}

export default AlarmItem;
