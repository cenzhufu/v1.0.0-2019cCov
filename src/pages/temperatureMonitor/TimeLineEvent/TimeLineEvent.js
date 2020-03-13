import React from "react";
import PropTypes from "prop-types";
import { Spin } from "antd";
import TimelineItem from "./TimelineItem";
import Face from "./Face";
import { formatTimeLineData } from "./formatData";
import request from "../../../utils/request.js";
import api from "../../../utils/api";
import InfiniteScroll from "react-infinite-scroller";
import intl from "react-intl-universal";

import "./style/TimeLineEvent.css";

const defaultProps = {
  captureParam: {}
};

const propTypes = {
  captureParam: PropTypes.object.isRequired
};
class TimeLineEvent extends React.Component {
  state = {
    dataSource: [],
    quality: 0,
    hasData: true,
    loading: false,
    hasMore: true,
    page: 1,
    pagesize: 60
  };
  /* shouldComponentUpdate(nextProps, nextState) {
    return (
      !Immutable.is(this.state, nextState) ||
      mutableProps.some(key => !Immutable.is(this.props[key], nextProps[key]))
    );
  } */
  componentWillMount() {
    this.setState({
      loading: true
    });
    this.getData();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.captureParam.faceId !== this.props.captureParam.faceId) {
      setTimeout(() => this.getData(true), 0);
    }
  }

  getData = resetPage => {
    if (Object.keys(this.props.captureParam).length === 0) {
      this.setState({
        loading: false
      });
      return;
    }
    //特殊处理点击确定按钮加载事件流(用于定点详情，移动采集详情事件流时)
    if (resetPage) {
      //重新加载数据则设置滚动条高度
      this.refs.timelineevent_wrap.scrollTop = 0;
      this.setState({ dataSource: [], page: 1, loading: true }, () => {
        this.getData();
      });
      return;
    }
    console.log("captureParam", this.props.captureParam);
    return request({
      url: api.getTimeLineData,
      method: "post",
      data: {
        page: this.state.page,
        pageSize: this.state.pagesize,
        personIds: this.props.captureParam.faceId
      }
    }).then(res => {
      if (res.errCode == 0) {
        if (res.data[0].events.length > 0) {
          if (this.state.page == 1) {
            this.setState({
              dataSource: formatTimeLineData(res.data[0].events),
              hasData: true,
              loading: false,
              hasMore: true
            });
          } else {
            let dataSource = this.state.dataSource;
            dataSource = dataSource.concat(
              formatTimeLineData(res.data[0].events)
            );
            this.setState({
              dataSource: dataSource,
              hasData: true,
              loading: false
            });
          }
        } else if (this.state.page == 1) {
          //TODO: nodata
          this.setState({
            dataSource: [],
            hasData: false,
            loading: false
          });
        } else if (this.state.page > 1) {
          //TODO: nodata
          this.setState({
            hasMore: false,
            loading: false
          });
        }
      } else {
        //TODO:
      }
    });
  };

  handleInfiniteOnLoad = () => {
    this.setState({
      page: this.state.page + 1,
      loading: true
    });
    this.getData();
  };

  onClick = data => {
    const { onClick } = this.props;
    onClick && onClick(data);
  };

  render() {
    const { dataSource, page } = this.state;

    let timeLineItems = [];
    console.log("timeline datasource", dataSource);
    dataSource.map((DayData, i) => {
      const { day, dayData } = DayData;
      if (day) {
        const leftContent = (
          <span
            className="f18 day"
            style={{
              fontFamily: "微软雅黑",
              color: "#333",
              lineHeight: "18px"
            }}
          >
            {day}
          </span>
        );
        timeLineItems.push(
          <TimelineItem
            key={String(day) + i}
            leftContent={leftContent}
            first={i == 0}
            showDot={false}
            content={""}
          />
        );
      }
      dayData.map((hourData, j) => {
        const { hour, data } = hourData;
        const leftContent = (
          <span className="f12 hour">
            {intl.get("TIME_LINE_HOUR", { hour: hour }).d(`${hour} 时`)}
          </span>
        );
        timeLineItems.push(
          <TimelineItem
            leftContent={leftContent}
            showDot={true}
            content={""}
            key={i + String(hour) + j}
          />
        );

        const faceList = data.map((value, index) => {
          const props = {
            ...this.props,
            index,
            key: value.id,
            data: value,
            dataSource: data,
            onClick: this.onClick
          };
          return <Face className="face_wrap dib" {...props} />;
        });
        timeLineItems.push(
          <TimelineItem
            leftContent={""}
            showDot={false}
            content={faceList}
            key={i + String(hour) + "faceList"}
          />
        );
      });
    });
    return (
      <div className="ofa wp timelineevent-wrap" ref="timelineevent_wrap">
        {/* <div style={{position: 'absolute', top: 24, right: 24, cursor: 'pointer', zIndex: 1}} onClick={this.props.onClose}>关闭</div> */}
        {dataSource && dataSource.length > 0 ? (
          <InfiniteScroll
            initialLoad={false}
            pageStart={page}
            loadMore={this.handleInfiniteOnLoad}
            hasMore={!this.state.loading && this.state.hasMore}
            useWindow={false}
          >
            {timeLineItems}
          </InfiniteScroll>
        ) : (
          ""
        )}
        {Object.keys(this.props.captureParam).length > 0 &&
        dataSource &&
        dataSource.length <= 0 &&
        !this.state.loading ? (
          <div className="wp no-data">{intl.get("NO_DATA").d("无数据")}</div>
        ) : (
          ""
        )}
        {Object.keys(this.props.captureParam).length === 0 && (
          <div className="wp no-data">{intl.get("NO_DATA").d("时间线")}</div>
        )}
        <Spin
          className={
            page == 1
              ? "wp spin-center zi1060 "
              : "wp spin-block-center  zi1060 "
          }
          size="small"
          spinning={this.state.loading}
        />
      </div>
    );
  }
}

TimeLineEvent.defaultProps = defaultProps;
TimeLineEvent.propTypes = propTypes;

export default TimeLineEvent;
