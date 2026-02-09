interface Task {
  id: number
  title: string
  status: string
  description: string
}

interface TaskTableProps {
  tasks: Task[]
  onStatusChange: (id: number, nextStatus: string) => void
  onDelete: (id: number) => void
}

const nextStatusMap: Record<string, string> = {
  pending: 'in_progress',
  in_progress: 'completed',
  completed: 'pending',
}

export default function TaskTable({ tasks, onStatusChange, onDelete }: TaskTableProps) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">제목</th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">상태</th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">설명</th>
          <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">작업</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200 bg-white">
        {tasks.map((task) => (
          <tr key={task.id}>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{task.title}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.status}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{task.description}</td>
            <td className="whitespace-nowrap px-6 py-4 text-sm space-x-2">
              <button
                onClick={() => onStatusChange(task.id, nextStatusMap[task.status] ?? 'pending')}
                className="rounded bg-blue-500 px-3 py-1 text-white hover:bg-blue-600"
              >
                상태 변경
              </button>
              <button
                onClick={() => onDelete(task.id)}
                className="rounded bg-red-500 px-3 py-1 text-white hover:bg-red-600"
              >
                삭제
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
