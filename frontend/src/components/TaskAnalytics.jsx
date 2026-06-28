export default function TaskAnalytics({
  tasks,
}) {
  const completed = tasks.filter((task) => task.status === "DONE").length;
  const progress = tasks.filter((task) => task.status === "IN_PROGRESS").length;
  const todo = tasks.filter((task) => task.status === "TODO").length;

  const total = completed + progress + todo;

  // Percentage of completed tasks
  const donePercent = total ? Math.round((completed / total) * 100) : 0;

  // SVG dimensions & math
  // Radius r = (110 - strokeWidth) / 2 = (110 - 16) / 2 = 47
  const r = 47;
  const strokeWidth = 16;
  const circumference = 2 * Math.PI * r; // ~295.31

  const doneShare = total ? (completed / total) * circumference : 0;
  const progressShare = total ? (progress / total) * circumference : 0;
  const todoShare = total ? (todo / total) * circumference : 0;

  // Offsets
  const doneOffset = 0;
  const progressOffset = circumference - doneShare;
  const todoOffset = circumference - doneShare - progressShare;

  return (
    <div>
      <div className="mb-5">
        <span className="section-label">Analytics Eyebrow</span>
        <h2 className="text-[14px] font-semibold text-[#1e1b4b] mt-1">Task Distribution</h2>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
        {/* SVG Donut Chart */}
        <div className="relative w-[110px] h-[110px] shrink-0">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 110 110">
            {/* Gray base ring */}
            <circle
              cx="55"
              cy="55"
              r={r}
              fill="transparent"
              stroke="#f3f4f6"
              strokeWidth={strokeWidth}
            />

            {/* Todo Segment (Gray) */}
            {todoShare > 0 && (
              <circle
                cx="55"
                cy="55"
                r={r}
                fill="transparent"
                stroke="#6b7280"
                strokeWidth={strokeWidth}
                strokeDasharray={`${todoShare} ${circumference - todoShare}`}
                strokeDashoffset={todoOffset}
                className="transition-all duration-500"
              />
            )}

            {/* Progress Segment (Amber) */}
            {progressShare > 0 && (
              <circle
                cx="55"
                cy="55"
                r={r}
                fill="transparent"
                stroke="#f59e0b"
                strokeWidth={strokeWidth}
                strokeDasharray={`${progressShare} ${circumference - progressShare}`}
                strokeDashoffset={progressOffset}
                className="transition-all duration-500"
              />
            )}

            {/* Done Segment (Emerald) */}
            {doneShare > 0 && (
              <circle
                cx="55"
                cy="55"
                r={r}
                fill="transparent"
                stroke="#10b981"
                strokeWidth={strokeWidth}
                strokeDasharray={`${doneShare} ${circumference - doneShare}`}
                strokeDashoffset={doneOffset}
                className="transition-all duration-500"
              />
            )}
          </svg>

          {/* Center Overlay Text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-mono-data text-[18px] font-bold text-[#1e1b4b]">
              {donePercent}%
            </span>
            <span className="font-mono-data text-[9px] text-[#9ca3af] uppercase tracking-wider">
              done
            </span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2.5">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#10b981] shrink-0" />
            <span className="text-[12px] text-[#6b7280] font-sans w-16">Done</span>
            <span className="font-mono-data text-[12px] text-[#1e1b4b] font-bold">{completed}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#f59e0b] shrink-0" />
            <span className="text-[12px] text-[#6b7280] font-sans w-16">Progress</span>
            <span className="font-mono-data text-[12px] text-[#1e1b4b] font-bold">{progress}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-[#6b7280] shrink-0" />
            <span className="text-[12px] text-[#6b7280] font-sans w-16">Todo</span>
            <span className="font-mono-data text-[12px] text-[#1e1b4b] font-bold">{todo}</span>
          </div>
        </div>
      </div>
    </div>
  );
}