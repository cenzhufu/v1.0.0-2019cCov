import * as React from "react";
import {
  message,
  Input,
  Button,
  Empty,
  Table,
  Pagination,
  DatePicker,
  Select,
  Popover,
} from "antd";
import * as intl from "react-intl-universal";
import moment from "moment";
import { withUserInfo } from "../../../context";
import request from "../../../utils/request";
import api from "../../../utils/api";
// import { guid } from "utils/guid";
import "./assets/styles/recordPanel.scss";

const { RangePicker } = DatePicker;
const Option = Select.Option;
const dateFormat = "YYYY-MM-DD";
const UN_KNOW = intl.get("d").d("无");
// const now = moment().format("dateFormat");
const columns = [
  {
    title: intl.get("dd").d("序号"),
    dataIndex: "number",
    key: "number",
    width: 100,
  },
  {
    title: intl.get("dd").d("时间"),
    dataIndex: "time",
    key: "time",
    width: 200,
  },
  {
    title: intl.get("dd").d("单位"),
    dataIndex: "unit",
    key: "unit",
    width: 200,
  },
  {
    title: intl.get("dd").d("用户"),
    key: "user",
    dataIndex: "user",
    width: 200,
  },
  {
    title: intl.get("dd").d("类型"),
    key: "type",
    dataIndex: "type",
    width: 200,
  },
  {
    title: intl.get("dd").d("日志"),
    dataIndex: "log",
    key: "log",
    width: 400,
    render: (text, record) => (
      <span>
        <span>{text.logDesc ? text.logDesc : UN_KNOW}</span>
        <Popover
          placement="rightBottom"
          // title="搜索"
          content={
            <div className="log-img">
              <img src={text.decUrl} alt="图片加载失败" />
            </div>
          }
          trigger="hover"
        >
          <span style={{ color: "#1890ff" }}>{getImgName(text.decUrl)}</span>
        </Popover>
      </span>
    ),
  },
];

/**
 * 从字符串中截取图片名字
 * @param {*} imgString
 * @returns imgName  图片名字
 */
function getImgName(imgString) {
  let imgName = "";
  if (imgString) {
    const index = imgString.indexOf("_") + 1;
    imgName = imgString.substring(index);
  }
  return imgName;
}
class RecordPanel extends React.Component {
  state = {
    page: 1,
    pageSize: 10,
    searchStr: "",
    startDate: moment()
      .subtract(1, "months")
      .format(dateFormat),
    endDate: moment().format(dateFormat),
    logType: "0", //1 登录  7 搜索
    total: 0,
    data: [],
    loading: true,
  };

  componentDidMount() {
    this._getLogData();
  }

  /**
   * 请求获取日志数据
   */
  _getLogData = () => {
    this.setState({
      loading: true,
    });
    const {
      page,
      pageSize,
      searchStr,
      logType,
      startDate,
      endDate,
    } = this.state;
    // const { userInfo } = this.props;
    const data = {
      page,
      pageSize,
      startTime: startDate ? `${startDate} 00:00:00` : "",
      endTime: endDate ? `${endDate} 23:59:59` : "",
      type: logType,
      userName: searchStr ? searchStr.trim() : "",
    };

    request
      .post(api.getLog, data)
      .then(res => {
        const data = res.data;
        if (data.code === 0 && data.data) {
          this._formatData(data.data, Number(data.total));
        } else if (data.code === 1001) {
          setTimeout(() => {
            message.warning(data.message);
            this._hideSpin({ data: [] });
          }, 400);
        } else {
          setTimeout(() => {
            // message.warning("系统繁忙，请稍后再试");
            this._hideSpin();
          }, 400);
        }
      })
      .catch(error => {
        setTimeout(() => {
          message.error("获取日志失败");
          this._hideSpin();
        }, 3000);
      });
  };

  /**
   * 格式化数据
   * @memberof RecordPanel
   */
  _formatData = (data, total) => {
    const { page, pageSize } = this.state;
    let number = (page - 1) * pageSize + 1;
    let list = [];
    for (let item of data) {
      let type = intl.get("d").d(UN_KNOW);
      if (item.type) {
        if (String(item.type) === "1") {
          type = intl.get("d").d("登录");
        }
        if (String(item.type) === "7") {
          type = intl.get("d").d("搜索");
        }
      }

      const element = {
        id: item.id,
        number: number++, // item.userId ? item.userId : intl.get("d").d(UN_KNOW),
        time: item.operateTime
          ? moment(item.operateTime).format("YYYY-MM-DD HH:mm:ss")
          : intl.get("d").d(UN_KNOW),
        unit: item.departmentName
          ? item.departmentName
          : intl.get("d").d(UN_KNOW),
        user: item.userName ? item.userName : intl.get("d").d(UN_KNOW),
        type,
        log: { decUrl: item.decUrl, logDesc: item.logDesc },
      };
      list.push(element);
    }

    this._hideSpin({ data: list, total });
  };

  /**
   * 隐藏spin
   * @memberof RecordPanel
   */
  _hideSpin = (state = {}) => {
    this.setState({
      loading: false,
      ...state,
    });
  };

  onChangeSearchStr = e => {
    this.setState({
      searchStr: e.target.value,
    });
  };

  handleChangeDate = (dates, dateStr) => {
    console.log("czf_date", { dates, dateStr });
    this.setState({
      startDate: dateStr[0],
      endDate: dateStr[1],
    });
  };

  handleChangeType = type => {
    this.setState({
      logType: type,
    });
  };

  /**
   * 点击确定搜素
   */
  handleClickSearch = () => {
    this.setState(
      {
        page: 1,
      },
      this._getLogData
    );
  };
  /**
   * 点击页码
   * @memberof RecordPanel
   */
  handleChangePage = (page, pageSize) => {
    this.setState(
      {
        page,
        pageSize,
      },
      this._getLogData
    );
  };

  /**
   * 改变每页显示数量
   * @memberof RecordPanel
   */
  handleChangePageSize = (current, size) => {
    this.setState(
      {
        page: 1,
        pageSize: size,
      },
      this._getLogData
    );
  };

  render() {
    const {
      data,
      loading,
      searchStr,
      total,
      logType,
      startDate,
      endDate,
      page,
    } = this.state;
    // console.log("dddddddddddddddddd", { startDate, endDate });

    return (
      <div className="operate-record-container">
        <div className="operate-record-filter">
          <Input
            value={searchStr}
            onChange={this.onChangeSearchStr}
            className="operate-record-input"
            placeholder={intl.get("ss").d("请输入要查询的用户名")}
          />
          <RangePicker
            className="operate-record-date"
            defaultValue={[
              moment(startDate, dateFormat),
              moment(endDate, dateFormat),
            ]}
            // value={[moment(startDate, dateFormat), moment(endDate, dateFormat)]}
            format={dateFormat}
            onChange={this.handleChangeDate}
          />
          <Select
            value={logType}
            className="operate-record-select"
            onChange={this.handleChangeType}
            defaultValue="0"
          >
            <Option value="0">{intl.get("k").d("全部")} </Option>
            <Option value="1">{intl.get("k").d("登录")} </Option>
            <Option value="7">{intl.get("k").d("搜索")}</Option>
          </Select>
          <Button type="primary" onClick={this.handleClickSearch}>
            {intl.get("s").d("查询")}
          </Button>
        </div>
        <div className="operate-record-body">
          <Table
            rowKey={"id"}
            className="operate-record-body-table"
            columns={columns}
            dataSource={data}
            pagination={false}
            loading={loading}
            locale={{
              emptyText: (
                <Empty
                  description={<span>{intl.get("NO_DATA").d("暂无数据")}</span>}
                />
              ),
            }}
          />

          <Pagination
            className="operate-record-page"
            // defaultCurrent={1}
            current={page}
            total={total}
            showSizeChanger
            // showQuickJumper
            onChange={this.handleChangePage}
            onShowSizeChange={this.handleChangePageSize}
          />
        </div>
      </div>
    );
  }
}
export default withUserInfo(RecordPanel);
