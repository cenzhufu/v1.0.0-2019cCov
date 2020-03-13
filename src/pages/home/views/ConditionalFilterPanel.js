import * as React from "react";
import * as intl from "react-intl-universal";
import cpuImg from "./assets/images/cpu.png";
import libraryImg from "./assets/images/library.png";
import * as PropTypes from "prop-types";
import { Checkbox, Tree, Button } from "antd";
import "./assets/styles/conditionalFilterPanel.scss";

const { TreeNode } = Tree;

const IS_SHOW = window.config.isShowFactory;

class ConditionalFilterPanel extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      checkedCompanyList: [], //选中的算法厂商
      checkedAllCompany: true,
      checkedAllLibrary: true,
      companyIndeterminate: false,
      libraryIndeterminate: false,

      expandedKeys: [],
      checkedKeys: [], //选中的目标库ID
      isShowFactory: IS_SHOW,
    };
  }

  static defaultProps = {
    onSubmit: object => {},
    onChange: object => {},
    companyList: [],
    targetLibraryList: [],
  };

  static propTypes = {
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,
    companyList: PropTypes.array,
    targetLibraryList: PropTypes.array,
  };

  static getFilters() {
    alert();
    const { checkedCompanyList, checkedKeys } = this.state;
    const obj = { companyList: checkedCompanyList, libraryList: checkedKeys };
    return obj;
  }

  componentWillReceiveProps(nextProps) {
    const { companyList, targetLibraryList } = nextProps;
    if (companyList !== this.props.companyList) {
      this.setState({
        checkedCompanyList: [...companyList],
      });
    }
    if (targetLibraryList !== this.props.targetLibraryList) {
      this.setState({
        checkedKeys: [...this._getAllBankIds(targetLibraryList)],
      });
    }
  }

  /**
   * 点击确定按钮操作
   */
  handleSubmit = () => {
    const { checkedCompanyList, checkedKeys } = this.state;
    // if (checkedKeys.length === 0) {
    //   message.warning(intl.get("d").d("目标人脸库不能为空"));
    //   return;
    // }
    const obj = { companyList: checkedCompanyList, libraryList: checkedKeys };
    if (this.props.onSubmit) {
      this.props.onSubmit(obj);
    }
  };

  onChange = () => {
    const { onChange } = this.props;
    if (onChange) {
      const { checkedCompanyList, checkedKeys } = this.state;
      const obj = { companyList: checkedCompanyList, libraryList: checkedKeys };

      onChange(obj);
    }
  };

  /**
   * 全选、全不选算法厂商
   * @memberof AlgorithmVendorPanel
   */
  handleChangeAllCompany = e => {
    let list = [];
    let companyIndeterminate = false;
    if (e.target.checked) {
      list = [...this.props.companyList];
    }

    this.setState(
      {
        companyIndeterminate,
        checkedCompanyList: list,
        checkedAllCompany: e.target.checked,
      },
      this.onChange
    );
  };

  /**
   * 选择某、取消选择个公司
   * @param {*} companyItem
   * @param {*} e
   */
  handleCheckCompanyItem = (companyItem, e) => {
    const { checkedCompanyList } = this.state;
    const { companyList } = this.props;
    let list = [...checkedCompanyList];
    let checkedAllCompany = false;
    let companyIndeterminate = false;

    console.log("dddddd", { checkedCompanyList, companyItem });

    if (e.target.checked) {
      list.push(companyItem);
    } else {
      const index = list.indexOf(companyItem);
      // const index = list.findIndex((conpany, i) => {
      //   // let index = -1;
      //   console.log("conpany", conpany);

      //   if (conpany.id === companyItem.id) {
      //     return i;
      //     // index = i;
      //   }
      //   // return index;
      // });

      // alert(index);
      // const index = list.indexOf(companyItem);
      list.splice(index, 1);
    }

    if (list.length === companyList.length) {
      checkedAllCompany = true;
      companyIndeterminate = false;
    } else if (list.length === 0) {
      checkedAllCompany = false;
      companyIndeterminate = false;
    } else {
      checkedAllCompany = false;
      companyIndeterminate = true;
    }

    this.setState(
      {
        checkedAllCompany,
        companyIndeterminate,
        checkedCompanyList: list,
      },
      this.onChange
    );
  };

  /**
   * 获取目标库的总数
   * @returns {number} total
   */
  _getLibraryTotal = targetLibraryList => {
    // const { targetLibraryList } = this.props;
    let total = 0;
    for (const library of targetLibraryList) {
      total += 1;
      if (library.children) {
        // total += library.children.length;
        total += this._getLibraryTotal(library.children);
      }
    }
    return total;
  };

  /**
   *  二级库  获取所有的子库id
   * @returns
   */
  _getLibraryId = (libraryList = []) => {
    let targetLibraryList = [];
    if (libraryList.length !== 0) {
      targetLibraryList = libraryList;
    } else {
      targetLibraryList = [...this.props.targetLibraryList];
    }
    let idList = [];
    for (const library of targetLibraryList) {
      // idList.push(library.id);
      const libraryChildren = library.children;
      if (libraryChildren) {
        for (const item of libraryChildren) {
          idList.push(item.id);
        }
      }
    }
    return idList;
  };

  /**
   * 获取树节点的所有id
   * @param {*} [banks=[]]
   * @returns
   */
  _getAllBankIds = banks => {
    let list = [];
    for (const bank of banks) {
      list.push(bank.id);

      if (bank.children) {
        list = [...list, ...this._getAllBankIds(bank.children)];
      }
    }

    return list;
  };

  /**
   * 全选、全不选人脸库
   * @memberof ConditionalFilterPanel
   */
  handleChangeAllLibrary = e => {
    const { targetLibraryList } = this.props;
    let list = [];
    let libraryIndeterminate = false;
    if (e.target.checked) {
      list = this._getAllBankIds(targetLibraryList);
    }

    this.setState(
      {
        libraryIndeterminate,
        checkedKeys: [...list],
        checkedAllLibrary: e.target.checked,
      },
      this.onChange
    );
  };

  /**
   * 库选中
   * @param {*} checkedKeys
   * @param {*} e
   */
  onCheck = (checkedKeys, e) => {
    // console.log("onCheck", { checkedKeys, e });
    const { targetLibraryList } = this.props;
    const allLibraryId = this._getAllBankIds(targetLibraryList);
    // let checkId = [];
    // for (const id of checkedKeys) {
    //   if (allLibraryId.includes(id)) {
    //     checkId.push(id);
    //   }
    // }
    let checkedAllLibrary = false;
    let libraryIndeterminate = false;

    if (checkedKeys.length === allLibraryId.length) {
      checkedAllLibrary = true;
    } else if (checkedKeys.length === 0) {
      checkedAllLibrary = false;
    } else {
      checkedAllLibrary = false;
      libraryIndeterminate = true;
    }

    this.setState(
      {
        libraryIndeterminate,
        checkedAllLibrary,
        checkedKeys: checkedKeys,
      },
      this.onChange
    );
  };

  /**
   * 展开某个库
   * @param {*} expandedKeys
   */
  onExpand = expandedKeys => {
    console.log("onExpand", expandedKeys);
    this.setState({
      expandedKeys,
    });
  };

  /**
   * 渲染树
   * @param {*} data
   */
  renderTreeNodes = data =>
    data.map(item => {
      if (item.children) {
        return (
          <TreeNode
            selectable={false}
            title={item.text}
            key={item.id}
            dataRef={item}
          >
            {/* <div>dsfsf</div> */}
            {this.renderTreeNodes(item.children)}
          </TreeNode>
        );
      }
      return <TreeNode {...item} />;
    });

  render() {
    const {
      checkedCompanyList,
      checkedAllCompany,
      companyIndeterminate,
      checkedAllLibrary,
      libraryIndeterminate,
      checkedKeys,
      isShowFactory,
    } = this.state;
    const { companyList, targetLibraryList } = this.props;

    const companyTotalNumber = `(${checkedCompanyList.length}/${
      companyList.length
    })`;

    const targetLibraryNumber = `(${checkedKeys.length}/${this._getLibraryTotal(
      targetLibraryList
    )})`;
    console.log("czf_isShowFactory", isShowFactory);

    return (
      <div className="conditional-filte-panel-container">
        {/* 算法厂商 */}
        {isShowFactory && (
          <div>
            <div className="conditional-filte-panel-title-wrap">
              <div style={{ display: "flex", alignItems: "center" }}>
                <img src={cpuImg} alt="" width="14px" height="15px" />
                <span className="conditional-filte-panel-title">
                  {intl.get("d").d("算法厂商")}
                </span>
                <span>{companyTotalNumber}</span>
              </div>
              <Checkbox
                className="conditional-filte-panel-checkall"
                onChange={this.handleChangeAllCompany}
                checked={checkedAllCompany}
                indeterminate={companyIndeterminate}
              >
                {intl.get("ss").d("全选")}
              </Checkbox>
            </div>
            <div className="algorithm-vender-company-list">
              {companyList.map((item, index) => {
                if (checkedCompanyList.includes(item)) {
                  return (
                    <Checkbox
                      key={index}
                      style={{ marginLeft: "32px", marginTop: "18px" }}
                      onChange={this.handleCheckCompanyItem.bind(this, item)}
                      checked={true}
                    >
                      {item.name}
                    </Checkbox>
                  );
                } else {
                  return (
                    <Checkbox
                      key={index}
                      style={{ marginLeft: "32px", marginTop: "18px" }}
                      onChange={this.handleCheckCompanyItem.bind(this, item)}
                      checked={false}
                    >
                      {item.name}
                    </Checkbox>
                  );
                }
              })}
            </div>
          </div>
        )}
        {/* 目标人脸库 */}
        <div className="conditional-filte-panel-title-wrap">
          <div style={{ display: "flex", alignItems: "center" }}>
            <img src={libraryImg} alt="" width="14px" height="15px" />
            <span className="conditional-filte-panel-title">
              {intl.get("d").d("目标人脸库")}
            </span>
            <span>{targetLibraryNumber}</span>
          </div>
          <Checkbox
            className="conditional-filte-panel-checkall"
            onChange={this.handleChangeAllLibrary}
            checked={checkedAllLibrary}
            indeterminate={libraryIndeterminate}
          >
            {intl.get("ss").d("全选")}
          </Checkbox>
        </div>
        <div className="conditional-filte-panel-library-list">
          <Tree
            checkable
            onExpand={this.onExpand}
            expandedKeys={this.state.expandedKeys}
            onCheck={this.onCheck}
            checkedKeys={checkedKeys}
          >
            {this.renderTreeNodes(targetLibraryList)}
          </Tree>
        </div>
        <div className="conditional-filte-panel-sure-btn">
          <Button
            style={{ width: "80%" }}
            type="primary"
            block
            onClick={this.handleSubmit}
          >
            {intl.get("s").d("确定")}
          </Button>
        </div>
      </div>
    );
  }
}

export default ConditionalFilterPanel;
