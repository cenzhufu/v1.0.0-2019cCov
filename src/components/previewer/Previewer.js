import * as React from "react";
import { Button, Icon } from "antd";
import * as PropTypes from "prop-types";
import Cropper from "cropperjs";
import * as intl from "react-intl-universal";
import ImgView from "../imgView";
import "cropperjs/dist/cropper.css";
import "./assets/styles/index.scss";
// NOTE: storybook非要这么些，少了还不行
// require('cropperjs/dist/cropper.css');

class Previewer extends React.Component {
  static propTypes = {
    visible: PropTypes.bool,
    imgFileInfo: PropTypes.object,
  };

  static defaultProps = {
    visible: false,
    imgFileInfo: {},
    onSearch: formData => {},
    onClose: bol => {},
  };

  constructor(props) {
    super(props);
    this._cropper = null;
    this.imageRef = React.createRef();
    this.state = {
      visible: false,
      cropped: false,
    };
  }

  componentWillReceiveProps(nextProps) {
    const { visible } = nextProps;
    if (visible !== this.state.visible) {
      this.setState({
        visible,
      });
    }
  }

  componentWillUnmount() {
    this.handleCloseCropper();
  }

  /**
   * 初始化 裁剪框
   */
  _initCropper = () => {
    const image = this.imageRef.current;
    if (image) {
      this._cropper = new Cropper(image, {
        minContainerWidth: 600,
        minContainerHeight: 400,
        autoCropArea: 0.3,
        viewMode: 1,
        dragMode: "move",
        background: false,
      });
    }
  };

  /**
   * 打开裁剪框
   */
  handleOpenCropper = () => {
    const { cropped } = this.state;
    if (!cropped) {
      this.setState(
        {
          cropped: true,
        },
        () => {
          if (!this._cropper) {
            this._initCropper();
          }
        }
      );
    }
  };

  /**
   * 关闭裁剪框
   *
   * @memberof Previewer
   */
  handleCloseCropper = () => {
    this.setState(
      {
        cropped: false,
      },
      () => {
        if (this._cropper) {
          this._cropper.destroy();
          this._cropper = null;
        }
      }
    );
  };

  /**
   * 裁剪
   */
  handleCropper = () => {
    if (this._cropper) {
      const result = this._cropper.getCroppedCanvas();
      if (result) {
        result.toBlob(blob => {
          const formData = new FormData();
          formData.append("file", blob);
          console.log("---裁剪原图----", { result, blob });
          const { onSearch } = this.props;
          if (onSearch) {
            onSearch({
              formData,
              imgFile: "",
            });
          }
        });
      }
      this.handleCloseCropper();
    }
  };

  handleClose = () => {
    const { onClose } = this.props;
    if (onClose) {
      onClose(true);
    }
    if (this._cropper) {
      this._cropper.destroy();
      this._cropper = null;
    }
    this.setState({
      visible: false,
      cropped: false,
    });
  };

  /**
   * 点击搜索单张人脸
   * @param {*} faceInfo
   */
  handleClickFaceItem = faceInfo => {
    const { onSearch } = this.props;
    this.setState({
      visible: false,
    });
    if (onSearch) {
      onSearch({
        formData: null,
        imgFile: faceInfo,
      });
    }
  };

  render() {
    const { visible, cropped } = this.state;
    const { imgFileInfo } = this.props;
    const { faceVos } = imgFileInfo;
    let faces = [];
    if (faceVos) {
      faces = faceVos;
    }

    return (
      <div className={visible ? "previewer-container" : "display-none"}>
        <div className="preciewer-mask" />
        <div className="previewer-content">
          {/* <div className="previewer-header">头部</div> */}
          <div className="preciewer-body">
            <div className="previewer-content-left">
              <div className="previewer-content-header">
                <span className="previewer-content-header-title">
                  {intl.get("VIEW_IMAGE").d("查看图片")}
                </span>
                <Icon
                  type="close"
                  theme="outlined"
                  className="previewer-content-header-close-icon"
                  onClick={this.handleClose}
                />
              </div>
              <div className="previewer-content-body">
                <div className="previewer-img">
                  <img
                    ref={this.imageRef}
                    draggable={false}
                    height="100%"
                    width="100%"
                    src={
                      // 防止空字符串导致页面重新加载
                      imgFileInfo.imageUri
                        ? imgFileInfo.imageUri
                        : "about:blank"
                    }
                    // onLoad={this.onLoad}
                    // onError={this.onError}
                    alt="图片加载失败"
                  />
                </div>
                {/* {this.props.children} */}
              </div>
              <div className="previewer-content-footer">
                <div
                  className="previewer-content-footer-cropper"
                  title={intl.get("ss").d("裁剪")}
                  onClick={this.handleOpenCropper}
                >
                  <i
                    className={
                      cropped
                        ? "cropper-icon cropper-active-icon "
                        : "cropper-icon"
                    }
                  />
                </div>
                <div
                  className={
                    cropped
                      ? "previewer-content-footer-buttons"
                      : "display-none"
                  }
                >
                  <Button
                    type="primary"
                    ghost
                    onClick={this.handleCloseCropper}
                  >
                    {intl.get("s").d("取消")}{" "}
                  </Button>
                  <Button
                    style={{ marginLeft: "10px" }}
                    type="primary"
                    onClick={this.handleCropper}
                  >
                    {intl.get("s").d("完成")}
                  </Button>
                </div>
              </div>
            </div>
            <div className="previewer-content-right">
              <div className="previewer-content-right-header">
                <span className="previewer-content-right-header-title">
                  {intl.get("VIEW_IMAGE").d("可快速搜索目标")}
                </span>
              </div>
              <div className="previewer-content-right-body">
                {faces.length > 0 &&
                  faces.map((item, index) => {
                    return (
                      <div
                        onClick={this.handleClickFaceItem.bind(this, item)}
                        key={item.faceId}
                        className="right-body-face-item"
                      >
                        <ImgView
                          src={item.faceUrl ? item.faceUrl : "about:blank"}
                        />
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </div>
      // </Modal>
    );
  }
}

export default Previewer;
