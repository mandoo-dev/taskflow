import Login from '../components/Login'

export default function LoginPage() {
  const handleLogin = (credentials: { email: string; password: string }) => {
    console.log('로그인 시도:', credentials)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <Login onLogin={handleLogin} />
    </div>
  )
}
