import { useEffect, useRef, useState } from 'react'
import { InputNumber } from 'antd'
import './app.less'

export default function App () {
  const prePercent = useRef<number>(0)
  const [percent, setPercent] = useState<any>(0)

  useEffect(() => {
    let timer: any = null
    const progressLeft = document.querySelector('.progressLeft') as HTMLElement
    const progressRight = document.querySelector('.progressRight') as HTMLElement
    const comPercent = percent > 100 ? 100 : percent < 0 ? 0 : percent
    const angle = 360 / 100 * comPercent

    if (angle > 180) {
      progressLeft.style.transform = 'rotate(180deg)'
      timer = setTimeout(() => {
        progressRight.style.transform = `rotate(${angle - 180}deg)`
      }, 1400)
    } else {
      progressRight.style.transform = 'rotate(0deg)'
      progressLeft.style.transform = `rotate(${angle}deg)`
    }

    return () => clearTimeout(timer)
  }, [percent])

  const handlePercentChange = (value: any) => {
    prePercent.current = percent
    setPercent(value)
  }

  return (
    <div className='app'>
      <InputNumber value={percent} onChange={handlePercentChange} />
      <div className='positon'>
        <div className='circle__outer'>
          <div className='circle__progressLeft-wrap'>
            <div className='progressLeft'></div>
          </div>
          <div className='circle__progressRight-wrap'>
            <div className='progressRight'></div>
          </div>
          <div className='circle__inner'>
            <span>{percent}%</span>
            <span className='circle__inner-title'>这是标题</span>
            <span className='circle__inner-desc'>这是一段描述内容asd</span>
          </div>
        </div>
      </div>
    </div>
  )
}