var WebVideoCtrl = (function(e)
{
	//事件响应函数列表
	var eventHandler = {
		selectDir:function(path){
		}
	}
	
	//插件对象
	var pluginObject;
	//初始化成功函数
	var initSuccess;
	//事件信号列表
	var SignalMap = new Map();
	//挂载窗口选中信号
	SignalMap.put("SelectedView",new Array());
	SignalMap.put("DetectedDeviceInfo",new Array());
	//设备信息表
	var deviceInfoMap = new Map();
	//播放信息表
	var playerInfoMap = new Map();
	//网络协议,二代,三代
	var sProtocol;
	//录像信息
	var remoteFileInfor = [];
	
	//事件处理函数
	function handleEvent(message){
		var messageObject = $.parseJSON(message);
		if(("event" in  messageObject))
		{
			var eventType = messageObject["event"];
			//根据不同的事件类型来处理
			if("SelectedDirectory" == eventType){
				//解析类型和路径
				var pathType = messageObject["params"]["Type"];
				var pathName = messageObject["params"]["PathName"];
				//设置路径
				pluginObject.SetStoragePath(pathType,pathName);
				eventHandler.selectDir(pathName);
			}else if("SelectedView" == eventType){
				var callBackList = SignalMap.get("SelectedView");
				//调用回调函数
				for(var i = 0; i < callBackList.length; i++){
					callBackList[i](messageObject["params"]["nodeIndex"],messageObject["params"]["viewIndex"],messageObject["params"]["winID"]);
				}
			}else if("DetectedDeviceInfo" == eventType){
				var callBackList = SignalMap.get("DetectedDeviceInfo");
				//调用回调函数
				for(var i = 0; i < callBackList.length; i++){
					callBackList[i](messageObject["params"]["deviceIP"],messageObject["params"]["svrPort"],messageObject["params"]["state"]);
				}
			}
		}
	}
	
	/**
	*@description 判断插件是否安装
	*@return Boolean
	*/
	var checkPluginInstall = function()
	{
		var e = false;
		if(browser().msie)
		{
			try{
				new ActiveXObject("WebActiveX.Plugin.4.0.0.0");
				e = true;
			}
			catch(n)
			{
				e = false;
			}
		}
		else 
		{
			for(var r=0,s=navigator.mimeTypes.length;s>r;r++)
			{
				if("application/media-plugin-version-4.0.0.0"==navigator.mimeTypes[r].type.toLowerCase())
				{
					e = true;
					break;
				}
			}
		}
		return e;
	};
	
	//获得浏览器类型
	var browser = function(){
		var e=/(chrome)[ \/]([\w.]+)/,
		t=/(safari)[ \/]([\w.]+)/,
		n=/(opera)(?:.*version)?[ \/]([\w.]+)/,
		r=/(msie) ([\w.]+)/,
		s=/(trident.*rv:)([\w.]+)/,
		o=/(mozilla)(?:.*? rv:([\w.]+))?/,
		i=navigator.userAgent.toLowerCase(),
		a=e.exec(i)||t.exec(i)||n.exec(i)||r.exec(i)||s.exec(i)||i.indexOf("compatible")<0&&o.exec(i)||["unknow","0"];
		a.length>0&&a[1].indexOf("trident")>-1&&(a[1]="msie");
		var c={};
		return c[a[1]]=!0,c.version=a[2],c
	}
	
	/**
	*@description 插入插件
	*@param{String} sContainerID 插件的容器ID
	*@param{Num}    iWidth       插件的宽
	*@param{Num}    iHeight      插件的高
	*@return void
	*/
	function insertPluginObject(sContainerID,iWidth,iHeight){
		//如果是IE浏览器的话
		if (browser().msie) {
				var sSize = " width=" + "\"" + iWidth.toString() + "\"" + " height=" + "\"" + iHeight.toString() + "\"";
				var sHtmlValue = "<object classid=\"CLSID:240999BE-CBAD-44F7-A19D-DA415C8A5B58\" codebase=\"webrec.cab\""  + sSize + "id=\"dhVideo\">" + "</object>"
				$("#" + sContainerID).html(sHtmlValue);
		} else {
			var sSize = " width=" + "\"" + iWidth.toString() + "\"" + " height=" + "\"" + iHeight.toString() + "\"";
			var sHtmlValue = "<object type=\"application/media-plugin-version-4.0.0.0\"" + sSize + "id=\"dhVideo\">" + "</object>";
			$("#" + sContainerID).html(sHtmlValue);
		}
		return true;
	}
	
	/**
	*@description 监听事件信号
	*@param{String} event  事件名称
	*@param{Function} cb 事件回调函数
	*/
	function registerEvent(event,cb){
		var callBackList = SignalMap.get(event);
		if(typeof callBackList != "undefined"){
			callBackList.push(cb)
		}
		return true;
	}
	
	/**
	*@description 开启设备探测
	*@param{String} ip    设备IP
	*@param{Num}    port  服务端口
	*/
	function startDevciceDetection(ip,port){
		return pluginObject.StartDevciceDetection(ip,port);
	}

	/**
	*@description 初始化插件
	*@param{String} sp    协议类型
	*@param{Function} fnCallback 初始化成功后的回调函数
	*/
	var initPlugin = function(sp,fnCallback){
		initSuccess = fnCallback;
		sProtocol = sp;
		checkReady();
		return true;
	}
	
	function checkReady(){
	     pluginObject = document.getElementById("dhVideo");
         try {
				//获得插件
				pluginObject = document.getElementById("dhVideo");
				//监听事件
				pluginObject.AddEventListener("message",handleEvent);
				//如果是IE浏览器的话，插件请求分发对象
				if(browser().msie)
				{
					pluginObject = pluginObject.CreatePlugin();
				}
				//设置产品信息
				pluginObject.SetProductType("Customer");
				//设置通信协议
				pluginObject.SetNetProtocolType(sProtocol);
				//激发插件初始化完毕信号
				pluginObject.NoticeInitializedSignal();
				//回调
				initSuccess();
            } catch (e){
				setTimeout(checkReady,500);
         }
	}
	
	/**
	*@description 解析错误信息
	*@param{String} 错误信息
	*@return String 错误描述信息
	*/
	var parseError = function(errorInfo){
		var errorObject = $.parseJSON(errorInfo);
		if(("error" in  errorObject))
		{
			return errorObject["error"];
		}
	};

	/**
	*@description 创建视频窗口
	*@param{Num}  iNum 要创建的窗口数目
	*@return Boolean
	*/
	var createMultiNodeDisplay = function(iNum){
		pluginObject.CreateMultiNodeDisplay(iNum);
	};
	
	/**
	*@description 设置窗口的显示数目
	*@param{Num}  iNum 要显示的数目
	*@return Boolean
	*/
	var setSplitNum = function(iNum){
		pluginObject.SetSplitNum(iNum * iNum);
	}
	
	/**获得应用错误
	*@description 获得应用错误码
	*@param{String} name 方法名称
	*@return 错误码
	*/
	var getLastError = function(name){
		return pluginObject.GetLastError(name);
	}
	
	/**登录设备
	*@description 初始化插件
	*@param{String} sIp         设备IP
	*@param{Num} iPort          服务端口
	*@param{String} sUserName   用户名
	*@param{String} sPassword   密码
	*@param{Num} iRtspPort      Rtsp端口
	*@param{Num} iProtocol      通信协议  
	*@param{Function} fnSuccess 登录成功后的回调函数
	*@param{Function} fnFail    登录失败后的回调函数
	*/
	var login = function(sIp,iPort,sUserName,sPassword,iRtspPort,iProtocol,fnSuccess,fnFail){;
		var ret = pluginObject.LoginDevice(sIp,iPort,sUserName,sPassword,iRtspPort,iProtocol);
		if(ret > 0){
			//插入设备信息
			var channelNum = pluginObject.GetChannelTotal(ret);
			insertDeviceInfo(sIp,iPort,sUserName,sPassword,iRtspPort,iProtocol,channelNum,ret);
			fnSuccess(sIp,ret);
		}
		else if(ret <= 0){
			//获得错误信息
			var errorInfo = pluginObject.GetLastError("LoginDevice");
			//解析错误描述
			fnFail(ret,parseError(errorInfo));
		}
		else if(typeof ret == "undefined")
		{
			fnFail(-19,"invalit interface");
		}
		return ret;
	}
	
	/**
	*@description 插入一个设备信息
	*@param{Num} deviceID     设备ID
	*@param{String} ip        设备IP
	*@param{Num} port         服务端口
	*@param{String} userName  用户名
	*@param{String} password  密码
	*@param{Num} rtspPort     rtsp端口
	*@param{Num} channelNum   通道总数
	*@param{Num} deviceID     设备ID
	*/
	function insertDeviceInfo(ip,port,userName,password,rtspPort,protocol,channelNum,deviceID)
	{
		var info = {
			ip:ip,
			port:port,
			userName:userName,
			password:password,
			rtspPort:rtspPort,
			channelNum:channelNum,
			deviceID:deviceID,
			protocol:protocol
		}
		deviceInfoMap.put(ip,info);
	}
	
	/**
	*@description 获得设备信息
	*/
	function getDeviceInfo(ip)
	{
		var info = deviceInfoMap.get(ip);
		return info;
	}
	
	/**
	*@description 插入一个播放器
	*@param{Num} iWinID       窗口ID
	*@param{Num} iDeviceID    设备ID
	*@param{Num} iPlayerID    播放器ID
	*@param{string} sIP       设备IP
	*@param{Num} iProtocol    协议类型
	*@param{Num} iChannle     通道号
	*@param{Num} iStreamType  码流类型
	*@param{Num} iPlayerType  播放器类型 0:实时监视  1:网络回放
	*/
	function insertPlayer(iWinID,iDeviceID,iPlayerID,sIP,iProtocol,iChannle,iStreamType,iPlayerType)
	{
		var info = {
			winID:iWinID,
			deviceID:iDeviceID,
			ip:sIP,
			channle:iChannle,
			streamType:iStreamType,
			protocol:iProtocol,
			playerID:iPlayerID,
			type:iPlayerType
		}
		playerInfoMap.put(iWinID,info);
	}
	
	
	/**
	*@description 获得指定设备的通道总数
	*@param{Num} deviceID  设备ID
	*/
	var getChannelNumber = function(deviceID){
		return pluginObject.GetChannelTotal(deviceID);
	}
	
	/**
	*@description 登出设备
	*@param{String} ip  
	*@return Boolean
	*/
	var logout = function(ip){
		var info = WebVideoCtrl.getDeviceInfo(ip);
		if(typeof info != "undefined")
		{
			if(pluginObject.LogoutDevice(info.deviceID)){
				//移除设备
				deviceInfoMap.remove(ip);
				return true;
			}
		}
		return false;
	}
	
	/**
	*@description 选中的视频窗口上播放视频
	*@param{String} sIP  
	*@param{Num} iChannel
	*@param{Num} iStream 
	*@param{Function} fnSuccess 
	*@param{Function} fnFail 
	*@return Num
	*/
	var connectRealVideo = function(sIP,iChannel,iStream,fnSuccess,fnFail){
		var iNodeIndex = pluginObject.GetSelectedNodeIndex();
		var iViewIndex = pluginObject.GetSelectedViewIndex();
		var iWinID = pluginObject.GetSelectedWinID();
		var iRet = -6;
		//获得设备信息
		var ODeviceInfo = getDeviceInfo(sIP);
		if(typeof ODeviceInfo == "undefined"){
			fnFail(iRet,"device no login");
			return iRet;
		}
		iRet = pluginObject.ConnectRealVideo(ODeviceInfo.deviceID,iNodeIndex,iViewIndex,iChannel - 1,iStream,ODeviceInfo.protocol);
		if(iRet > 0){
			//播放成功
			if(typeof fnSuccess != "undefined"){
				fnSuccess(iRet);
				insertPlayer(iWinID,ODeviceInfo.deviceID,iRet,ODeviceInfo.ip,ODeviceInfo.protocol,iChannel,iStream,0);
			};
		}
		else if(iRet <= 0){
			if(typeof fnSuccess != "undefined"){
				//获得错误信息
				var errorInfo = pluginObject.GetLastError("ConnectRealVideo");
				//解析错误描述
				fnFail(iRet,parseError(errorInfo));
			};
		}
		return iRet;
	}
	
	/**
	*@description 选中指定的视频窗口
	*@param{Num} iIndex
	*/
	var selectWindow = function(iIndex){
		var iNodeIndex = pluginObject.GetSelectedNodeIndex();
		pluginObject.SelectWindow(iNodeIndex,iIndex);
	}
	
	/**
	*@description 在指定的窗口序号上播放视频
	*@param{Num} iIndex
	*@param{String} sIP  
	*@param{Num} iChannel
	*@param{Num} iStream 
	*@param{Function} fnSuccess 
	*@param{Function} fnFail 
	*@return Num
	*/
	var connectRealVideoEx = function(iIndex,sIP,iChannel,iStream,fnSuccess,fnFail){
		var iNodeIndex = pluginObject.GetSelectedNodeIndex();
		var iViewIndex = iIndex;
		var iWinID = pluginObject.GetWinID(iNodeIndex,iViewIndex);
		var iRet = -6;
		//获得设备信息
		var ODeviceInfo = getDeviceInfo(sIP);
		if(typeof ODeviceInfo == "undefined"){
			fnFail(iRet,"device no login");
			return iRet;
		}
		iRet = pluginObject.ConnectRealVideo(ODeviceInfo.deviceID,iNodeIndex,iViewIndex,iChannel - 1,iStream,ODeviceInfo.protocol);
		if(iRet > 0){
			//播放成功
			if(typeof fnSuccess != "undefined"){
				fnSuccess(iRet);
				insertPlayer(iWinID,ODeviceInfo.deviceID,iRet,ODeviceInfo.ip,ODeviceInfo.protocol,iChannel,iStream,0);
			};
		}
		else if(iRet <= 0){
			if(typeof fnSuccess != "undefined"){
				//获得错误信息
				var errorInfo = pluginObject.GetLastError("ConnectRealVideo");
				//解析错误描述
				fnFail(iRet,parseError(errorInfo));
			};
		}
		return iRet;
	}
	
	//获得选中的视图序号
	var getSelectedWinIndex = function(){
		return pluginObject.GetSelectedViewIndex();
	}
	
	/**
	*@description 关闭当前选中窗口的播放器
	*/
	var closePlayer = function(){
		//获得当前选中的窗口ID
		var iWinID = getSelectedWinID();
		//获取播放器ID
		var oInfo = playerInfoMap.get(iWinID);
		if(typeof oInfo != "undefined"){
			pluginObject.ClosePlayer(oInfo.playerID);
			return true;
		}else{
			return true;
		}
	}
	
	/**
	*@description 关闭所有的播放器
	*/
	var closeAllPlayer = function(){
		//遍历播放器ID
		playerInfoMap.each(function(info){
			if(typeof info != "undefined"){
				pluginObject.ClosePlayer(info.playerID);
			}
		});
	}
	
	/**
	*@description 获得播放器信息
	*@param{Num} iWinID 窗口ID
	*/
	function getPlayerInfo(iWinID)
	{
		return playerInfoMap.get(iWinID);
	}
	
	
	/**
	*@description 获得选中窗口上的播放器ID
	*/
	function getSelectedPlayerID()
	{
		var iWinID = WebVideoCtrl.getSelectedWinID();
		var info = playerInfoMap.get(iWinID);
		if(typeof info != "undefined")
		{
			return info.playerID;
		}else{
			return 0;
		}
	}
	
	//语音对讲
	var startVoiceTalk = function(sIP,cb){
		var ODeviceInfo = getDeviceInfo(sIP);
		if(typeof ODeviceInfo == "undefined"){
			return 0;
		}
		var ret = pluginObject.StartIntercom(ODeviceInfo.deviceID);
		if(ret > 0){
			cb.cbSuccess(ret);
		}
		else{
			cb.cbFailed();
		}
	}
	
	//关闭对讲
	var stopVoiceTalk = function(sIP){
		var ODeviceInfo = getDeviceInfo(sIP);
		if(typeof ODeviceInfo == "undefined"){
			return 0;
		}
		pluginObject.StopIntercom(ODeviceInfo.deviceID);
	}
	
	//选择路径
	var selectDirectory = function(type,cb){
		//注册路径选择事件
		eventHandler.selectDir = cb.cbSuccess;
		pluginObject.SelectDirectory(type);
	}
	
	/**
	*@description 抓取当前选中窗口上播放视频的实时图片
	*@param{Num} iFormat 存档图片的格式
	*@param{Num} sPath   图片的存储路径
	*@param{Boolean} bOpen   图片的存储路径
	*/
	var crabOnePicture = function(iFormat,sPath,bOpen){
		return pluginObject.CrabOnePicture(iFormat,sPath,bOpen);
	}
	
	/**
	*@description 开启当前选中窗口上播放视频的录像功能
	*@param{Num} iFormat 录像格式
	*@param{Num} sPath   录像的存储路径
	*/
	var startRecordingVideo = function(iFormat,sPath){
		return pluginObject.controlRecordingVideo(sPath,iFormat,true);
	}
	
	//停止录像
	var stopRecordingVideo = function(){
		return pluginObject.controlRecordingVideo("",-1,false);
	}
	
	//设置音量
	var setVolume = function(volume,cb){
		pluginObject.SetVolume(volume)
	}
	
	//打开声音
	var openSound = function(cb){
		var playerID = getSelectedPlayerID();
		return pluginObject.ControlAudio(playerID,true);
	}
	
	//关闭声音
	var closeSound = function(cb){
		var playerID = getSelectedPlayerID();
		return pluginObject.ControlAudio(playerID,false);
	}
	
	/**
	*@description 开启电子放大
	*/
	var enableEZoom = function(cb){
		return pluginObject.ActiveLocalEnlarge(true);
	}
	
	/**
	*@description 关闭电子放大
	*/
	var disableEZoom = function(cb){
		return pluginObject.ActiveLocalEnlarge(false);
	}
	
	/**
	*@description 切换到全屏
	*@param{Boolean} 
	*/
	var setFullscreen = function(){
		pluginObject.SetFullscreen();
		return true;
	}
	
	//获得用户路径
	var getUserDirectory = function(){
		return pluginObject.GetUserDirectory();
	}
	
	//获得选中的窗口ID
	var getSelectedWinID = function(){
		return pluginObject.GetSelectedWinID();
	}
	
	/**
	*@description 控制播放器的声音
	*@param{Num} playerID    播放器ID
	*@param{Boolean} enable  开启关闭标志
	*/
	var controlAudio = function(playerID,enable){
		return pluginObject.ControlAudio(playerID,enable);
	}
	
	/**
	*@description 左上移动
	*@param{Num} iVerticalSpeed    垂直速度
	*@param{Num} iLevelSpeed       水平速度
	*@param{Boolean} flag  开启停止标志
	*/
	var moveUpperLeft = function(iVerticalSpeed,iLevelSpeed,flag){
		return pluginObject.MoveUpperLeft(iVerticalSpeed,iLevelSpeed,flag);
	}
	
	/**
	*@description 右上移动
	*@param{Num} iVerticalSpeed    垂直速度
	*@param{Num} iLevelSpeed       水平速度
	*@param{Boolean} flag  开启停止标志
	*/
	var moveUpperRight = function(iVerticalSpeed,iLevelSpeed,flag){
		return pluginObject.MoveUpperRight(iVerticalSpeed,iLevelSpeed,flag);
	}
	
	/**
	*@description 左下移动
	*@param{Num} iVerticalSpeed    垂直速度
	*@param{Num} iLevelSpeed       水平速度
	*@param{Boolean} flag  开启停止标志
	*/
	var moveLowerLeft = function(iVerticalSpeed,iLevelSpeed,flag){
		return pluginObject.MoveLowerLeft(iVerticalSpeed,iLevelSpeed,flag);
	}
	
	/**
	*@description 右下移动
	*@param{Num} iVerticalSpeed    垂直速度
	*@param{Num} iLevelSpeed       水平速度
	*@param{Boolean} flag  开启停止标志
	*/
	var moveLowerRight = function(iVerticalSpeed,iLevelSpeed,flag){
		return pluginObject.MoveLowerRight(iVerticalSpeed,iLevelSpeed,flag);
	}
	
	/**
	*@description 上移动
	*@param{Num} iVerticalSpeed   垂直速度
	*@param{Boolean} flag         开启停止标志
	*/
	var moveUpwards = function(iVerticalSpeed,flag){
		return pluginObject.MoveUpwards(iVerticalSpeed,flag);
	}
	
	/**
	*@description 下移动
	*@param{Num} iVerticalSpeed   垂直速度
	*@param{Boolean} flag         开启停止标志
	*/
	var moveLower = function(iVerticalSpeed,flag){
		return pluginObject.MoveLower(iVerticalSpeed,flag);
	}
	
	/**
	*@description 左移动
	*@param{Num} iLevelSpeed   水平速度
	*@param{Boolean} flag      开启停止标志
	*/
	var moveLeft = function(iLevelSpeed,flag){
		return pluginObject.MoveLeft(iLevelSpeed,flag);
	}
	
	/**
	*@description 右移动
	*@param{Num} iLevelSpeed   水平速度
	*@param{Boolean} flag      开启停止标志
	*/
	var moveRight = function(iLevelSpeed,flag){
		return pluginObject.MoveRight(iLevelSpeed,flag);
	}
	
	/**
	*@description 使能PTZ定位
	*/
	var enablePTZLocate = function(){
		return pluginObject.ActivePTZLocate(true);
	}
	
	/**
	*@description 非使能PTZ定位
	*/
	var disablePTZLocate = function(){
		return pluginObject.ActivePTZLocate(false);
	}
	
	/**
	*@description 控制变倍
	*@param{Num} iSpeed     倍数
	*@param{Num} flag      增加或减少标志
	*       - 0:增加
	*       - 1:减少
	*@param{Boolean} flag1      开启停止标志
	*/
	var controlZoom = function(iSpeed,flag,flag1){
		return pluginObject.ControlZoom(iSpeed,flag,flag1);
	}
	
	/**
	*@description 控制变焦
	*@param{Num} speed     倍数
	*@param{Num} flag      增加或减少标志
	*       - 0:增加
	*       - 1:减少
	*@param{Boolean} flag1      开启停止标志
	*/
	var controlFocus = function(speed,flag,flag1){
		return pluginObject.ControlFocus(speed,flag,flag1);
	}
	
	/**
	*@description 控制光圈
	*@param{Num} speed     倍数
	*@param{Num} flag      增加或减少标志
	*       - 0:增加
	*       - 1:减少
	*@param{Boolean} flag1      开启停止标志
	*/
	var controlAperture = function(speed,flag,flag1){
		return pluginObject.ControlAperture(speed,flag,flag1);
	}
	
	/**
	*@description 获取预置点信息
	*/
	var getPresets = function(cb){
		var info = pluginObject.GetPresetInfo();
		if(info != ""){
			DemoUI.clearPresets();
			var dataObject = $.parseJSON(info);
			$.each(dataObject,function(i,item){
				cb(item.Index,item.Name);
			});
		}
	}
	
	/**
	*@description 定位到预置点
	*@param{Num} index     预置点序号
	*@param{Num} speed     速度
	*/
	var gotoPreset = function(index,speed){
		return pluginObject.GotoPreset(index,speed);
	}
	
	/**
	*@description 删除预置点
	*@param{Num} index     预置点序号
	*/
	var removePreset = function(index){
		return pluginObject.RemovePreset(index);
	}
	
	/**
	*@description 设置预置点
	*@param{Num} index     预置点序号
	*@param{Num} name      预置点名称
	*/
	var setPreset = function(index,name){
		return pluginObject.SetPreset(index,name);
	}
	
	/**
	*@description 开启人流量统计查询
	*@param{String} sIP  
	*@param{Num} iChannel
	*@param{String} sStartTime 
	*@param{String} sEndTime 
	*@param{Num} iRuleType 
	*@param{Num} iSpan 
	*@param{Num} iMinStayTime 
	*@return Num
	*/
	var startTrafficDataQuery = function(sIP,iChannel,sStartTime,sEndTime,iRuleType,iSpan,iMinStayTime){
		//获得设备信息
		var ODeviceInfo = getDeviceInfo(sIP);
		if(typeof ODeviceInfo == "undefined"){
			return 0;
		}
		return pluginObject.startTrafficDataQuery(ODeviceInfo.deviceID,iChannel,sStartTime,sEndTime,iRuleType,iSpan,iMinStayTime);
	}
	
	/**
	*@description 获得信息条数
	*@param{Num} iHandle
	*@return Num
	*/
	var getTrafficDataTotalCount = function(iHandle){
		return pluginObject.getTrafficDataTotalCount(iHandle);
	}
	
	/**
	*@description 获得信息
	*@param{Num} iHandle
	*@return Num
	*/
	var queryTrafficData = function(iHandle,iBeginIndex,iCount){
		return pluginObject.queryTrafficData(iHandle,iBeginIndex,iCount);
	}
	
	var stopTrafficDataQuery = function(iHandle){
		return pluginObject.stopTrafficDataQuery(iHandle);
	}
	
	/**
	*@description 开启录像查询
	*@param{String} szIP             设备IP
	*@param{Num} iChannel            通道号
	*@param{Num} iStreamType         码流类型
	*@param{String}  szStartTime     开始时间    
	*@param{String}  szEndTime       结束时间    
	*@return String
	*/
	var startRecordInfoSearch = function(szIP,iChannel,iStreamType,szStartTime,szEndTime){
		//清除录像信息
		remoteFileInfor.length = 0;
		//获得设备信息
		var ODeviceInfo = getDeviceInfo(szIP);
		if(typeof ODeviceInfo == "undefined"){
			return 0;
		}
		return pluginObject.StartRecordInfoQuerying(ODeviceInfo.deviceID,iChannel -  1,iStreamType,0,szStartTime,szEndTime,"");
	}
	
	/**
	*@description 停止查询
	*@param{Num} iHandle             查询句柄
	*/
	var stopRecordInfoQuerying = function(iHandle){
		return pluginObject.StopRecordInfoQuerying(iHandle);
	}
	
	/**
	*@description 开启录像查询
	*@param{Num} iHandle             查询句柄
	*@param{Num} icout               查询条数
	*@return String
	*/
	var findNextRecordInfo = function(iHandle,icout){
		//查询指定条数的录像信息
		var info = pluginObject.FindNextRecordInfo(iHandle,icout);
		if(info.length != 0){
			var dataObject = $.parseJSON(info);
			remoteFileInfor.push(dataObject);
		}
		return info;
	}
	
	/**
	*@description 开启录像查询
	*@param{Num} fileInfo             文件
	*@return String
	*/
	var playRemoteFileByFile = function(fileInfo){
		var locateTime;
		var playFile;
		var find = false;
		for(var i = 0;i < remoteFileInfor.length;i ++)
		{
			if(("found" in  remoteFileInfor[i]))
			{
				var length = remoteFileInfor[i]["found"];
				if(0 != parseInt(length))
				{
					//遍历所有的节点并添加到recordInfor中
					$.each(remoteFileInfor[i].infos,function(i,item){
					var infor = item.StartTime + "--" + item.EndTime;
					if(infor == fileInfo)
					{
						locateTime = item.StartTime;
						playFile = item;
						find = true;
					}
					});
				}
			}
		}
		if(find)
		{
			var file = JSON.stringify(playFile);
			pluginObject.PlaybackRemoteRecord(file,locateTime);
		}
	}
	
	/**
	*@description 停止回放
	*/
	var stopPlayBack = function stopPlayBack(){
		return pluginObject.StopPlayBack();
	}
	
	/**
	*@description 暂停回放
	*/
	var pausePlayBack = function pausePlayBack(){
		//查询指定条数的录像信息
		return pluginObject.PausePlayBack();
	}
	
	/**
	*@description 恢复回放
	*/
	var resumePlayBack = function resumePlayBack(){
		//查询指定条数的录像信息
		return  pluginObject.ResumePlayBack();
	}
	
	/**
	*@description 快进
	*/
	var fastPlayBack = function fastPlayBack(){
		//查询指定条数的录像信息
		return  pluginObject.FastPlayBack();
	}

	/**
	*@description 慢进
	*/
	var slowPlayBack = function slowPlayBack(){
		//查询指定条数的录像信息
		return  pluginObject.SlowPlayBack();
	}
	
	/**
	*@description 开启智能
	*/
	var enableIVS = function enableIVS(){
		//查询指定条数的录像信息
		return  pluginObject.SetIVSEnable(true);
	}
	
	/**
	*@description 停止智能
	*/
	var disableIVS = function disableIVS(){
		//查询指定条数的录像信息
		return  pluginObject.SetIVSEnable(false);
	}
	
	var queryRecordFileBitmap = function(sIP,iChannel,iYear,iMonth,iRecordType){
		//获得设备信息
		var ODeviceInfo = getDeviceInfo(sIP);
		if(typeof ODeviceInfo == "undefined"){
			return "";
		}
		return pluginObject.QueryRecordFileBitmap(ODeviceInfo.deviceID,iChannel - 1,iRecordType,iYear,iMonth,"");
	}
	
	/**
	*@description 开启指定窗口的区域聚集
	*/
	var activeFocusRegion = function(){
		return pluginObject.ActiveFocusRegion(true);
	}
	
	var getConfig = function(name){
		return pluginObject.GetConfig(name);
	}
	return {
		checkPluginInstall:checkPluginInstall,
		browser:browser,
		insertPluginObject:insertPluginObject,
		createMultiNodeDisplay:createMultiNodeDisplay,
		initPlugin:initPlugin,
		setSplitNum:setSplitNum,
		login:login,
		getDeviceInfo:getDeviceInfo,
		logout:logout,
		connectRealVideo:connectRealVideo,
		getChannelNumber:getChannelNumber,
		closePlayer:closePlayer,
		closeAllPlayer:closeAllPlayer,
		getSelectedPlayerID:getSelectedPlayerID,
		getPlayerInfo:getPlayerInfo,
		getSelectedWinIndex:getSelectedWinIndex,
		startVoiceTalk:startVoiceTalk,
		stopVoiceTalk:stopVoiceTalk,
		selectDirectory:selectDirectory,
		crabOnePicture:crabOnePicture,
		startRecordingVideo:startRecordingVideo,
		stopRecordingVideo:stopRecordingVideo,
		setVolume:setVolume,
		openSound:openSound,
		closeSound:closeSound,
		enableEZoom:enableEZoom,
		disableEZoom:disableEZoom,
		setFullscreen:setFullscreen,
		getUserDirectory:getUserDirectory,
		getSelectedWinID:getSelectedWinID,
		registerEvent:registerEvent,
		controlAudio:controlAudio,
		moveUpperLeft:moveUpperLeft,
		moveUpperRight:moveUpperRight,
		moveLowerLeft:moveLowerLeft,
		moveLowerRight:moveLowerRight,
		moveLeft:moveLeft,
		moveRight:moveRight,
		moveUpwards:moveUpwards,
		moveLower:moveLower,
		enablePTZLocate:enablePTZLocate,
		disablePTZLocate:disablePTZLocate,
		controlZoom:controlZoom,
		controlFocus:controlFocus,
		controlAperture:controlAperture,
		getPresets:getPresets,
		gotoPreset:gotoPreset,
		removePreset:removePreset,
		setPreset:setPreset,
		startTrafficDataQuery:startTrafficDataQuery,
		getTrafficDataTotalCount:getTrafficDataTotalCount,
		queryTrafficData:queryTrafficData,
		stopTrafficDataQuery:stopTrafficDataQuery,
		startDevciceDetection:startDevciceDetection,
		connectRealVideoEx:connectRealVideoEx,
		selectWindow:selectWindow,
		startRecordInfoSearch:startRecordInfoSearch,
		findNextRecordInfo:findNextRecordInfo,
		playRemoteFileByFile:playRemoteFileByFile,
		stopPlayBack:stopPlayBack,
		pausePlayBack:pausePlayBack,
		resumePlayBack:resumePlayBack,
		fastPlayBack:fastPlayBack,
		slowPlayBack:slowPlayBack,
		stopRecordInfoQuerying:stopRecordInfoQuerying,
		enableIVS:enableIVS,
		disableIVS:disableIVS,
		queryRecordFileBitmap:queryRecordFileBitmap,
		activeFocusRegion:activeFocusRegion,
		getConfig:getConfig
	};
	
})(this);

$(function () {
    // 检查插件是否已经安装过
    var iRet = WebVideoCtrl.checkPluginInstall();
    if (-1 == iRet) {
        alert("您还未安装过插件，双击开发包目录里下的Package里的webplugin.exe进行安装！");
        return;
    }
});





