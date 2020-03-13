import * as React from "react";
import * as PropTypes from "prop-types";
import { Card, Skeleton } from "antd";
// import faceUrl from "./assets/imgs/face.png";
import ImgView from "../imgView";
import "./assets/styles/index.scss";

// const { Meta } = Card;

class VendorFaceItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static defaultProps = {
    vendorFaceInfo: {},
    index: 0,
    onClick: vendorInfo => {},
    style: {},
    rightStyle: {},
    activedId: "",
    className: "",
  };
  static propTypes = {
    vendorFaceInfo: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    style: PropTypes.object,
    rightStyle: PropTypes.object,
    className: PropTypes.string,
    onClick: PropTypes.func,
    activedId: PropTypes.string,
  };

  handleClick = vendorFaceInfo => {
    // console.log("czf_vendorFaceInfo", vendorFaceInfo);
    const { onClick } = this.props;
    if (onClick) {
      onClick(vendorFaceInfo);
    }
  };

  render() {
    const {
      vendorFaceInfo,
      index,
      style,
      rightStyle,
      // hoverable,
      className,
      activedId,
    } = this.props;

    console.log("activedId", activedId);

    return (
      <Card
        style={style}
        className={
          activedId && activedId === vendorFaceInfo.id
            ? `${className} vendor-card-container active`
            : `${className} vendor-card-container `
        }
        // hoverable={hoverable}
        onClick={this.handleClick.bind(this, vendorFaceInfo)}
      >
        <Skeleton loading={vendorFaceInfo ? false : true} avatar active />
        {vendorFaceInfo ? (
          <div className="vendor-card-top">
            <ImgView src={vendorFaceInfo ? vendorFaceInfo.imgUrl : ""} />
            <div className="vendor-card-description" style={rightStyle}>
              <div
                className={
                  index < 4 ? "vendor-card-order-blue" : "vendor-card-order"
                }
              >
                {index}
              </div>
              <div className="vendor-card-name"> {vendorFaceInfo.name}</div>
              <div className="vendor-card-number">
                {vendorFaceInfo.idNumber}
              </div>
              <div className="vendor-card-bank-wrapewr">
                <span
                  title={vendorFaceInfo.bankName}
                  className="vendor-card-bank-name"
                >
                  {vendorFaceInfo.bankName}
                </span>
                <span className="vendor-card-threshold">
                  {`${vendorFaceInfo.threshold} %`}
                </span>
              </div>
            </div>
          </div>
        ) : null}
        {this.props.children && this.props.children}
      </Card>
    );
  }
}

export default VendorFaceItem;
