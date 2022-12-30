import * as React from 'react';

import classnames from 'classnames';

import * as echarts from 'echarts';

import 'echarts-gl';

import _ from 'lodash';

import { getParametricEquation } from './util'

export type EChartsProps = {
  option: any;
  opts?: {
    devicePixelRatio?: number;
    renderer?: 'canvas' | 'svg';
    useDirtyRect?: boolean;
    width?: number;
    height?: number;
    locale?: any;
  };
  theme?: string | object;
  style?: any;
  className?: string;
  getContainer?: () => HTMLElement | React.RefObject<HTMLElement>;
  onClick?: (params: any) => void;
  allowListen?: boolean;
  loop?: boolean;
  onmouseover?: () => () => void;
  onmouseout?: () => () => void;
};

type EChartOptionProperty = echarts.EChartsOption[keyof echarts.EChartsOption];

const ECharts = React.forwardRef<echarts.ECharts | undefined, EChartsProps>(
  (props, ref) => {
    const {
      style: $style,
      className,
      option,
      theme,
      opts,
      getContainer,
      onClick,
      allowListen = false,
      loop = false,
      // onmouseover,
      // onmouseout,
    } = props;

    const chartDOMRef = React.useRef<HTMLDivElement>(null);
    const cachedOptionRef = React.useRef<echarts.EChartsOption>();
    const chartInstance = React.useRef<echarts.ECharts>();
    const tooltipRef = React.useRef<NodeJS.Timeout>();

    const { width = 0, height = 0 } = { width: 0, height: 0 };

    const mergeDefaultProperty = React.useCallback(
      (
        property: any,
        defaultProperty: EChartOptionProperty,
      ) => {
        if (_.isArray(property)) {
          return property.map((item: any) => {
            if (_.isObject(item)) {
              return _.merge({}, defaultProperty, item);
            }
            return item;
          });
        }
        if (!_.isEmpty(property) && _.isObject(property)) {
          return _.merge({}, defaultProperty, property);
        }
        return property;
      },
      [],
    );

    const mergeDefaultOption = React.useCallback(
      ($option: echarts.EChartsOption) => {
        const defaultOption: echarts.EChartsOption = {
          animation: true,
          animationDuration: 3000,
          grid: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            containLabel: true,
          },
        };
        const defaultProperty: echarts.EChartsOption = {
          legend: {
            itemWidth: 16,
            itemHeight: 16,
          },
          series: {
            barWidth: 14,
          },
        };
        const mergeOption: echarts.EChartsOption = _.merge(
          {},
          defaultOption,
          $option,
        );
        Object.keys($option).forEach((key) => {
          if (key in defaultProperty) {
            mergeOption[key] = mergeDefaultProperty(
              $option[key],
              defaultProperty[key],
            );
          } else {
            mergeOption[key] = $option[key];
          }
        });
        return mergeOption;
      },
      [mergeDefaultProperty],
    );

    const setOptionHandler = React.useCallback(
      ($option: echarts.EChartsOption) => {
        if (
          chartInstance.current &&
          !chartInstance.current?.isDisposed() &&
          !_.isEmpty($option)
        ) {
          const newOption = mergeDefaultOption($option);
          // console.log(newOption, '0000');
          // if (!_.isEqual(cachedOptionRef.current, newOption)) {
          chartInstance.current.clear();
          chartInstance.current.setOption(newOption);
          cachedOptionRef.current = newOption;
          // }
        }
      },
      [mergeDefaultOption],
    );

    const onClickHandler = React.useCallback(
      (params: any) => {
        if (_.isFunction(onClick)) {
          onClick?.(params);
        }
      },
      [onClick],
    );

    // 监听鼠标事件，实现饼图选中效果（单选），近似实现高亮（放大）效果。
    // $optionName是防止有多个图表进行定向option传递，单个图表可以不传，默认是opiton
    const handleListen = React.useCallback(
      (myChart: echarts.ECharts) => {
        let hoveredIndex: number | undefined = 0;
        const $option: any = { ...option };
        // 监听 mouseover，近似实现高亮（放大）效果
        // 监听 mouseover，近似实现高亮（放大）效果
        myChart.on('mouseover', (params) => {
          // 准备重新渲染扇形所需的参数
          let isSelected;
          let isHovered;
          let startRatio;
          let endRatio;
          let k;
          const { seriesIndex } = params;
          // 如果触发 mouseover 的扇形当前已高亮，则不做操作
          if (hoveredIndex === seriesIndex) {
            // 否则进行高亮及必要的取消高亮操作
          } else {
            // 如果当前有高亮的扇形，取消其高亮状态（对 option 更新）
            if (
              (hoveredIndex || 0 === hoveredIndex) &&
              _.isArray($option.series) &&
              $option.series[hoveredIndex]
            ) {
              const seriesItem = $option.series[hoveredIndex];
              // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 false。
              isSelected = false;
              isHovered = false;
              startRatio = seriesItem.pieData.startRatio;
              endRatio = seriesItem.pieData.endRatio;
              k = seriesItem.pieStatus.k;
              const $height =
                0 === hoveredIndex
                  ? $option.series[hoveredIndex].pieData.height - 3
                  : $option.series[hoveredIndex].pieData.height;
              // 对当前点击的扇形，执行取消高亮操作（对 option 更新）
              $option.series[hoveredIndex].parametricEquation =
                getParametricEquation(
                  startRatio,
                  endRatio,
                  isSelected,
                  isHovered,
                  k,
                  $height,
                );
              $option.series[hoveredIndex].pieStatus.hovered = isHovered;
              // 将此前记录的上次选中的扇形对应的系列号 seriesIndex 清空
              hoveredIndex = undefined;
            }
            // 触发 mouseover 将其高亮（对 option 更新）
            if (
              _.isArray($option.series) &&
              (seriesIndex || 0 === seriesIndex) &&
              $option.series[seriesIndex]
            ) {
              const seriesItem = $option.series[seriesIndex];
              // 从 option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 true。
              isSelected = false;
              isHovered = true;
              startRatio = seriesItem.pieData.startRatio;
              endRatio = seriesItem.pieData.endRatio;
              k = seriesItem.pieStatus.k;
              const $height =
                0 === seriesIndex
                  ? seriesItem.pieData.height
                  : seriesItem.pieData.height + 3;
              // console.log(seriesItem, 'seriesItem');
              // 对当前点击的扇形，执行高亮操作（对 option 更新）
              $option.series[seriesIndex].parametricEquation =
                getParametricEquation(
                  startRatio,
                  endRatio,
                  isSelected,
                  isHovered,
                  k,
                  $height,
                );
              $option.series[seriesIndex].pieStatus.hovered = isHovered;
              $option.title.text = seriesItem.pieData.per;
              $option.title.subtext = seriesItem.pieData.name;
              // 记录上次高亮的扇形对应的系列号 seriesIndex
              hoveredIndex = seriesIndex;
              // 使用更新后的 option，渲染图表
              chartInstance.current?.setOption({ ...$option });
            }
          }
        });
        // 修正取消高亮失败的 bug
        myChart.on('globalout', () => {
          // 准备重新渲染扇形所需的参数
          let isSelected;
          let isHovered;
          let startRatio;
          let endRatio;
          let k;
          $option.title.show = true;
          if (hoveredIndex && _.isArray($option.series)) {
            const seriesItem = $option.series[hoveredIndex];
            // 从 $option.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 true。
            isSelected = false;
            isHovered = false;
            k = seriesItem.pieStatus.k;
            startRatio = seriesItem.pieData.startRatio;
            endRatio = seriesItem.pieData.endRatio;
            // 对当前点击的扇形，执行取消高亮操作（对 $option 更新）
            $option.series[hoveredIndex].parametricEquation =
              getParametricEquation(
                startRatio,
                endRatio,
                isSelected,
                isHovered,
                k,
                $option.series[hoveredIndex].pieData.height,
              );
            $option.series[hoveredIndex].pieStatus.hovered = isHovered;
            // 将此前记录的上次选中的扇形对应的系列号 seriesIndex 清空
            hoveredIndex = 0;
            $option.series[0].parametricEquation = getParametricEquation(
              $option.series[0].pieData.startRatio,
              $option.series[0].pieData.endRatio,
              $option.series[0].pieData.isSelected,
              $option.series[0].pieData.isHovered,
              $option.series[0].pieData.k,
              $option.series[0].pieData.height,
            );
            $option.title.text = $option.series[0].pieData.per;
            $option.title.subtext = $option.series[0].pieData.name;
          }
          // 使用更新后的 option，渲染图表
          chartInstance.current?.setOption({ ...$option });
        });
      },
      [option],
    );

    // tooltip 轮播
    const getTooltipLoop = React.useCallback(() => {
      let currentIndex = -1;
      tooltipRef.current = setInterval(() => {
        let dataLen = 0;
        if (_.isArray(option.series) && _.isArray(option?.series[0].data)) {
          dataLen = option?.series[0].data.length;
        } else if (_.isArray(option.series)) {
          dataLen = option.series?.length;
        }
        // 取消之前高亮的图形
        chartInstance.current?.dispatchAction({
          type: 'downplay',
          seriesIndex: 0, // 表示series中的第几个data数据循环展示
          dataIndex: currentIndex,
        });
        currentIndex = (currentIndex + 1) % dataLen; // +1表示每次跳转一个
        // 高亮当前图形
        chartInstance.current?.dispatchAction({
          type: 'highlight',
          seriesIndex: 0,
          dataIndex: currentIndex,
        });
        // 显示 tooltip
        chartInstance.current?.dispatchAction({
          type: 'showTip',
          seriesIndex: 0,
          dataIndex: currentIndex,
        });
      }, 3000);
    }, [option.series]);

    React.useEffect(() => {
      if (chartDOMRef.current) {
        chartInstance.current = echarts.init(chartDOMRef.current, theme, opts);
        chartInstance.current.on('click', onClickHandler);
        if (allowListen) {
          handleListen(chartInstance.current);
        }

        if (tooltipRef.current) {
          clearTimeout(tooltipRef.current);
        }
        if (loop) {
          getTooltipLoop();
        }
      }
    }, [
      opts,
      theme,
      onClickHandler,
      allowListen,
      handleListen,
      loop,
      getTooltipLoop,
    ]);

    React.useEffect(() => {
      setOptionHandler(option);
    }, [option, setOptionHandler]);

    const resizeTimeoutRef = React.useRef<NodeJS.Timeout>();
    React.useEffect(() => {
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      resizeTimeoutRef.current = setTimeout(() => {
        if (!chartInstance.current?.isDisposed()) {
          chartInstance.current?.resize();
        }
      }, 200);
    }, [getContainer, width, height]);

    // useUnmount(() => {
    //   if (resizeTimeoutRef.current) {
    //     clearTimeout(resizeTimeoutRef.current);
    //   }
    //   if (chartInstance.current && !chartInstance.current?.isDisposed()) {
    //     chartInstance.current.dispose();
    //   }
    //   if (tooltipRef.current) {
    //     clearTimeout(tooltipRef.current);
    //   }
    // });

    React.useImperativeHandle(ref, () => chartInstance.current);

    return (
      <div
        ref={chartDOMRef}
        className={classnames($style.echarts, className)}
        style={$style}
      />
    );
  },
);

export default ECharts;


