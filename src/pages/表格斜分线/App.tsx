/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useMemo, useState } from 'react'
import { omit } from 'lodash'
import 'app.less'

type Props = {
  extra?: string[],
  rowHead?: string[],
  columnHead?: string[],
  dataSource?: any[]
}

const App = (props: Props) => {

  const tableConfig = useMemo(() => {
    const extra = ['变量', '中间内容', '参数']
    const rowHead = ['参数一', '参数二']
    const colHead = ['变量一', '变量二']
    const dataSource = [
      { data1: '内容一', data2: '内容二', dataIndex: '变量一' },
      { data1: 111111, data2: 222222, dataIndex: '变量二' }
    ]

    return { extra, rowHead, colHead, dataSource }
  }, [])

  const [position, setPosition] = useState<any>({})
  const [angle, setAngle] = useState<any>({})
  useEffect(() => {
    resizeUpdate()
  }, [])

  const resizeUpdate = (evt?: Event) => {
    const extraDom: any = document.querySelector('.App__row-extra')?.getBoundingClientRect() || {}
    const coordinates = [
      { x: extraDom.x, y: (extraDom.y + extraDom.bottom) / 2 },
      { x: (extraDom.x + extraDom.right) / 2, y: extraDom.y }
    ]
    const rotateCoordinate = { x: extraDom.right, y: extraDom.bottom } // 旋转点坐标
    tableConfig.extra.forEach((item: string, index: number) => {
      // 设置线条的旋转角度
      if (coordinates[index]) {
        const radian = Math.atan2(rotateCoordinate.y - coordinates[index].y, rotateCoordinate.x - coordinates[index].x) // 计算弧度
        const rotate = Math.round((180 / Math.PI * radian)) // 弧度转角度
        setAngle((prev: any) => ({ ...prev, [index]: rotate }))
      }
      // 设置文字的定位
      index === 0 && setPosition((prev: any) => ({ ...prev, [index]: { left: '25%', bottom: 0 } }))
      index === 1 && setPosition((prev: any) => ({ ...prev, [index]: { left: '40%', top: '40%' } }))
      index === 2 && setPosition((prev: any) => ({ ...prev, [index]: { right: '5%', top: '25%' } }))
    })
  }

  useEffect(() => {
    // 监听窗口大小变化, 计算旋转角度
    window.addEventListener('resize', resizeUpdate)

    return () => window.removeEventListener('resize', resizeUpdate)
  }, [])

  return (
    <div className='App'>
      <table>
        <thead>
          <tr className='App__row'>
            <th className='App__row-extra'>
              {
                tableConfig.extra.length
                  ? (
                    <React.Fragment>
                      {
                        tableConfig.extra.map((item: string, index: number) => {
                          const rotateStyle = { transform: `rotate(${angle[index]}deg)` }
                          const positionStyle = position[index]
                          const isLast: boolean = index + 1 === tableConfig.extra.length
                          return (
                            <React.Fragment key={item}>
                              <p className={`${!isLast ? 'App__row-extra--item' : ''}`} style={rotateStyle}></p>
                              <span style={positionStyle}>{item}</span>
                            </React.Fragment>
                          )
                        })
                      }
                    </React.Fragment>
                  )
                  : null
              }
            </th>
            {tableConfig.rowHead.map((head: string) => <th key={head} className='App__row-head'>{head}</th>)}
          </tr>
        </thead>
        <tbody>
          {
            tableConfig.colHead.map((head: string) => {
              const find = tableConfig.dataSource.find((item: any) => item.dataIndex === head) || {}
              const tds = Object.values(omit(find, 'dataIndex'))
              return (
                <tr key={head} className='App__col'>
                  <td className='App__col-head'>{head}</td>
                  {tds.map((value: any) => <td key={value} className='App__col-td'>{value}</td>)}
                </tr>
              )
            })
          }
        </tbody>
      </table>
    </div>
  )
}

export default App