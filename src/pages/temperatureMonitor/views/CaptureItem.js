import React, { Component } from "react";
import * as PropTypes from "prop-types";
// import moment from "moment";
import dayjs from "dayjs";
import "../assets/styles/captureItem.scss";
// import faceUrl from "../assets/images/face.png";
import tempImg from "../assets/images/temp.svg";
import timeImg from "../assets/images/time.svg";

export class CaptureItem extends Component {
  static defaultProps = {
    captureInfo: {},
    onClick: () => {},
    style: {},
    className: ""
  };

  static propsTypes = {
    captureInfo: PropTypes.object,
    onClick: PropTypes.func
  };

  handleView = () => {
    const { onClick, captureInfo } = this.props;
    if (onClick) {
      onClick(captureInfo);
    }
  };

  render() {
    const { captureInfo, style, className } = this.props;

    const mo = dayjs(captureInfo.time);
    const month = mo.month() + 1 < 10 ? `0${mo.month() + 1}` : mo.month() + 1; //此处月份从0开始，当前月要+1
    const date = mo.date() < 10 ? `0${mo.date()}` : mo.date();
    const hour = mo.hour(); //
    const minute = mo.minute() < 10 ? `0${mo.minute()}` : mo.minute();
    const time = `${month}/${date} ${hour}:${minute}`;

    // console.log("captureInfo_time", { t: captureInfo.time, time });
    return (
      <div
        onClick={this.handleView}
        style={style}
        className={`capture-item-container animated ${className}`}
      >
        <div className="capture-item-img">
          <img
            // src={`http://192.168.11.101${captureInfo.imageUrl}`}
            src={captureInfo.imageUrl}
            width="100px"
            height="100px"
            alt=""
          />
        </div>

        <div className="capture-item-temp">
          <img src={tempImg} alt="" />
          <span style={{ marginTop: "4px" }}> {captureInfo.degree} ℃</span>
        </div>
        <div className="capture-item-time">
          <img src={timeImg} alt="" />
          <span style={{ marginLeft: "4px" }}>{time}</span>
        </div>
        {/* <span className="capture-item-tamperture">{captureInfo.degree} ℃</span> */}
        {/* </div> */}
      </div>
    );
  }
}

export default CaptureItem;
