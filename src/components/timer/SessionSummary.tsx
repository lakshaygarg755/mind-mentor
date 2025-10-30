interface SessionSummaryProps {
  sessionsCompleted: number;
  mode: 'focus' | 'break';
}

export default function SessionSummary({ sessionsCompleted, mode }: SessionSummaryProps) {
  return (
    <div className="text-center space-y-2">
      <div className="text-sm text-gray-600">
        Sessions Completed Today
      </div>
      <div className="text-2xl font-bold">
        {sessionsCompleted}
      </div>
      <div className="text-sm text-gray-600">
        Current Mode: {mode === 'focus' ? 'Focus Time' : 'Break Time'}
      </div>
    </div>
  );
} 