import { Link } from 'react-router-dom'

export default function ForgotPassword() {
  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold text-bingo-dark mb-2">找回密码</h1>
      <p className="text-gray-600 mb-8">请输入注册手机号，我们将发送验证码帮助您重置密码</p>
      <div className="card p-6">
        <p className="text-gray-600 text-sm">找回密码功能需对接短信/邮件服务后开放。</p>
        <Link to="/login" className="mt-4 inline-block text-primary font-medium hover:underline">返回登录</Link>
      </div>
    </div>
  )
}
