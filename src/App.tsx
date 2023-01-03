/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react'
import NodeList from './nodeList'
import './app.less'

const App = () => {
  const carouselRef = useRef<any>(null)
  const repeatTimer = useRef<any>(null)
  const delayTimer = useRef<any>(null)

  const nodeIndex = useRef<number>(0)
  const [activeNode, setActiveNode] = useState<any>(null)
  console.log('activeNode', activeNode)

  useEffect(() => {
    const scroll = carouselRef.current.getElementsByClassName('scrollWrap')[0]
    const scrollItems = Array.from(carouselRef.current.getElementsByClassName('scroll-item')) as any[]
    scrollItems.forEach((item: any) => {
      scroll.appendChild(item.cloneNode(true))
    })
  }, [])

  useEffect(() => {
    const first = NodeList?.[0]
    first && setActiveNode(first)
  }, [NodeList.length])

  // 开始滚动
  const scrollStart = (delay: number = 1000 * 10) => {
    repeatTimer.current && scrollStop()
    const scroll = carouselRef.current.getElementsByClassName('scrollWrap')[0]
    const scrollItems = Array.from(carouselRef.current.getElementsByClassName('scroll-item')) as any[]
    scroll.style.width = scrollItems[0].offsetWidth * scrollItems.length + 'px'
    repeatTimer.current = setInterval(() => {
      if (scroll.offsetLeft === -scroll.offsetWidth / 2) {
        scroll.style.left = '0px'
        scroll.style.transition = 'none'
        nodeIndex.current = 0
      } else {
        scroll.style.left = scroll.offsetLeft + - scrollItems[0].offsetWidth + 'px'
        scroll.style.transition = 'left .7s linear'
        ++nodeIndex.current
      }
      nodeIndex.current = nodeIndex.current >= scrollItems.length ? 0 : nodeIndex.current
      console.log('nodeIndex.current', nodeIndex.current)
      setActiveNode(NodeList?.[nodeIndex.current] || NodeList?.[0])
    }, delay)
  }

  // 停止滚动
  const scrollStop = () => {
    clearInterval(repeatTimer.current)
  }

  const isMove = useRef<boolean>(false)
  // 上一个
  const handlePrev = () => {
    if (isMove.current) return

    isMove.current = true
    repeatTimer.current && scrollStop()

    const scroll = carouselRef.current.getElementsByClassName('scrollWrap')[0]
    const scrollItems = carouselRef.current.getElementsByClassName('scroll-item')
    console.log('scroll.offsetLeft', scroll.offsetLeft);
    console.log('-scroll.offsetWidth', -scroll.offsetWidth / 2);
    if ((scroll.offsetLeft + -scrollItems[0].offsetWidth) <= -scroll.offsetWidth / 2) {
      // 向左偏移一半长度时, left 置 0 后向左偏移一个子项的宽度
      scroll.style.left = '0px'
      scroll.style.transition = 'none'
    } else {
      scroll.style.left = scroll.offsetLeft + -scrollItems[0].offsetWidth + 'px'
      scroll.style.transition = 'left .7s linear'
    }
    ++nodeIndex.current
    nodeIndex.current = nodeIndex.current >= scrollItems.length / 2 ? 0 : nodeIndex.current
    setActiveNode(NodeList?.[nodeIndex.current] || NodeList?.[0])
    delayTimer.current = setTimeout(() => isMove.current = false, 700)
  }

  // 下一个
  const handleNext = () => {
    if (isMove.current) return
    isMove.current = true
    repeatTimer.current && scrollStop()
    const scroll = carouselRef.current.getElementsByClassName('scrollWrap')[0]
    const scrollItems = carouselRef.current.getElementsByClassName('scroll-item')
    if (scroll.offsetLeft >= scroll.offsetWidth / 2 || scroll.offsetLeft === 0) {
      scroll.style.left = -scroll.offsetWidth / 2 + 'px'
      scroll.style.transition = 'none'
      scroll.style.left = scroll.offsetLeft + scrollItems[0].offsetWidth + 'px'
      scroll.style.transition = 'left .7s linear'
      nodeIndex.current = scrollItems.length / 2 - 1
    } else {
      scroll.style.left = scroll.offsetLeft + scrollItems[0].offsetWidth + 'px'
      scroll.style.transition = 'left .7s linear'
      --nodeIndex.current
    }
    nodeIndex.current = nodeIndex.current >= scrollItems.length / 2 ? 0 : nodeIndex.current
    console.log('nodeIndex.current', nodeIndex.current)
    setActiveNode(NodeList?.[nodeIndex.current] || NodeList?.[0])
    delayTimer.current = setTimeout(() => isMove.current = false, 700)
  }

  useEffect(() => {
    scrollStart()

    return () => {
      scrollStop()
      clearTimeout(repeatTimer.current)
    }
  }, [])

  // 节点点击
  const handleItemClick = (e: any, node: any) => {
    console.log('node', node);
    scrollStop()
    if (node) {
      setActiveNode(node)
    }
  }

  return (
    <div className='app'>
      <div ref={carouselRef} className='carousel'>
        <div className='carousel__btnLeft' onClick={handlePrev}></div>
        <div onMouseEnter={scrollStop} onMouseLeave={() => scrollStart()} className='carousel__content' >
          <div className='scrollWrap' >
            {
              NodeList?.map((item: any) => {
                return (
                  <div className='scroll-item' key={item.ID}>
                    <span
                      onMouseDown={(e) => handleItemClick(e, item)}
                      className={activeNode?.ID === item.ID ? 'activeNode' : ''}
                    >{item.NAME}</span>
                  </div>
                )
              })
            }
          </div>
        </div>
        <div className='carousel__btnRight' onClick={handleNext}></div>
      </div>
    </div>
  )
}

export default App