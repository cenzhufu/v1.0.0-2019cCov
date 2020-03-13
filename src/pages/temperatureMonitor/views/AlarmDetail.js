import React, { Component } from "react";
// import * as PropTypes from "prop-types";
// import moment from "moment";
import * as intl from "react-intl-universal";
import { Icon } from "antd";
// import { Modal } from "antd";

import Confidence from "./Confidence";

// import timeImg from "../assets/images/time.svg";
// import locationImg from "../assets/images/location.svg";
// import noComparedImg from "../assets//images/noCompared.svg";
// import faceUrl from "../assets/images/face.png";
// import "../assets/styles/alarmItem.scss";
import "../assets/styles/alarmDetail.scss";

// import zoomUrl from "../assets/images/zoom.svg";
// import playUrl from "../assets/images/play.svg";

export class AlarmItem extends Component {
  static defaultProps = {
    alarmInfo: {},
    visible: false,
    onClick: () => {}
  };

  render() {
    const { alarmItemInfo, visible, onClose } = this.props;
    let isCompared = true;
    if (!alarmItemInfo.personName) {
      isCompared = false;
    }

    console.log("isCompared", { isCompared, alarmItemInfo });

    return (
      <div
        className="position-container animated bounceInDown"
        style={!visible ? { display: "none" } : {}}
      >
        <div
          className={
            alarmItemInfo.tempAlarm
              ? "alarm-info-container temp-container"
              : "alarm-info-container no-temp-container"
          }
          style={isCompared ? { width: "792px" } : { width: "698px" }}
          //   "alarm-info-container"
        >
          <div
            className="alarm-header"
            style={
              alarmItemInfo.tempAlarm
                ? {}
                : {
                    borderBottom: "1px solid #e8e8e8",
                    color: "black"
                  }
            }
          >
            <span>告警详情</span>
            <Icon style={{cursor: 'pointer', color: alarmItemInfo.tempAlarm ? '#fff' : 'rgba(0, 0, 0, 0.75)'}} onClick={onClose} type="close" />
          </div>

          <div className="alarm-content">
            <div className="alarm-background">
              <img
                src={alarmItemInfo.imageUrl}
                //   src={`http://192.168.8.235${alarmItemInfo.bigImageUrl}`}
                height="100%"
                alt=""
              />
              {/* <img src={alarmItemInfo.bigImageUrl} height="100%" alt="" /> */}
              {/* <div className="alarm-hover alarm-active">
                <div
                  onClick={this.handleViewBigPic}
                  className="alaarm-hover-item alaarm-hover-item-video"
                >
                  <img src={zoomUrl} alt="" />
                  <span> {intl.get("d").d("查看大图")} </span>
                </div>
              </div> */}
            </div>

            <div className={isCompared ? "alarm-info-compared" : "alarm-info"}>
              <div className={isCompared ? "alarm-img-wraper" : ""}>
                <div className="alarm-img-temp">
                  <div className="alarm-img">
                    <img
                      // src={`http://192.168.8.235${alarmItemInfo.imageUrl}`}
                      src={alarmItemInfo.imageUrl}
                      width="100px"
                      height="100px"
                      alt=""
                    />
                  </div>
                  {/* <div className="alarm-top"> */}
                  <div
                    // className="alarm-temperture"
                    className={
                      alarmItemInfo.tempAlarm
                        ? "temperture alarm-temperture"
                        : "temperture no-alarm-temperture"
                    }
                  >
                    <span> {intl.get("d").d("体温")}： </span>
                    <span> {alarmItemInfo.degree}℃ </span>
                  </div>

                  {!alarmItemInfo.haveMask && (
                    <div className="alarm-mask">
                      {intl.get("d").d("未戴口罩")}
                    </div>
                  )}
                </div>

                {alarmItemInfo.personName && (
                  <>
                    <Confidence
                      thresould={alarmItemInfo.confidence}
                      isCompared={isCompared}
                      wraperClassName={
                        alarmItemInfo.tempAlarm
                          ? "wraper-cls-temp"
                          : "wraper-cls"
                      }
                      borderClassName={
                        alarmItemInfo.tempAlarm ? "border-cls-temp" : ""
                      }
                    />

                    <div className="alarm-img-name">
                      <div className="alarm-img">
                        <img
                          // src={`http://192.168.11.101${alarmItemInfo.photoData}`}
                          src={alarmItemInfo.photoData}
                          width="100px"
                          height="100px"
                          alt=""
                        />
                      </div>
                      <div
                        className={
                          alarmItemInfo.tempAlarm
                            ? "alarm-person-name alarm-temp"
                            : "alarm-person-name "
                        }
                      >
                        {alarmItemInfo.personName}
                      </div>
                      <div
                        className={
                          alarmItemInfo.tempAlarm
                            ? "alarm-bank-name alarm-temp"
                            : "alarm-bank-name"
                        }
                      >
                        {alarmItemInfo.bankName}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div
                className={
                  alarmItemInfo.tempAlarm
                    ? "alarm-time  alarm-temp"
                    : "alarm-time"
                }
              >
                <span> {intl.get("d").d("时间")}： </span>
                <span> {alarmItemInfo.alarmTime} </span>
              </div>
              <div
                className={
                  alarmItemInfo.tempAlarm
                    ? "alarm-address alarm-temp"
                    : "alarm-address"
                }
              >
                <span> {intl.get("d").d("地点")}： </span>
                <span> {alarmItemInfo.address} </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default AlarmItem;
