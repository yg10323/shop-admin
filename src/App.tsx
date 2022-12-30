import { useEffect } from 'react'
import './app.less'

const App = () => {

  useEffect(() => {
    // const carousel = document.querySelector('.carousel') as HTMLElement
    const scroll = document.querySelector('.carousel__content-scroll') as HTMLElement
    setTimeout(() => scroll.style.left = '120px', 2000)
  }, [])

  return (
    <div className='app'>
      <div className='carousel'>
        <div className='carousel__leftBtn'></div>
        <div className='carousel__content'>
          <div className='carousel__content-scroll'>
            <div className='scroll-item'>
              <div className="wrap">11111</div>
            </div>
            <div className='scroll-item'>
              <div className="wrap">2222</div>
            </div>
            <div className='scroll-item'>
              <div className="wrap">3333</div>
            </div>
            <div className='scroll-item'>
              <div className="wrap">4444</div>
            </div>
            <div className='scroll-item'>
              <div className="wrap">5555</div>
            </div>
            <div className='scroll-item'>
              <div className="wrap">6666</div>
            </div>
            <div className='scroll-item'>
              <div className="wrap">7777</div>
            </div>
            <div className='scroll-item'>
              <div className="wrap">8888</div>
            </div>
          </div>
        </div>
        <div className='carousel__rightBtn'></div>
      </div>
    </div>
  )
}

export default App