import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function ProgressChart({
  tasks,
}) {

  const data = [
    {
      name: "Todo",
      value: tasks.filter(
        (task) =>
          task.status === "TODO"
      ).length,
    },
    {
      name: "Progress",
      value: tasks.filter(
        (task) =>
          task.status ===
          "IN_PROGRESS"
      ).length,
    },
    {
      name: "Done",
      value: tasks.filter(
        (task) =>
          task.status === "DONE"
      ).length,
    },
  ];

  return (
    <div className="dark-card p-5">

      <div className="mb-5">

        <p className="section-label">
          Progress
        </p>

        <h2 className="text-[16px] font-semibold text-[#1a1a1a] mt-2">
          Workflow Stats
        </h2>

      </div>

      <div className="h-[260px]">

        <ResponsiveContainer
          width="100%"
          height="100%"
        >

          <BarChart data={data}>

            <XAxis
              dataKey="name"
              stroke="#555"
              tick={{
                fontSize: 11,
              }}
            />

            <YAxis
              stroke="#555"
              tick={{
                fontSize: 11,
              }}
            />

            <Tooltip
              contentStyle={{
                background:
                  "#ffffff",
                border:
                  "1px solid #e5e7eb",
                borderRadius: "8px",
              }}
            />

            <Bar
              dataKey="value"
              fill="#5a4bcc"
              radius={[4, 4, 0, 0]}
            />

          </BarChart>

        </ResponsiveContainer>

      </div>

    </div>
  );
}