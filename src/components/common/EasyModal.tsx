import type { ModalProps } from 'antd';
import type { CSSProperties } from 'react'
import React, { useState } from 'react';
import { useLocalObservable } from 'mobx-react'
import { Modal, Button } from "antd";
import { omit } from "lodash";

interface Props extends ModalProps {
  disabled?: boolean,
  fullModal?: boolean,
  draggable?: boolean,
  slot?: React.ReactNode,
  slotClass?: string,
  slotStyle?: CSSProperties,
  initVisible?: boolean,
  [propName: string]: any
}

const ModalContext = React.createContext<any>(undefined)
const EasyModal = (props: Props) => {
  const [visible, setVisible] = useState(props.initVisible)
  const state = useLocalObservable(() => {
    return {
      show: () => setVisible(true),
      close: () => setVisible(false),
    }
  })

  const handleModalShow = () => {
    !props.disabled && setVisible(true)
  }

  const handleOk = (evt: any) => {
    if (props.onOk instanceof Function) {
      const promise: any = props.onOk(evt)
      if (promise instanceof Promise) {
        promise.then(() => setVisible(false))
      } else {
        setVisible(!!promise)
      }
      return
    }
    setVisible(false)
  }

  const handleCancel = (evt: any) => {
    props.onCancel instanceof Function && props.onCancel(evt)
    setVisible(false)
  }

  const { fullModal, slotClass, slotStyle, slot } = props
  const modalProps = omit(props, ['className', 'disabled', 'fullModal', 'slotClass', 'slotStyle', 'slot'])
  return (
    <React.Fragment>
      <div onClick={handleModalShow} className={slotClass} style={slotStyle}>{slot}</div>
      <ModalContext.Provider value={state}>
        <Modal
          {...modalProps}
          open={visible}
          onOk={handleOk}
          onCancel={handleCancel}
          className={`${props.className} ${fullModal ? 'full-height' : ''}`}
        >
          {props.children}
        </Modal>
      </ModalContext.Provider>
    </React.Fragment>
  )
}

EasyModal.defaultProps = {
  destroyOnClose: true,
  title: '基本弹框',
  width: '80%',
  footer: null,
  // 自定义props
  disabled: false,
  fullModal: false,
  draggable: true,
  initVisible: false,
  slot: <Button>弹窗</Button>,
  slotClass: 'form-modal_slot',
  slotStyle: { display: 'inline-block', cursor: 'pointer' },
}

export { ModalContext }
export default EasyModal