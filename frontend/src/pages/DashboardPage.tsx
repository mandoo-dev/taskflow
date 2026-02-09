import { useState, useEffect, useCallback } from 'react'

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  userId: string
  createdAt: string
}

const STATUS_LABELS: Record<string, string> = {
  pending: '대기중',
  in_progress: '진행중',
  completed: '완료',
}

const ALL_STATUSES = ['pending', 'in_progress', 'completed']

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [statusDropdownTaskId, setStatusDropdownTaskId] = useState<string | null>(null)
  const [deleteTargetTaskId, setDeleteTargetTaskId] = useState<string | null>(null)

  const getToken = () => localStorage.getItem('token') ?? ''

  const fetchTasks = useCallback(async () => {
    const res = await fetch('/api/tasks', {
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    if (res.ok) {
      const data = await res.json()
      setTasks(data)
    }
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    await fetch('/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ title: newTitle, description: newDescription }),
    })
    setNewTitle('')
    setNewDescription('')
    setShowCreateModal(false)
    await fetchTasks()
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ status: newStatus }),
    })
    setStatusDropdownTaskId(null)
    await fetchTasks()
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTargetTaskId) return
    await fetch(`/api/tasks/${deleteTargetTaskId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${getToken()}` },
    })
    setDeleteTargetTaskId(null)
    await fetchTasks()
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">대시보드</h1>
          <button
            type="button"
            className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            onClick={() => setShowCreateModal(true)}
          >
            새 태스크 추가
          </button>
        </div>

        {/* 태스크 목록 */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div key={task.id} className="task-item flex items-center justify-between rounded border bg-white p-4 shadow-sm">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{task.title}</h3>
                {task.description && (
                  <p className="text-sm text-gray-600">{task.description}</p>
                )}
              </div>

              <div className="relative ml-4 flex items-center gap-2">
                {/* 상태 배지 */}
                <span
                  data-testid={`status-${task.status}`}
                  className="cursor-pointer rounded-full bg-gray-200 px-3 py-1 text-sm"
                  onClick={() =>
                    setStatusDropdownTaskId(
                      statusDropdownTaskId === task.id ? null : task.id
                    )
                  }
                >
                  {STATUS_LABELS[task.status] ?? task.status}
                </span>

                {/* 상태 드롭다운 */}
                {statusDropdownTaskId === task.id && (
                  <div className="absolute right-16 top-8 z-10 rounded border bg-white shadow-lg">
                    {ALL_STATUSES.filter((s) => s !== task.status).map((s) => (
                      <div
                        key={s}
                        className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                        onClick={() => handleStatusChange(task.id, s)}
                      >
                        {STATUS_LABELS[s]}
                      </div>
                    ))}
                  </div>
                )}

                {/* 삭제 버튼 */}
                <button
                  type="button"
                  data-testid="delete-button"
                  className="rounded bg-red-500 px-3 py-1 text-sm text-white hover:bg-red-600"
                  onClick={() => setDeleteTargetTaskId(task.id)}
                >
                  삭제
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 생성 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h2 className="mb-4 text-xl font-bold">새 태스크</h2>
            <form onSubmit={handleCreateTask}>
              <div className="mb-3">
                <label className="mb-1 block text-sm font-medium">제목</label>
                <input
                  name="taskTitle"
                  type="text"
                  className="w-full rounded border px-3 py-2"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="mb-1 block text-sm font-medium">설명</label>
                <textarea
                  name="taskDescription"
                  className="w-full rounded border px-3 py-2"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="rounded border px-4 py-2"
                  onClick={() => setShowCreateModal(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  생성
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 삭제 확인 다이얼로그 */}
      {deleteTargetTaskId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="rounded-lg bg-white p-6 shadow-xl">
            <p className="mb-4 text-gray-700">정말로 이 태스크를 삭제하시겠습니까?</p>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="rounded border px-4 py-2"
                onClick={() => setDeleteTargetTaskId(null)}
              >
                취소
              </button>
              <button
                type="button"
                className="rounded bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                onClick={handleDeleteConfirm}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
