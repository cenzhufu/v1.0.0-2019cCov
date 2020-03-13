import * as React from "react";
import * as PropTypes from "prop-types";
import Swiper from "swiper/dist/js/swiper.js";
import "swiper/dist/css/swiper.min.css";
// import { Card, Skeleton } from "antd";
// import * as InfiniteScroll from "react-infinite-scroller";
import { guid } from "../../../utils/guid";
import VendorFaceItem from "../../../components/vendorFaceItem";
// import faceUrl from "./assets/images/face.png";
// import { Icon } from "antd";
// import faceUrl from "./assets/imgs/face.png";
// import ImgView from "components/imgView";
import "./assets/styles/vendorResultItem.scss";

class VendorResultItem extends React.Component {
  constructor(props) {
    super(props);
    this.swiperRef = React.createRef();
    this.swiper = null;
    this.state = {};
  }

  static defaultProps = {
    dataInfo: {},
    onClick: dataInfo => {},
    style: {},
    className: "",
  };
  static propTypes = {
    dataInfo: PropTypes.object.isRequired,
    onClick: PropTypes.func,
    style: PropTypes.object,
    className: PropTypes.string,
  };

  componentDidMount() {
    this._horizontalScrolling();
  }

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
        el: ".swiper-scrollbar",
      },
      dragSize: 30,
    });

    // swiper.scrollbar.$el.css("height", "18px");
    // swiper.scrollbar.$el.css("background", "#D1D1D1");
    // swiper.scrollbar.$el.css("border-radius", "7px");
    console.log("swiper.scrollbar", swiper.scrollbar);

    this.swiper = swiper;
  };

  handleClick = vendorFaceInfo => {
    // this.setState({ activedId: vendorFaceInfo.id });
    const { onClick } = this.props;
    if (onClick) {
      onClick(vendorFaceInfo);
    }
    // console.log("czf_vendorFaceInfo", vendorFaceInfo);
  };

  render() {
    const { dataInfo, style, className, activedId } = this.props;
    // const { activedId } = this.state;

    let list = [];
    if (dataInfo.resultList) {
      list = dataInfo.resultList;
    }
    return (
      <div
        style={style}
        className={`${className} vendor-result-item-container`}
      >
        <div className="vendor-result-item-title">
          <span>{dataInfo.name}</span>
          <span> {`(检索到 ${dataInfo.total} 条)`} </span>
        </div>
        <div
          className="swiper-container vendor-result-item-list"
          ref={this.swiperRef}
        >
          <div className="swiper-wrapper">
            {list.map((item, index) => {
              return (
                <VendorFaceItem
                  style={{ minWidth: "400px" }}
                  className="swiper-slide"
                  key={guid()}
                  index={index + 1}
                  vendorFaceInfo={item}
                  activedId={activedId}
                  onClick={this.handleClick}
                />
              );
            })}
          </div>
          <div className="swiper-scrollbar" />
        </div>
      </div>
    );
  }
}

export default VendorResultItem;
