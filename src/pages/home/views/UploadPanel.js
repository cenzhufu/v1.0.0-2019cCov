import * as React from "react";
import * as intl from "react-intl-universal";
import "./assets/styles/uploadPanel.scss";
import searchImg from "./assets/images/search.png";
import * as PropTypes from "prop-types";
import searchbtn from "./assets/images/searchBtn.png";
import { message, Popover } from "antd";
// import config from "config";

import Previewer from "../../../components/previewer";
import api from "../../../utils/api";
import request from "../../../utils/request";

const IMG_ACCEPTt = window.config.acceptImageType;
const ERROR_TIP = intl.get("dd").d("系统异常，请稍后再试");
class UploadPanel extends React.Component {
  constructor(props) {
    super(props);
    this.inputRef = React.createRef();
    this.state = {
      uploaded: false,
      searchFile: {},
      loading: false,
      showCropper: false,
      imgFileInfo: {},
    };
  }

  static defaultProps = {
    // handleClickUpload: imgFile => {},
    onUploading: imgFile => {},
    onUploaded: onUploaded => {},
    onUploadErro: onUploadErro => {},
    onCropper: files => {},
  };

  static propTypes = {
    // handleClickUpload: PropTypes.func,
    onUploading: PropTypes.func,
    onUploaded: PropTypes.func,
    onUploadErro: PropTypes.func,
    onCropper: PropTypes.func,
  };

  /**
   * 点击上传
   * @memberof UploadPanel
   */
  handleClickUpload = e => {
    e.stopPropagation();
    this.inputRef.current.click();
  };

  onChangeUpload = e => {
    e.preventDefault();
    e.stopPropagation();
    const FileList = e.target.files;
    console.log("文件", FileList);
    if (FileList.length === 0) {
      return;
    }

    if (!IMG_ACCEPTt.includes(FileList[0].type)) {
      message.warning(intl.get("ss").d(`只支持上传 ${IMG_ACCEPTt} 的类型图片`));
      this.inputRef.current.value = ""; //清空file
      return;
    }

    const { onUploading } = this.props;
    if (onUploading) {
      onUploading(true);
    }
    let formData = new FormData();
    formData.append("file", FileList[0]);
    this._uploadSelectedFile(formData);
  };

  _uploadSelectedFile = (formData, isCropper = false) => {
    const { onUploadErro } = this.props;
    request
      .post(api.uploadFile, formData)
      .then(res => {
        const resData = res.data;
        const { data } = resData;
        if (resData.code === 0) {
          //上传成功
          this._uploadSuccesed(data, isCropper);
        } else {
          if (resData.code === 500) {
            message.error(resData.message);
          }

          if (onUploadErro) {
            onUploadErro(true);
          }
        }
      })
      .catch(error => {
        if (onUploadErro) {
          onUploadErro(true);
        }
        message.error(ERROR_TIP);
      });
  };

  _uploadSuccesed = (fileDatas, isCropper = false) => {
    const { faceCount, faceVos } = fileDatas;
    const { onUploaded } = this.props;
    this.inputRef.current.value = ""; //清空file
    //只要一张人脸
    if (faceCount === 1) {
      const searchFile = {
        faceUrl: faceVos[0].faceUrl,
        faceId: faceVos[0].faceId,
      };

      this.setState({
        searchFile,
      });

      if (onUploaded) {
        onUploaded(searchFile);
      }
    } else {
      //判断是否是本地上传还是裁剪上传
      if (isCropper) {
        const { onUploadErro } = this.props;
        message.warning(
          intl.get("f").d("裁剪的图片没有人脸或人脸多余一张，请重新上传")
        );

        if (onUploadErro) {
          onUploadErro(true);
        }

        this.setState({
          showCropper: false,
          imgFileInfo: {},
        });
        return;
      } else {
        //本地上传
        this.setState({
          showCropper: true,
          imgFileInfo: fileDatas,
        });
      }
    }
  };

  /**
   * 裁剪确定
   * @param {*} fileInfo
   */
  handleSearchFace = fileInfo => {
    const { onCropper } = this.props;
    const { formData, imgFile } = fileInfo;
    console.log("裁剪", fileInfo);

    if (imgFile && onCropper) {
      //点击人脸图片搜索
      onCropper(imgFile);
      this.inputRef.current.value = ""; //清空file
      this.setState({
        searchFile: imgFile,
        imgFileInfo: {},
        showCropper: false,
      });
    }

    if (formData) {
      //裁剪搜索
      this._uploadSelectedFile(formData, true);
      this.setState({
        imgFileInfo: {},
        showCropper: false,
      });
      console.log("裁剪", fileInfo);
    }
  };

  handleOnClose = close => {
    const { onUploadErro } = this.props;
    if (close) {
      this.inputRef.current.value = ""; //清空file
      this.setState({
        imgFileInfo: {},
        showCropper: false,
      });
      if (onUploadErro) {
        onUploadErro(true);
      }
    }
  };

  render() {
    const { searchFile, showCropper, imgFileInfo } = this.state;
    // const {imgUrl} = searchFile;
    let imgUrl = "";
    if (searchFile.faceUrl) {
      imgUrl = searchFile.faceUrl;
    }

    return (
      <div className="upload-panel-container">
        <div className="upload-panel-title-wrap">
          <img src={searchImg} alt="" width="14px" height="15px" />
          <span className="upload-panel-title">
            {intl.get("d").d("身份核查检索")}
          </span>
        </div>

        <div className="upload-panel-operate">
          {imgUrl ? (
            <Popover
              placement="rightTop"
              trigger="hover"
              content={
                <div className="hover-img-container">
                  <img height="100%" src={imgUrl} alt="" />
                </div>
              }
            >
              <div className="upload-panel-img search-img">
                <img src={imgUrl} width="100%" alt="图片加载失败" />
              </div>
            </Popover>
          ) : (
            <div className="upload-panel-img" onClick={this.handleClickUpload}>
              <img src={searchbtn} alt="" />
            </div>
          )}
          <div className="upload-panel-txt" onClick={this.handleClickUpload}>
            {imgUrl
              ? intl.get("ss").d("重新上传")
              : intl.get("dd").d("上传图片")}
          </div>
          <input
            type="file"
            hidden
            ref={this.inputRef}
            onChange={this.onChangeUpload}
          />
        </div>
        <Previewer
          imgFileInfo={imgFileInfo}
          visible={showCropper}
          onSearch={this.handleSearchFace}
          onClose={this.handleOnClose}
        />
      </div>
    );
  }
}

export default UploadPanel;
