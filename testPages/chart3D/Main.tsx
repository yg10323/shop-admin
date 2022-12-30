import React from 'react';
import ECharts from './Chart';
import { getParametricEquation } from './util';

const source = [
  {
    name: '男',
    value: 4,
    height: 4,
    per: '40%',
    itemStyle: {
      color: '#66E1DF',
    },
  },
  {
    name: '男2',
    value: 2,
    height: 2,
    per: '20%',
    itemStyle: {
      color: '#6A14FF',
    },
  },
  {
    name: '女',
    value: 2,
    height: 2,
    per: '20%',
    itemStyle: {
      color: '#0D97FF',
    },
  },
  {
    name: '女2',
    value: 2,
    height: 2,
    per: '20%',
    itemStyle: {
      color: '#34FFBF',
    },
  },
];

const Page = () => {
  const { data } = React.useContext(context);
  const { tradeAmountGroupDtoList: list } = data;
  const $list = list
    ? list?.map((item: any, index: any) => ({
      height: source[index].height,
      name: item.groupName,
      per: `${(item.proportion || 0) * 100}%`,
      value: Number(item.tradeCount),
      itemStyle: source[index].itemStyle,
    }))
    : [];
  console.log($list);

  const getPie3D = React.useCallback(
    (pieData: any[], internalDiameterRatio: number) => {
      const series: any[] = [];
      let sumValue = 0;
      let startValue = 0;
      let endValue = 0;
      const k = internalDiameterRatio || 1 / 5;

      // 为每一个饼图数据，生成一个 series-surface 配置
      for (let i = 0; i < pieData.length; i++) {
        sumValue += pieData[i].value;

        const seriesItem = {
          name:
            'undefined' === typeof pieData[i].name
              ? `series${i}`
              : pieData[i].name,
          type: 'surface',
          parametric: true,
          wireframe: {
            show: false,
          },
          pieData: pieData[i],
          pieStatus: {
            selected: false,
            hovered: false,
            k,
          },
          itemStyle: {},
        };

        if (pieData[i].itemStyle) {
          const itemStyle: any = {};
          if (pieData[i].itemStyle.color) {
            itemStyle.color = pieData[i].itemStyle.color;
          }
          if (pieData[i].itemStyle.opacity) {
            itemStyle.opacity = pieData[i].itemStyle.opacity;
          }

          seriesItem.itemStyle = itemStyle;
        }
        series.push(seriesItem);
      }

      // 使用上一次遍历时，计算出的数据和 sumValue，调用 getParametricEquation 函数，
      // 向每个 series-surface 传入不同的参数方程 series-surface.parametricEquation，也就是实现每一个扇形。
      for (let i = 0; i < series.length; i++) {
        endValue = startValue + series[i].pieData.value;
        series[i].pieData.startRatio = startValue / sumValue;
        series[i].pieData.endRatio = endValue / sumValue;
        series[i].parametricEquation = getParametricEquation(
          series[i].pieData.startRatio,
          series[i].pieData.endRatio,
          series[i].pieStatus.selected,
          series[i].pieStatus.hovered,
          k,
          series[i].pieData.height,
        );
        startValue = endValue;
      }

      const $option = {
        tooltip: {
          show: false,
        },
        title: {
          show: true,
          text: series[0]?.pieData?.per || '0%',
          subtext: series[0]?.pieData?.name || '',
          textStyle: {
            color: '#fff',
            fontFamily: 'FCBTT',
            fontSize: '70px',
          },
          subtextStyle: {
            fontSize: '30px',
            color: '#fff',
          },
          left: 'center',
          top: '15%',
        },
        legend: {
          bottom: 40,
          itemGap: 20,
          textStyle: {
            color: '#fff',
            fontSize: 20,
          },
        },
        xAxis3D: {
          min: -1,
          max: 1,
        },
        yAxis3D: {
          min: -1,
          max: 1,
        },
        zAxis3D: {
          min: -1,
          max: 1,
        },
        grid3D: {
          show: false,
          bottom: '10%',
          boxHeight: 10,
          boxDepth: 100,
          environment: 'auto', // 背景色,auto为自适应颜色
          viewControl: {
            distance: 170,
            alpha: 12,
            beta: 45,
            rotateSensitivity: 0, // 禁止拖动旋转
            zoomSensitivity: 0, // 禁止缩放
          },
        },
        series,
      };

      return $option;
    },
    [],
  );

  return (
    <div>
      <ECharts option={getPie3D(source, 0.2)} allowListen />
    </div>
  );
};

export default Page;

