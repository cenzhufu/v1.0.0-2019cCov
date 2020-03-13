import React, { Component } from "react";
import {
  DatePicker,
  Button,
  Switch,
  Layout,
  Modal,
  Input,
  Select,
  message
} from "antd";
import * as intl from "react-intl-universal";
// import moment from "moment";
import dayjs from "dayjs";
import Confidence from "./Confidence";
import zoomUrl from "../assets/images/zoom.svg";
import "../assets/styles/previewDetail.scss";

export class PreviewDetail extends Component {
  static defaultProps = {
    visible: false,
    data: {},
    onClose: () => {}
  };

  constructor(props) {
    super(props);

    this.state = {
      viewPicVisible: false
    };
  }

  /**
   * 关闭预览
   */
  handleCancel = () => {
    const { onClose } = this.props;
    if (onClose) {
      onClose();
    }
  };

  /**
   * 查看大图
   */
  handleViewBigPic = () => {
    this.setState({
      viewPicVisible: true
    });
  };

  /**
   * 关闭查看大图
   */
  handleCloseViewPic = () => {
    this.setState({
      viewPicVisible: false
    });
  };

  render() {
    const { visible, data } = this.props;
    const { viewPicVisible } = this.state;
    let isCompared = true;

    if (!data.personName) {
      isCompared = false;
    }

    return (
      <div className="preview-container">
        <Modal
          title={intl.get("d").d("告警详情")}
          visible={visible}
          footer={null}
          width={isCompared ? 792 : 698}
          centered={true}
          maskClosable={false}
          onCancel={this.handleCancel}
          wrapClassName={
            data.tempAlarm
              ? "modal-container temp-modal"
              : "modal-container no-temp-modal"
          }
        >
          <div className="alarm-info-container">
            <div className="alarm-background">
              <img
                // src={`http://192.168.8.235${data.bigImageUrl}`}
                src={data.bigImageUrl}
                height="100%"
                alt=""
              />
              <div className="alarm-hover alarm-active">
                <div
                  onClick={this.handleViewBigPic}
                  className="alaarm-hover-item alaarm-hover-item-video"
                >
                  <img src={zoomUrl} alt="" />
                  <span> {intl.get("d").d("查看大图")} </span>
                </div>
              </div>
            </div>

            <div className={isCompared ? "alarm-info-compared" : "alarm-info"}>
              <div className={isCompared ? "alarm-img-wraper" : ""}>
                <div className="alarm-img-temp">
                  <div className="alarm-img">
                    <img
                      src={data.imageUrl}
                      width="100px"
                      height="100px"
                      alt=""
                    />
                  </div>
                  <div
                    className={
                      data.tempAlarm
                        ? "temperture alarm-temperture"
                        : "temperture no-alarm-temperture"
                    }
                  >
                    <span> {intl.get("d").d("体温")}： </span>
                    <span> {data.degree}℃ </span>
                  </div>

                  {!data.haveMask && (
                    <div className="alarm-mask">
                      {intl.get("d").d("未戴口罩")}
                    </div>
                  )}
                </div>

                {data.personName && (
                  <>
                    <Confidence
                      thresould={data.confidence}
                      isCompared={isCompared}
                      wraperClassName={
                        data.tempAlarm ? "wraper-cls-temp" : "wraper-cls"
                      }
                      borderClassName={data.tempAlarm ? "border-cls-temp" : ""}
                    />

                    <div className="alarm-img-name">
                      <div className="alarm-img">
                        <img
                          src={data.photoData}
                          width="100px"
                          height="100px"
                          alt=""
                        />
                      </div>
                      <div
                        className={
                          data.tempAlarm
                            ? "alarm-person-name alarm-temp"
                            : "alarm-person-name "
                        }
                      >
                        {data.personName}
                      </div>
                      <div
                        className={
                          data.tempAlarm
                            ? "alarm-bank-name alarm-temp"
                            : "alarm-bank-name"
                        }
                      >
                        {data.bankName}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div
                className={
                  data.tempAlarm ? "alarm-time  alarm-temp" : "alarm-time"
                }
              >
                <span> {intl.get("d").d("时间")}： </span>
                <span> {data.alarmTime} </span>
              </div>
              <div
                className={
                  data.tempAlarm ? "alarm-address alarm-temp" : "alarm-address"
                }
              >
                <span> {intl.get("d").d("地点")}： </span>
                <span> {data.address} </span>
              </div>
            </div>
          </div>
        </Modal>
        <Modal
          title=""
          visible={viewPicVisible}
          footer={null}
          width={800}
          //   onOk={this.handleOk}
          centered={true}
          maskClosable={false}
          onCancel={this.handleCloseViewPic}
          wrapClassName="big-pic-modal-container"
          bodyStyle={{
            padding: "0"
          }}
          //   style={{ backgroundColor: "#993844" }}
        >
          <div className="big-pic-container">
            <img src={data.bigImageUrl} height="100%" alt="" />
          </div>
        </Modal>
      </div>
    );
  }
}

export default PreviewDetail;
