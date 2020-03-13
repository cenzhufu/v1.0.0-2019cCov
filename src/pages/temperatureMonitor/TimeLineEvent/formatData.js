import moment from 'moment';

export const formatDataPerDay = datas => {
  var dayKey = [];
  var dayData = [];
  datas.forEach((data, index) => {
    const { time, sourceId } = data;
    data.day = moment(time).format('MM-DD');
    data.timeStamp = moment(time).format('HH:mm:ss');

    if (dayKey.indexOf(data.day) == -1) {
      dayKey.push(data.day);
      dayData.push({ day: data.day, dayData: [], name: data.name });
    }
  });
  console.log('datas', datas);
  var iLen = dayData.length;
  var jLen = datas.length;
  for (var i = 0; i < iLen; i++) {
    for (var j = 0; j < jLen; j++) {
      if (datas[j].day == dayData[i].day) {
        dayData[i].dayData.push(datas[j]);
      }
    }
  }
  return dayData;
};

export const formatDataPerHour = dayDatas => {
  dayDatas.forEach((dayData, index) => {
    let hourKey = [];
    let hourData = [];

    dayData.dayData.forEach(d => {
      const { time } = d;
      d.hour = moment(time).format('HH');
      if (hourKey.indexOf(d.hour) == -1) {
        hourKey.push(d.hour);
        hourData.push({ hour: d.hour, data: [] });
      }
    });

    var iLen = hourData.length;
    var jLen = dayData.dayData.length;
    for (var i = 0; i < iLen; i++) {
      for (var j = 0; j < jLen; j++) {
        if (dayData.dayData[j].hour == hourData[i].hour) {
          hourData[i].data.push(dayData.dayData[j]);
        }
      }
    }
    dayDatas[index].dayData = hourData;
  });
  console.log('timeline datasource-dayDatas', dayDatas);
  return dayDatas;
};

export const formatData = data => {
  var dataArr = [];
  var singleArr = [];
  var day = '',
    hour = '';
  if (!data) {
    return;
  }
  for (let i = 0; i < data.length; i++) {
    data[i].day = moment(data[i].time).format('MM-DD');
    data[i].timeStamp = moment(data[i].time).format('HH:mm:ss');
    data[i].hour = moment(data[i].time).format('HH');
    if (day == data[i].day && hour == data[i].hour) {
      singleArr.push(data[i]);
    } else {
      day = data[i].day;
      hour = data[i].hour;
      if (singleArr.length !== 0) {
        dataArr.push(singleArr.slice(0));
        singleArr = [data[i]];
      } else {
        singleArr.push(data[i]);
      }
    }
    if (i == data.length - 1 && singleArr.length !== 0) {
      dataArr.push(singleArr.slice(0));
      singleArr = [];
    }
  }
  return dataArr;
};

export const formatTimeLineData = data => {
  return formatDataPerHour(formatDataPerDay(data));
};

export const formatMonitorTimeLineData = data => {
  let dateObj = {};
  let dateLocationObj = {};

  // 生成符合事件流格式的数据结构，第一步：生成key为日期的对象
  for (let i = 0; i < data.length; i += 1) {
    let recordDate =
      new Date(data[i].alarmTime).getMonth() +
      1 +
      ' - ' +
      new Date(data[i].alarmTime).getDate();
    if (dateObj.hasOwnProperty(recordDate)) {
      dateObj[recordDate].push(data[i]);
    } else {
      dateObj[recordDate] = [];
      dateObj[recordDate].push(data[i]);
    }
  }

  // 生成符合事件流格式的数据结构，第二步：将key为日期的对象的value，够造成key为cameraId的子对象
  for (let d in dateObj) {
    dateLocationObj[d] = {};
    for (let i = 0; i < dateObj[d].length; i += 1) {
      let cameraName = dateObj[d][i].cameraName;
      if (dateLocationObj[d].hasOwnProperty(cameraName)) {
        dateLocationObj[d][cameraName].push(dateObj[d][i]);
      } else {
        dateLocationObj[d][cameraName] = [];
        dateLocationObj[d][cameraName].push(dateObj[d][i]);
      }
    }
  }

  return dateLocationObj;
};

// export const formatPersonTimeLineData = data => {
//   let dateObj = {};
//   let dateLocationObj = {};

//   // 生成符合事件流格式的数据结构，第一步：生成key为日期的对象
//   for (let i = 0; i < data.length; i += 1) {
//     let recordDate =
//       new Date(data[i].time).getMonth() +
//       1 +
//       ' - ' +
//       new Date(data[i].time).getDate();
//     if (dateObj.hasOwnProperty(recordDate)) {
//       dateObj[recordDate].push(data[i]);
//     } else {
//       dateObj[recordDate] = [];
//       dateObj[recordDate].push(data[i]);
//     }
//   }

//   // 生成符合事件流格式的数据结构，第二步：将key为日期的对象的value，够造成key为cameraId的子对象
//   for (let d in dateObj) {
//     dateLocationObj[d] = {};
//     for (let i = 0; i < dateObj[d].length; i += 1) {
//       let cameraName = dateObj[d][i].cameraName;
//       if (dateLocationObj[d].hasOwnProperty(cameraName)) {
//         dateLocationObj[d][cameraName].push(dateObj[d][i]);
//       } else {
//         dateLocationObj[d][cameraName] = [];
//         dateLocationObj[d][cameraName].push(dateObj[d][i]);
//       }
//     }
//     console.log('zkf-dateLocationObj-single', dateLocationObj[d]);
//   }
//   console.log('zkf-dateLocationObj', dateLocationObj);

//   return dateLocationObj;
// };
export const formatPersonTimeLineData = data => {
  var dataArr = [];
  var singleArr = [];
  var day = '',
    hour = '';
  if (!data) {
    return;
  }
  for (let i = 0; i < data.length; i++) {
    data[i].day = moment(data[i].time).format('MM-DD');
    data[i].timeStamp = moment(data[i].time).format('HH:mm:ss');
    data[i].hour = moment(data[i].time).format('HH');
    if (data[i].cameraId == '-1') {
      if (singleArr.length !== 0) {
        dataArr.push(singleArr.slice(0));
        singleArr = [];
      }
      dataArr.push([data[i]].slice(0));
    } else {
      if (day == data[i].day && hour == data[i].hour) {
        singleArr.push(data[i]);
      } else {
        day = data[i].day;
        hour = data[i].hour;
        if (singleArr.length !== 0) {
          dataArr.push(singleArr.slice(0));
          singleArr = [data[i]];
        } else {
          singleArr.push(data[i]);
        }
      }
    }
    if (i == data.length - 1 && singleArr.length !== 0) {
      dataArr.push(singleArr.slice(0));
      singleArr = [];
    }
  }
  return dataArr;
};

//生成符合徘徊事件流的格式的数据结构
export const formatHoverTimeLineData = data => {
  let dateObj = {};
  let dateLocationObj = {};

  //生成dateObj对象，key为日期
  for (let i = 0; i < data.length; i++) {
    let date =
      new Date(data[i].hoverevent.startTime).getMonth() +
      1 +
      '-' +
      new Date(data[i].hoverevent.startTime).getDate();
    if (dateObj.hasOwnProperty(date)) {
      dateObj[date].push(data[i]);
    } else {
      dateObj[date] = [];
      dateObj[date].push(data[i]);
    }
  }

  //将dateObj对象的value转成对象
  for (let d in dateObj) {
    dateLocationObj[d] = {
      count: 0,
      cameras: {}
    };
    for (let i = 0; i < dateObj[d].length; i++) {
      let cameraName = dateObj[d][i].hoverevent.cameraName;
      let startTime = moment(dateObj[d][i].hoverevent.startTime).format(
        'HH:mm:ss'
      );
      let endTime = moment(dateObj[d][i].hoverevent.endTime).format('HH:mm:ss');
      let cameraKey = cameraName + ',' + startTime + '——' + endTime;
      //徘徊
      if (dateLocationObj[d].cameras[cameraKey]) {
        dateLocationObj[d].cameras[cameraKey].hoverFace = dateLocationObj[
          d
        ].cameras[cameraKey].hoverFace.concat(dateObj[d][i].faceList);
      } else {
        dateLocationObj[d].cameras[cameraKey] = {
          hoverFace: dateObj[d][i].faceList
        };
      }
      dateLocationObj[d].count++;
    }
  }
  console.log('formatAnalysisTimeLineData eventType: ', dateLocationObj);
  return dateLocationObj;
};

//生成符合同行事件流的格式的数据结构
export const formatPeerTimeLineData = data => {
  let dateObj = {};
  let dateLocationObj = {};

  //生成dateObj对象，key为日期
  for (let i = 0; i < data.length; i++) {
    let Month = new Date(data[i].startTime).getMonth() + 1;
    let day = new Date(data[i].startTime).getDate();
    if(Month<10) Month = "0" + Month;
    if(day<10) day = "0" + day;
    let date =Month + ' - ' + day;
    if (dateObj.hasOwnProperty(date)) {
      dateObj[date].push(data[i]);
    } else {
      dateObj[date] = [];
      dateObj[date].push(data[i]);
    }
  }

  //将dateObj对象的value转成对象
  for (let d in dateObj) {
    dateLocationObj[d] = {
      count: 0,
      cameras: {}
    };
    for (let i = 0; i < dateObj[d].length; i++) {
      let cameraName = dateObj[d][i].cameraName;
      let startTime = dateObj[d][i].startTime.split(' ')[1];
      let endTime = dateObj[d][i].endTime.split(' ')[1];
      let cameraKey = cameraName + ',' + startTime + '——' + endTime;
      let peerFace = dateObj[d][i].faces.map((value, index) => {
        value.camera = dateObj[d][i].cameraId;
        return value;
      });
      dateLocationObj[d].cameras[cameraKey] = {
        // cameraId: dateObj[d][i].cameraId,
        personFace: {
          faceId: dateObj[d][i].faceId,
          faceUrl: dateObj[d][i].faceUrl,
          time: dateObj[d][i].time,
          confidence: dateObj[d][i].confidence,
          camera: dateObj[d][i].cameraId
        },
        peerFace: peerFace
      };
      dateLocationObj[d].count++;
    }
  }
  // console.log('formatAnalysisTimeLineData eventType: ', dateLocationObj);
  return dateLocationObj;
};

// 生成符合活动区域分析事件流的数据结构、
export const formatDataArea = (data = []) => {
  let newDatas = [];
  let singleData = [];
  data.length &&
    data.forEach((value, index) => {
      let day = value.time.split(' ')[0];
      singleData.push(value);
      if (
        index < data.length - 1 &&
        day !== data[index + 1].time.split(' ')[0]
      ) {
        newDatas.push({
          day: day,
          faces: singleData
        });
        singleData = [];
      } else if (index == data.length - 1) {
        newDatas.push({
          day: day,
          faces: singleData
        });
      } else {
      }
    });

  console.log('sdj 自己拼接的数据结构 newDatas', newDatas);
  return newDatas;
};
