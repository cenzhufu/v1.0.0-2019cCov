import * as React from "react";
import { withUserInfo } from "../../context";
import { Layout, message, Tabs, Spin, Drawer, Progress, Empty } from "antd";
import moment from "moment";
import * as intl from "react-intl-universal";
import ImgView from "../../components/imgView";
import { UploadPanel, ConditionalFilterPanel, VendorResultItem } from "./views";
import * as InfiniteScroll from "react-infinite-scroller";
import { guid } from "../../utils//guid";
import FusionFaceItem from "../../components/fusionFaceItem";
import api from "../../utils/api";
import request from "../../utils/request";

import EmptyUrl from "./assets/images/tip_icon.png";
import "./assets/styles/imdex.scss";

const { Sider, Content } = Layout;
const TabPane = Tabs.TabPane;

const COMON_PARAMS_DATA = {
  appKey: guid(),
  sign: guid(),
  timestamp: moment().format("X"),
};
const ERROR_TIP = intl.get("dd").d("系统异常，请稍后再试");
const LOADING_TIP = intl.get("d").d("加载中...");
const UN_KNOW = intl.get("d").d("未知");
const NO_RESULTS = intl.get("d").d("无搜索结果");
class HomePage extends React.Component {
  constructor(props) {
    super(props);
    // this.orderType = "algorithmVendor"; //m默认按算法厂商排序
    this.state = {
      imgFile: {}, //上传检索的图片
      companyList: [], //算法公司
      checkedCompanyList: [], //选中的算法厂商
      bankList: [], //目标人脸库
      checkedBankIds: [], //选中的目标人脸库

      orderType: "algorithmVendor", //m默认按算法厂商排序
      vendorSearchResults: [], //算法厂商结果
      fusionSearchResults: [], //按照融合结果排列

      showDetail: false, //  是否显示详情
      detailInfo: null, //点击查看的详细

      noResult: false,
      loading: false,
      loadingTip: LOADING_TIP,
      activedId: "",
    };
  }

  componentDidMount() {
    // this._getCompanyData(); //获取算法厂商
    // this._getTargetLibraryData(); //获取目标人脸库
  }

  /**
   * 获取算法厂商数据
   */
  _getCompanyData = () => {
    request
      .get(api.getAllFactory, COMON_PARAMS_DATA)
      .then(res => {
        const resData = res.data;
        const { data } = resData;
        if (resData.code === 0) {
          this.setState({
            companyList: data,
            checkedCompanyList: data,
          });
        } else {
          message.error("获取算法厂商失败");
        }
      })
      .catch(error => {
        console.error(error);
        // message.error("失败");
        message.error(ERROR_TIP);
      });
  };

  /**
   * 获取目标人脸库数据
   * @memberof HomePage
   */
  _getTargetLibraryData = () => {
    request
      .post(api.getBank)
      .then(res => {
        console.log("czf_bank", res);
        const resData = res.data;
        const { data } = resData;
        if (resData.code === 0) {
          console.log("库", data);

          this.setState({
            bankList: data,
            checkedBankIds: [...this.__getAllBankIds(data)],
          });
        } else {
          message.error(intl.get("dd").d("获取目标人脸库失败"));
        }
      })
      .catch(error => {
        console.error(error);
        message.error(ERROR_TIP);
      });
  };

  _getSearchResults = () => {
    const { orderType } = this.state;
    if (orderType === "algorithmVendor") {
      this._getVendorSearchResults();
    }

    if (orderType === "fusionResult") {
      this._getFusionSearchResults();
    }
  };

  //  按照厂商排序
  _getVendorSearchResults = () => {
    const { imgFile, checkedBankIds } = this.state;
    const factoryIds = this.__getAllCompanyIds();
    const libids = checkedBankIds.join(",");
    const data = {
      faceId: imgFile.faceId,
      factoryIds: factoryIds,
      libids,
    };

    request
      .post(api.vendorSearchFace, data)
      .then(res => {
        const resData = res.data;
        const { data } = resData;
        if (resData.code === 0) {
          this.__formatVendorSearchResults(data);
        } else if (resData.code === 1002) {
          setTimeout(() => {
            this.setState({
              loading: false,
            });
            message.warning(intl.get("d").d(resData.message));
          }, 200);
        } else {
          // message.error(intl.get("d").d("搜索失败"));
          this.setState({
            loading: false,
          });
        }
      })
      .catch(error => {
        console.error(error);
        message.error(ERROR_TIP);
        this.setState({
          loading: false,
        });
      });
  };
  /**
   * 对结果进行格式转换
   * @param {*} data
   */
  __formatVendorSearchResults = data => {
    if (data.length === 0) {
      this.setState({
        loading: false,
        noResult: true,
      });
      return;
    }
    let vendorSearchResults = [];
    for (const vendor of data) {
      const { factoryInfo, persons } = vendor;
      let resultList = [];
      let vendors = [];
      if (persons && persons.length > 0) {
        for (const item of persons) {
          let gender = UN_KNOW;
          if (item.sex === 1) {
            gender = "男";
          } else if (item.sex === 2) {
            gender = "女";
          }

          const obj = {
            id: item.id,
            name: item.name,
            idNumber: item.idCards,
            bankName: item.bankName,
            threshold: item.similarity,
            imgUrl: item.photo,
            attributes: {
              race: item.nation ? item.nation : UN_KNOW,
              gender: gender,
              birthTime: item.birthday
                ? moment(item.birthday).format("YYYY-MM-DD")
                : UN_KNOW,
              address: item.address ? item.address : UN_KNOW,
            },
            vendors,
          };
          resultList.push(obj);
        }
      }

      let vendorOnj = {
        id: factoryInfo.id,
        name: factoryInfo.name,
        shortName: factoryInfo.shortName,
        total: persons.length,
        resultList,
      };
      vendorSearchResults.push(vendorOnj);
    }
    this.setState({
      vendorSearchResults,
      loading: false,
      loadingTip: LOADING_TIP,
    });
  };

  /**
   * 获取树节点的所有id
   * @param {*} [banks=[]]
   * @returns
   */
  __getAllBankIds = banks => {
    let list = [];
    for (const bank of banks) {
      list.push(bank.id);
      if (bank.children) {
        list = [...list, ...this.__getAllBankIds(bank.children)];
      }
    }
    return list;
  };

  /**
   * 获取所有算法厂商id
   * @memberof HomePage
   */
  __getAllCompanyIds = () => {
    const { checkedCompanyList } = this.state;
    let list = [];
    for (const company of checkedCompanyList) {
      list.push(company.id);
    }
    return list;
  };

  /**
   * 融合结果
   * @memberof HomePage
   */
  _getFusionSearchResults = () => {
    const { imgFile, checkedBankIds } = this.state;
    const factoryIds = this.__getAllCompanyIds();
    const libids = checkedBankIds.join(",");
    const data = {
      faceId: imgFile.faceId,
      factoryIds: factoryIds,
      libids,
    };

    request
      .post(api.fucionSearchFace, data)
      .then(res => {
        const resData = res.data;
        const { data } = resData;
        if (resData.code === 0) {
          this.__formatFusionSearchResults(data);
        } else if (resData.code === 1002) {
          setTimeout(() => {
            message.warning(intl.get("d").d(resData.message));
            this.setState({
              loading: false,
            });
          }, 200);
        } else {
          // message.error(intl.get("d").d("搜索失败"));
          this.setState({
            loading: false,
          });
        }
      })
      .catch(error => {
        console.error(error);
        message.error(ERROR_TIP);
        this.setState({
          loading: false,
        });
      });
  };

  __formatFusionSearchResults = fusionData => {
    if (fusionData.length === 0) {
      this.setState({
        loading: false,
        noResult: true,
      });
      return;
    }
    // console.log("融合人像", fusionData);
    let fusionSearchResults = [];
    for (const fusion of fusionData) {
      const { factoryResultVos, personVo } = fusion;
      let thresholdSum = 0;
      let vendors = [];
      for (const item of factoryResultVos) {
        thresholdSum += Number(item.similarity);
        const obj = {
          id: item.id,
          name: item.name,
          threshold: item.similarity,
        };
        vendors.push(obj);
      }

      let gender = UN_KNOW;
      if (personVo.sex === 1) {
        gender = "男";
      } else if (personVo.sex === 2) {
        gender = "女";
      }

      const obj = {
        id: personVo.id,
        name: personVo.name,
        imgUrl: personVo.photo,
        idNumber: personVo.idCards,
        bankName: personVo.bankName,
        threshold: Number(
          Number(thresholdSum / factoryResultVos.length).toFixed(2)
        ),
        attributes: {
          race: personVo.nation ? personVo.nation : UN_KNOW,
          gender: gender,
          birthTime: personVo.birthday
            ? moment(personVo.birthday).format("YYYY-MM-DD")
            : UN_KNOW,
          address: personVo.address ? personVo.address : UN_KNOW,
        },
        vendors,
      };

      fusionSearchResults.push(obj);
    }

    this.setState({
      fusionSearchResults,
      loading: false,
    });
  };

  onUploading = uploading => {
    if (uploading) {
      this.setState({
        loading: true,
        loadingTip: intl.get("d").d("图片上传中..."),
      });
    }
  };

  /**
   * 上传出错或者裁剪关闭
   * @memberof HomePage
   */
  onUploadErro = erroe => {
    if (erroe) {
      this.setState({
        loading: false,
        loadingTip: LOADING_TIP,
      });
    }
  };

  /**
   *  上传成功   *
   * @memberof HomePage
   */
  onUploaded = imgFile => {
    if (imgFile) {
      this.setState(
        {
          imgFile,
          vendorSearchResults: [],
          fusionSearchResults: [],
        },
        this._getSearchResults
      );
    }
  };

  onCropper = imgFile => {
    if (imgFile) {
      this.setState(
        {
          imgFile,
          vendorSearchResults: [],
          fusionSearchResults: [],
        },
        this._getSearchResults
      );
    }
    // console.log("裁剪", fileInfo);
    // const { formData, faceId } = fileInfo;
    // if (faceId) {
    // } else {

    // }
  };

  /**
   * 获得算法厂商
   * @param {*} companyList
   */
  handleSearch = selectObj => {
    const { imgFile } = this.state;
    if (Object.keys(imgFile).length > 0) {
      this.setState(
        {
          checkedCompanyList: selectObj.companyList,
          checkedBankIds: selectObj.libraryList,
          vendorSearchResults: [],
          fusionSearchResults: [],
          loading: true,
          loadingTip: LOADING_TIP,
        },
        this._getSearchResults
      );
    } else {
      message.warning(intl.get("d").d("请先上传图片"));
    }
  };

  /**
   * 改变某个过滤条件
   * @param {*} selectObj
   */
  onChangeFilters = selectObj => {
    this.setState({
      checkedCompanyList: selectObj.companyList,
      checkedBankIds: selectObj.libraryList,
    });
  };
  /**
   * Tab切换
   * @param {*} activeKey
   */
  handleChangeTab = orderType => {
    const { vendorSearchResults, fusionSearchResults, imgFile } = this.state;
    if (Object.keys(imgFile).length > 0) {
      this.setState(
        {
          orderType,
          loading: true,
          loadingTip: LOADING_TIP,
        },
        () => {
          if (
            (orderType === "algorithmVendor" &&
              vendorSearchResults.length === 0) ||
            (orderType === "fusionResult" && fusionSearchResults.length === 0)
          ) {
            this._getSearchResults();
          } else {
            this.setState({
              loading: false,
            });
          }
        }
      );
    } else {
      this.setState({
        orderType,
      });
    }
  };

  /**
   *点击查看厂商结果详情
   * @param {*} vendorInfo
   */
  handleClickVendorItem = vendorInfo => {
    console.log("czf_vendorInfo", vendorInfo);
    this.setState({
      showDetail: true,
      detailInfo: vendorInfo,
      activedId: vendorInfo.id,
    });
  };

  /**
   *点击查看融合结果详情
   * @param {*} vendorInfo
   */
  handleClickFusionItem = fusionInfo => {
    console.log("czf_fusionInfo", fusionInfo);
    this.setState({
      showDetail: true,
      detailInfo: fusionInfo,
      activedId: fusionInfo.id,
    });
  };

  loadMore = () => {
    const { loading } = this.state;
    if (loading) {
      return;
    }
  };

  onCloseDetail = () => {
    this.setState({
      showDetail: false,
      detailInfo: null,
    });
  };

  render() {
    const {
      orderType,
      companyList,
      bankList,
      vendorSearchResults,
      fusionSearchResults,
      showDetail,
      imgFile,
      detailInfo,
      loading,
      loadingTip,
      noResult,
      activedId,
    } = this.state;

    let faceUrl = "";
    if (imgFile.faceUrl) {
      faceUrl = imgFile.faceUrl;
    }
    // console.log("czf_detailInfo", detailInfo);

    return (
      <Layout style={{ height: "100%" }} className="home-pages-container">
        {/* <Sider width={360} className="home-pages-sider">
          <UploadPanel
            onUploading={this.onUploading}
            onUploaded={this.onUploaded} 
            onUploadErro={this.onUploadErro}
            // onclick={this.handleClickUpload}
            onCropper={this.onCropper}
          />
          <div className="dividing-line" />
          <ConditionalFilterPanel
            companyList={companyList}
            targetLibraryList={bankList}
            onSubmit={this.handleSearch}
            onChange={this.onChangeFilters}
          />
        </Sider> */}
        <Content
          style={{
            height: "100%",
            padding: "0 10px",
            minHeight: 280,
            minWidth: 520,
            display: "flex",
            flexDirection: "column",
            overflowY: "hidden",
          }}
        >
          <div className="home-page-right-content">
            
          
          </div>
     
        </Content>
      </Layout>
    );
  }
}

export default withUserInfo(HomePage);
