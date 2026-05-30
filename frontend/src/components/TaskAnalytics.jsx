import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function TaskAnalytics({
  tasks,
}) {

  const completed =
    tasks.filter(
      (task) =>
        task.status === "DONE"
    ).length;

  const progress =
    tasks.filter(
      (task) =>
        task.status ===
        "IN_PROGRESS"
    ).length;

  const todo =
    tasks.filter(
      (task) =>
        task.status === "TODO"
    ).length;

  const data = [
    {
      name: "Done",
      value: completed,
    },
    {
      name: "Progress",
      value: progress,
    },
    {
      name: "Todo",
      value: todo,
    },
  ];

  const COLORS = [
    "#4a9e6a",
    "#c99a2e",
    "#7b7e99",
  ];

  return (
    <div className="dark-card p-5">

      <div className="mb-5">

        <p className="section-label">
          Analytics
        </p>

        <h2 className="text-[16px] font-semibold text-[#1a1a1a] mt-2">
          Task Distribution
        </h2>

      </div>

      <div className="h-[260px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <PieChart>

            <Pie
              data={data}
              dataKey="value"
              outerRadius={85}
              innerRadius={55}
              paddingAngle={4}
            >

              {data.map(
                (entry, index) => (

                  <Cell
                    key={index}
                    fill={COLORS[index]}
                  />

                )
              )}

            </Pie>

            <Tooltip
              contentStyle={{
                background:
                  "#ffffff",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "8px",
                color: "#1a1a1a",
              }}
            />

          </PieChart>

        </ResponsiveContainer>

      </div>

      {/* Legend */}
      <div className="grid grid-cols-3 gap-3 mt-2">

        <div className="flex items-center gap-2">

          <div className="w-3 h-3 rounded-full bg-[#4a9e6a]" />

          <span className="text-[11px] text-[#666]">
            Done
          </span>

        </div>

        <div className="flex items-center gap-2">

          <div className="w-3 h-3 rounded-full bg-[#c99a2e]" />

          <span className="text-[11px] text-[#666]">
            Progress
          </span>

        </div>

        <div className="flex items-center gap-2">

          <div className="w-3 h-3 rounded-full bg-[#7b7e99]" />

          <span className="text-[11px] text-[#666]">
            Todo
          </span>

        </div>

      </div>

    </div>
  );
}