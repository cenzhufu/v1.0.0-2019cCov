import mqtt from 'mqtt';
// import config from '../../utils/config';

// NORMAL(0),    // 正常告警
// STRANGER(1),  // 陌生人告警
// EXCEPTIONAL_TIME(2),   // 异常时间告警
// MISSING(3);            // 人员失踪告警
// 对应mqtt告警消息的NoticeType

function parseAlarm(str) {
  var alarmObj = {};
  str
    .replace(/"/g, '')
    .slice(1, -1)
    .split(',')
    .forEach(function (item) {
      var key = item.split(':')[0].trim();
      var value = item.split(':')[1].trim();
      alarmObj[key] = value;
    });
  return alarmObj;
}

export default {
  connect() {
    var client = mqtt.connect({
      host: window.config.environments.mqttServer.host,
      port: window.config.environments.mqttServer.port,
      clientId: 'IF_MQTT_JS_Client/' +
        Math.random()
          .toString(16)
          .substr(2, 8)
    });
    client.parseAlarm = str => {
      var alarmObj = {};
      str
        .replace(/'/g, '')
        .slice(1, -1)
        .split(',')
        .forEach(function (item) {
          var key = item.split(':')[0].trim();
          var value = item.split(':')[1].trim();
          alarmObj[key] = value;
        });
      return alarmObj;
    };
    client.on('connect', function () {
      client.subscribe('TempAlarm', function () {
        console.log('温度告警mqtt预订消息成功');
      });

    });
    client.on('reconnect', function () {
      console.log('mqtt正在尝试重新连接...');
    });

    client.on('offline', function () {
      console.log('mqtt连接出错');
      client.unsubscribe('TempAlarm');
    });

    client.on('close', function () {
      console.log('MQTT服务成功关闭!');
    });
    return client;
  },
  listen(client, cb) {
    // client.subscribe('0/#', function() {
    //   console.log('mqtt预订消息成功');
    // });
    client.on('message', function (topic, message) {
      if (message.toString().indexOf("'AlarmId':-1") !== -1) return;
      var message_str = message.toString().replace(/'/g, '"');
      try {
        JSON.parse(message_str);
      } catch (error) {
        console.log('csj message_str err', message_str);
        return;
      }
      const AlarmId = message_str.split(',')[0].split(':')[1];
      const FaceId =
        message_str.split('"FaceId":').length > 1 &&
        message_str.split('"FaceId":')[1].split(',')[0];
      var res = JSON.parse(message_str);
      res.AlarmId = AlarmId;
      res.FaceId = FaceId;
      res.CameraId = Number(topic.split('/')[1]);
      typeof cb == 'function' && cb(res);
    });
  },
  unsubscribe(client) {
    if(client) {
      client.unsubscribe('TempAlarm', function () {
        console.log('mqtt取消预订');
      });
    }
   
  }
};