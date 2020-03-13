import * as React from "react";
import * as PropTypes from "prop-types";
import "./assets/styles/index.scss";

class ImgView extends React.Component {
  static defaultProps = {
    src: "",
    style: {},
    className: ""
  };
  static propTypes = {
    src: PropTypes.string.isRequired,
    style: PropTypes.object,
    className: PropTypes.string
  };

  render() {
    const { style, className, src } = this.props;
    return (
      <div style={style} className={`${className} img-container`}>
        <img width="100%" src={src} alt="图片加载失败" />
      </div>
    );
  }
}

export default ImgView;
