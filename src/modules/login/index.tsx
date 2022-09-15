import { Button, Form, Input } from 'antd'
import { $api } from 'src/plugins'

import 'src/styles/modules/login/index.less'

const Login = () => {

  const handleLogin = (values: any) => {
    $api['role/login'](values).then((res: any) => {
      console.log('res', res);
    })
  }

  return (
    <div className='login-page'>
      <div className="login-page__title">后台管理</div>
      <div className="login-page__content">
        <Form
          name='loginForm'
          labelCol={{ span: 8 }}
          onFinish={handleLogin}
          autoComplete='off'
          style={{ marginLeft: -40 }}
        >
          <Form.Item
            label='用户名'
            name='username'
            rules={[{ required: true, message: '用户名不能为空!' }]}
          >
            <Input allowClear />
          </Form.Item>
          <Form.Item
            label='密码'
            name='password'
            rules={[{ required: true, message: '密码不能为空!' }]}
          >
            <Input.Password allowClear />
          </Form.Item>
          <Form.Item style={{ textAlign: 'center' }}>
            <Button type='link'>注册</Button>
            <Button type='primary' htmlType='submit'>登陆</Button>
          </Form.Item>
        </Form>
      </div>
      <div className="login-page__footer">@ 保持热爱, 奔赴山海</div>
    </div>
  )
}

export default Login