import React, { Component } from "react";
class AlarmAudio extends Component {
  static defaultProps = {
    alarmType: "temp", // temp  疑似发热   noMask  未戴口罩
    alarmBell: ""
  };
  componentDidMount() {
    document.getElementById("audio").play();
  }
  render() {
    const { alarmBell, alarmType } = this.props;
    console.log("播放声音alarmBell", { alarmBell });
    return (
      <div>
        {alarmBell && <audio id="audio" src={alarmBell} />}
        {!alarmBell && (
          <audio
            id="audio"
            src={
              alarmType === "temp"
                ? require("../assets/video/tempAlarm.mp3")
                : require("../assets/video/noMaskAlarm.mp3")
            }
          />
        )}
      </div>
    );
  }
}

export default AlarmAudio;
