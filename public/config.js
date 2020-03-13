// 环境配置
window.config = {
  projectName: "TemperatureMonitoringSystem",
  version: "v1.0.0",
  systemName: "智能体温监测系统", //系统名称
  defaultLanguage: "zh_CN", // 默认语言只能为zh_CN或en_US
  environments: {
    // api请求地址配置
    apiBaseURL: "192.168.8.235:8083",
    // apiBaseURL: "192.168.11.236:8083",
    //apiBaseURL: "192.168.11.101:8083",
    // apiBaseURL: "192.168.52.13:8083",
    mqttServer: {
      //mqtt服务器配置
      // host: '192.168.11.101',
      // host: '192.168.11.236',
      host: "192.168.8.235",
      port: 9001
    },

    hkServer: {
      ip: "192.168.8.114",
      port: 80,
      username: "admin",
      password: "introcks1234"
    }
  },
  // autoView: false, //自动弹窗
  showAlarmCount: 15, //查看告警全部单页显示个数
  showCaptureCount: 56, //查看抓拍全部单页显示个数
  viewTime: 6000, //自动弹窗时间 毫秒
  //允许上传的图片类型
  acceptImageType: "image/bmp, image/jpeg, image/jpg, image/png",
  keepLoginTime: 1 / 48, //cooki失效时间，单位为天，默认为半小时
  isShowFactory: true, //是否显示算法厂商
  copyRight: "Copyright© 2019 intellif.com 云天励飞版权所有"
};
