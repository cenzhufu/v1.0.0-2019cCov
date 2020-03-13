import React, { Component } from "react";
// import { message } from "antd";
import { isEqual } from "lodash";
// import { message } from "antd";
export class RealtimeVideo extends Component {
  state = {
    containerStyle: {}
  };
  componentWillMount() {
    window.document.hkServer = window.config.environments.hkServer;
    window.document.browserType = window.browserType;
  }

  // shouldComponentUpdate(nextprops) {
  //   if (isEqual(nextprops.data, this.props.data)) {
  //     return false;
  //   } else {
  //     return true;
  //   }
  // }
  componentWillReceiveProps(nextprops) {
    // var video_width = document.getElementById("cctvContainer").offsetWidth;

    var scree_width = window.screen.width;
    // console.log("scree_width", { scree_width, nextprops });

    const { data } = nextprops;

    if (data.length <= 1) {
      //0和1个像头的时候
      if (scree_width >= 1920) {
        // 1920 X 1080
        window.document.el_style = { w: "750", h: "500" };
        if (window.browserType && window.browserType === "ie") {
          window.document.el_style = { w: "746", h: "496" };
        }
        this.setState({
          containerStyle: { width: "1530px", height: "500px" }
        });
      } else if (scree_width >= 1366) {
        // 1366 X 768
        window.document.el_style = { w: "483", h: "298" };
        this.setState({
          containerStyle: { width: "976px", height: "300px" }
        });
      }
    } else {
      //多个摄像头
      if (scree_width >= 1920) {
        // 1920 X 1080
        window.document.el_style = { w: "380", h: "248" };
        this.setState({
          containerStyle: { width: "758px", height: "250px" }
        });
      } else if (scree_width >= 1366) {
        // 1366 X 768
        window.document.el_style = { w: "242", h: "100" };
        this.setState({
          containerStyle: { width: "484px", height: "100px" }
        });
      }
    }

    if (!isEqual(data, this.props.data)) {
      this.video_render = true;
      this.cameras = data;
    } else {
      this.video_render = false;
      this.cameras = [];
    }
  }

  componentDidUpdate() {
    if (this.video_render) {
      // message.success("刷新视频流");
      setTimeout(() => {
        this._renderIframe();
      }, 1000);
    }
  }

  _renderIframe = () => {
    const len = this.cameras.length;

    // 刷新视频流iframe
    // console.log("刷", this.cameras);
    if (len === 1) {
      setTimeout(() => {
        // console.log("刷新1");
        // const video1_1 = document.getElementById("video1_1");
        // const video1_2 = document.getElementById("video1_2");

        // if (this.cameras[0] && this.cameras[0].modelType !== 3) {
        //   video1_1.src = "../hkWeb/cn/hkVideo1_2.html";
        //   video1_2.src = "../hkWeb/cn/hkVideo1_1.html";
        // }
        // if (this.cameras[0]) {
        //   if (this.cameras[0].modelType === 3) {
        //     video1_1.src = "../dhWeb/cn/dhVideo1_1.html";
        //     video1_2.src = "../dhWeb/cn/dhVideo1_2.html";
        //   } else {
        //     video1_1.src = "../hkWeb/cn/hkVideo1_1.html";
        //     video1_2.src = "../hkWeb/cn/hkVideo1_1.html";
        //   }
        // }

        document.getElementById("video1_1").contentWindow.location.reload(true);
        document.getElementById("video1_2").contentWindow.location.reload(true);
      }, 100);
    } else if (len > 1) {
      setTimeout(() => {
        // console.log("刷新1");
        // window.location.href='../hkWeb/cn/demo.html';
        document.getElementById("video1_1").contentWindow.location.reload(true);
        document.getElementById("video1_2").contentWindow.location.reload(true);
      }, 100);

      setTimeout(() => {
        // console.log("刷新2");
        document.getElementById("video2_1").contentWindow.location.reload(true);
        document.getElementById("video2_2").contentWindow.location.reload(true);
      }, 200);

      if (len === 3) {
        setTimeout(() => {
          document
            .getElementById("video3_1")
            .contentWindow.location.reload(true);
          document
            .getElementById("video3_2")
            .contentWindow.location.reload(true);
        }, 300);
      }

      if (len === 4) {
        setTimeout(() => {
          document
            .getElementById("video4_1")
            .contentWindow.location.reload(true);
          document
            .getElementById("video4_2")
            .contentWindow.location.reload(true);
        }, 400);
      }
    }
  };

  render() {
    const { isNone, data } = this.props;
    const style = isNone
      ? {
          display: "none",
          width: "100%",
          border: "0px",
          height: "100%"
          // border: "1px solid yellow"
        }
      : {
          width: "100%",
          border: "0px",
          height: "100%"
          // border: "1px solid yellow"
        };

    const { containerStyle } = this.state;

    const len = data.length;

    // console.log("render_刷新", data);

    return (
      <div
        className={
          len === 1 ? "cctv-one-container wrap" : "cctv-container wrap"
        }
        id="cctvContainer"
      >
        {/* <div className="item item1"></div>
        <div className="item item2"></div>
        <div className="item item3"></div>
        <div className="item item4"></div> */}

        {len > 1 && (
          <>
            <div className="realtime-capture-cctv" style={containerStyle}>
              {data[0] && data[0].modelType === 3 && (
                <>
                  <iframe
                    title="video1_1"
                    name="video1_1"
                    id="video1_1"
                    src="../dhWeb/cn/dhVideo1_1.html"
                    style={style}
                    scrolling="no"
                  />
                  <iframe
                    title="video1_2"
                    name="video1_2"
                    id="video1_2"
                    src="../dhWeb/cn/dhVideo1_2.html"
                    style={style}
                    scrolling="no"
                  />
                </>
              )}

              {data[0] && data[0].modelType !== 3 && (
                <>
                  <iframe
                    title="video1_1"
                    name="video1_1"
                    id="video1_1"
                    src="../hkWeb/cn/hkVideo1_1.html"
                    style={style}
                    scrolling="no"
                  />
                  <iframe
                    title="video1_2"
                    name="video1_2"
                    id="video1_2"
                    src="../hkWeb/cn/hkVideo1_2.html"
                    style={style}
                    scrolling="no"
                  />
                </>
              )}
            </div>

            <div className="realtime-capture-cctv" style={containerStyle}>
              {data[1] && data[1].modelType === 3 && (
                <>
                  <iframe
                    title="video2_1"
                    name="video2_1"
                    id="video2_1"
                    src="../dhWeb/cn/dhVideo2_1.html"
                    style={style}
                    scrolling="no"
                  />
                  <iframe
                    title="video2_2"
                    name="video2_2"
                    id="video2_2"
                    src="../dhWeb/cn/dhVideo2_2.html"
                    style={style}
                    scrolling="no"
                  />
                </>
              )}

              {data[1] && data[1].modelType !== 3 && (
                <>
                  <iframe
                    title="video2_1"
                    name="video2_1"
                    id="video2_1"
                    src="../hkWeb/cn/hkVideo2_1.html"
                    style={style}
                    scrolling="no"
                  />
                  <iframe
                    title="video2_2"
                    name="video2_2"
                    id="video2_2"
                    src="../hkWeb/cn/hkVideo2_2.html"
                    style={style}
                    scrolling="no"
                  />
                </>
              )}
            </div>

            <div className="realtime-capture-cctv" style={containerStyle}>
              {data[2] && data[2].modelType === 3 && (
                <>
                  <iframe
                    title="video3_1"
                    name="video3_1"
                    id="video3_1"
                    src="../dhWeb/cn/dhVideo3_1.html"
                    style={style}
                    scrolling="no"
                  />
                  <iframe
                    title="video3_2"
                    name="video3_2"
                    id="video3_2"
                    src="../dhWeb/cn/dhVideo3_2.html"
                    style={style}
                    scrolling="no"
                  />
                </>
              )}

              {data[2] && data[2].modelType !== 3 && (
                <>
                  <iframe
                    title="video3_1"
                    name="video3_1"
                    id="video3_1"
                    src="../hkWeb/cn/hkVideo3_1.html"
                    style={style}
                    scrolling="no"
                  />
                  <iframe
                    title="video3_2"
                    name="video3_2"
                    id="video3_2"
                    src="../hkWeb/cn/hkVideo3_2.html"
                    style={style}
                    scrolling="no"
                  />
                </>
              )}
            </div>

            <div className="realtime-capture-cctv" style={containerStyle}>
              {data[3] && data[3].modelType === 3 && (
                <>
                  <iframe
                    title="video4_1"
                    name="video4_1"
                    id="video4_1"
                    src="../dhWeb/cn/dhVideo4_1.html"
                    style={style}
                    scrolling="no"
                  />
                  <iframe
                    title="video4_2"
                    name="video4_2"
                    id="video4_2"
                    src="../dhWeb/cn/dhVideo4_2.html"
                    style={style}
                    scrolling="no"
                  />
                </>
              )}

              {data[3] && data[3].modelType !== 3 && (
                <>
                  <iframe
                    title="video4_1"
                    name="video4_1"
                    id="video4_1"
                    src="../hkWeb/cn/hkVideo4_1.html"
                    style={style}
                    scrolling="no"
                  />
                  <iframe
                    title="video4_2"
                    name="video4_2"
                    id="video4_2"
                    src="../hkWeb/cn/hkVideo4_2.html"
                    style={style}
                    scrolling="no"
                  />
                </>
              )}
            </div>
          </>
        )}

        {len <= 1 && (
          <div className="realtime-capture-cctv-one" style={containerStyle}>
            {data[0] && data[0].modelType === 3 && (
              <>
                <iframe
                  title="video1_1"
                  name="video1_1"
                  id="video1_1"
                  // src=""
                  src="../dhWeb/cn/dhVideo1_1.html"
                  style={style}
                />
                <iframe
                  title="video1_2"
                  name="video1_2"
                  id="video1_2"
                  // src=""
                  src="../dhWeb/cn/dhVideo1_2.html"
                  style={style}
                  scrolling="hidden"
                />
              </>
            )}

            {data[0] && data[0].modelType !== 3 && (
              <>
                <iframe
                  title="video1_1"
                  name="video1_1"
                  id="video1_1"
                  // src=""
                  src="../hkWeb/cn/hkVideo1_1.html"
                  style={style}
                />
                <iframe
                  title="video1_2"
                  name="video1_2"
                  id="video1_2"
                  // src=""
                  src="../hkWeb/cn/hkVideo1_2.html"
                  style={style}
                  scrolling="hidden"
                />
              </>
            )}
          </div>
        )}
      </div>
    );
  }
}

export default RealtimeVideo;
