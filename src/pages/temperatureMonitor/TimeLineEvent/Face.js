import React from 'react';

class Face extends React.Component {
  onClick = () => {
    const { data, onClick } = this.props;
    onClick && onClick(data);
  };
  render() {
    const { data } = this.props;
    return (
      <div onClick={this.onClick}>
        <div title={data.cameraName} style={{ height: 21, maxWidth: 120, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {data.cameraName}
        </div>
        <div style={{ border: 2, margin: 8, width: 120, height: 150 }}>
          <img style={{ width: 100, height: 100, borderRadius: 2 }} src={data.imageData} />
          <div
            style={{
              width: 100,
              height: 20,
              marginTop: 10,
              border: '1px solid #e1e1e1',
              borderRadius: 3,
              lineHeight: '18px',
            }}
          >
            <span
              style={{
                width: 58,
                color: '#80868e',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              {data.timeStamp}
            </span>
            <span
              style={{
                width: 40,
                color: '#fff',
                background: '#77b6ed',
                overflow: 'hidden',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                display: 'inline-block',
                textAlign: 'center',
              }}
            >
              {`${(data.confidence * 100).toFixed(1)}%`}
            </span>
          </div>
        </div>
      </div>
    );
  }
}

export default Face;
