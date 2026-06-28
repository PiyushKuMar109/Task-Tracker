export default function ProgressChart({
  tasks,
}) {
  const todoVal = tasks.filter((t) => t.status === "TODO").length;
  const progressVal = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const doneVal = tasks.filter((t) => t.status === "DONE").length;

  const maxVal = Math.max(todoVal, progressVal, doneVal, 1);

  const bars = [
    { label: "TODO", val: todoVal, color: "#c7d2fe" },
    { label: "PROGRESS", val: progressVal, color: "#fde68a" },
    { label: "DONE", val: doneVal, color: "#6ee7b7" }
  ];

  return (
    <div>
      <div className="mb-5">
        <span className="section-label">Workflow Eyebrow</span>
        <h2 className="text-[14px] font-semibold text-[#1e1b4b] mt-1">Workflow Stats</h2>
      </div>

      <div className="h-[200px] flex items-end justify-around border-b border-dashed border-[#e8e8f0] pb-2">
        {bars.map((bar, idx) => {
          const pctHeight = Math.max((bar.val / maxVal) * 140, 6); // max 140px height
          return (
            <div key={idx} className="flex flex-col items-center w-20">
              {/* Value above bar */}
              <span className="font-mono-data text-[10px] text-[#1e1b4b] mb-1.5">
                {bar.val}
              </span>

              {/* Bar shape */}
              <div
                style={{
                  height: `${pctHeight}px`,
                  backgroundColor: bar.color,
                  borderRadius: "5px 5px 0 0"
                }}
                className="w-10 transition-all duration-300"
              />

              {/* Label below bar */}
              <span className="font-mono-data text-[10px] text-[#9ca3af] mt-2">
                {bar.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}