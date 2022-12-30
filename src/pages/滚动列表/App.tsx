/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react'
import './app.less'

export default function App () {

  const data = [
    { title: '测试内容1', key: 1 },
    { title: '测试内容2', key: 2 },
    { title: '测试内容3', key: 3 },
    { title: '测试内容4', key: 4 },
    { title: '测试内容5', key: 5 },
  ]

  useEffect(() => {
    handleScroll(40)
  }, [])

  let timer: any = null
  const handleScroll = (delay: number) => {
    const ul1: any = document.querySelector('.App__content-scroll')
    const ul2: any = document.querySelector('.App__content-assist')
    const ulbox: any = document.querySelector('.App__content')
    ul2.innerHTML = ul1.innerHTML;
    ulbox.scrollTop = 0;
    rollStart(delay)
  }

  const rollStart = (delay: number) => {
    const ul1: any = document.querySelector('.App__content-scroll')
    const ulbox: any = document.querySelector('.App__content')
    timer && rollStop()
    timer = setInterval(() => {
      // 当滚动高度大于列表内容高度时恢复为0
      if (ulbox.scrollTop >= ul1.scrollHeight) {
        ulbox.scrollTop = 0;
      } else {
        ulbox.scrollTop++;
      }
    }, delay);
  }

  const rollStop = () => {
    clearInterval(timer)
  }

  return (
    <div className='App'>
      <div
        onMouseEnter={() => rollStop()}
        onMouseLeave={() => rollStart(40)}
        className='App__content'
      >
        <div className='App__content-scroll'>
          {
            data.map((item: any) => {
              return (
                <div key={item.key}>
                  {item.title}
                </div>
              )
            })
          }
        </div>
        <div className='App__content-assist'></div>
      </div>
    </div>
  )
}