import React from 'react';
import classNames from 'classnames';
import './style/TimelineItem.css';

export default class extends React.Component {
  static defaultProps = {
    prefixCls: 'ant-timeline',
    color: 'blue',
    first: false,
    last: false,
    pending: false
  };

  render() {
    const {
      prefixCls,
      className,
      color = '',
      first,
      last,
      leftContent,
      content,
      pending,
      showDot,
      dot,
      ...restProps
    } = this.props;

    const itemClassName = classNames(
      {
        ['deepEye_timeLine']: true,
        [`${prefixCls}-item`]: true,
        [`${prefixCls}-item-last`]: last,
        [`${prefixCls}-item-pending`]: pending
      },
      className
    );

    const tailClassName = classNames(
      {
        [`${prefixCls}-item-tail`]: true,
        [`${prefixCls}-item-first`]: first
      },
      className
    );

    const dotClassName = showDot
      ? classNames({
          [`${prefixCls}-item-head`]: true,
          [`${prefixCls}-item-head-custom`]: dot,
          [`${prefixCls}-item-head-${color}`]: true
        })
      : '';

    return (
      <li {...restProps} className={itemClassName}>
        <div className="left_content">{leftContent}</div>
        <div className={tailClassName} />
        <div
          className={dotClassName}
          style={{ borderColor: /blue|red|green/.test(color) ? null : color }}
        >
          {dot}
        </div>
        <div style={{width: '100%', display: 'flex', flexWrap: 'wrap'}} className={`${prefixCls}-item-content`}>{content}</div>
      </li>
    );
  }
}
