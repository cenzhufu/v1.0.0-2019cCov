import React, { PureComponent } from "react";
import * as intl from "react-intl-universal";
import "../assets/styles/confidence.scss";

class Confidence extends PureComponent {
  static defaultProps = {
    thresould: 0,
    isCompared: true,
    wraperClassName: "",
    borderClassName: ""
  };

  render() {
    const {
      // thresould,
      isCompared,
      wraperClassName,
      borderClassName
    } = this.props;

    // const thresould = (this.props.thresould * 100).toFixed();
    const thresould = String(this.props.thresould * 100).substring(0, 2);
    // console.log('相似度', { thresould, a: this.props.thresould })
    return (
      <div className={`confidence-container ${wraperClassName}`}>
        <div
          // className="confidence-border"
          className={
            isCompared
              ? `confidence-border ${borderClassName}`
              : `confidence-border no-compared ${borderClassName}`
          }
        // style={!isCompared && { lineHeight: "51px" }}
        >
          {isCompared ? (
            <>
              <span className="confidence-title">相似度</span>
              <span className="confidence">{thresould}%</span>
            </>
          ) : (
              <span className="confidence">{intl.get("s").d("未比中")}</span>
            )}
        </div>
      </div>
    );
  }
}

export default Confidence;
