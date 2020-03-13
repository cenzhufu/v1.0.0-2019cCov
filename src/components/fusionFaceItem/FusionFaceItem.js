import * as React from "react";
import * as PropTypes from "prop-types";
// import { Card, Skeleton } from "antd";
// import faceUrl from "./assets/imgs/face.jpg";
// import ImgView from "components/imgView";
import { guid } from "../../utils/guid";
import VendorFaceItem from "../vendorFaceItem";
import "./assets/styles/index.scss";

class FusionFaceItem extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  static defaultProps = {
    fusionFaceInfo: {},
    index: 1,
    onClick: fusionInfo => {},
  };

  static propTypes = {
    fusionFaceInfo: PropTypes.object.isRequired,
    index: PropTypes.number.isRequired,
    onClick: PropTypes.func,
  };

  handleClick = fusionInfo => {
    const { onClick } = this.props;
    if (onClick) {
      onClick(fusionInfo);
    }
  };

  render() {
    const { fusionFaceInfo, index, activedId } = this.props;
    let vendors = [];
    if (fusionFaceInfo) {
      vendors = fusionFaceInfo.vendors;
    }

    return (
      <VendorFaceItem
        onClick={this.handleClick}
        style={{
          width: "468px",
          // height: "272px",
          margin: "14px 14px 0 0",
        }}
        rightStyle={{ width: "71%" }}
        className="fusion-card-container"
        vendorFaceInfo={fusionFaceInfo}
        index={index + 1}
        activedId={activedId}
      >
        <div
          className="fusion-card-vendor-container"
          style={vendors.length > 0 ? {} : { display: "none" }}
        >
          {vendors.map((item, index) => {
            return (
              <div className="fusion-card-vendor-item" key={guid()}>
                <span className="fusion-card-vendor-item-name">
                  {item.name}
                </span>
                <span className="fusion-card-vendor-item-threshold">
                  {item.threshold}%
                </span>
              </div>
            );
          })}
        </div>
      </VendorFaceItem>
    );
  }
}

export default FusionFaceItem;
