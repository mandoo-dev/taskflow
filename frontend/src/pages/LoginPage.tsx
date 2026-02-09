import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Login from '../components/Login'

export default function LoginPage() {
  const navigate = useNavigate()
  const [errorMessage, setErrorMessage] = useState('')

  const handleLogin = async (credentials: { email: string; password: string }) => {
    setErrorMessage('')

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })

    if (res.ok) {
      const data = await res.json()
      localStorage.setItem('token', data.token)
      navigate('/dashboard')
    } else {
      setErrorMessage('잘못된 이메일 또는 비밀번호입니다.')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Login onLogin={handleLogin} errorMessage={errorMessage} />
    </div>
  )
}
