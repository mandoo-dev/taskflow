import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">TaskFlow</h1>
        <p className="mb-8 text-lg text-gray-600">할 일 관리를 쉽고 빠르게</p>
        <div className="space-x-4">
          <Link
            to="/login"
            className="inline-block rounded-md bg-blue-600 px-6 py-3 text-white hover:bg-blue-700"
          >
            로그인
          </Link>
          <Link
            to="/register"
            className="inline-block rounded-md border border-blue-600 px-6 py-3 text-blue-600 hover:bg-blue-50"
          >
            회원가입
          </Link>
        </div>
      </div>
    </div>
  )
}
