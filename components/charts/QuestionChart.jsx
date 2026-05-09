"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell,
  ResponsiveContainer,
  Tooltip,
  LabelList,
} from "recharts";

const SCALE_PALETTE = ["#a7f3d0", "#6ee7b7", "#34d399", "#10b981", "#047857"];
const PRIMARY = "#047857";

const PercentTooltip = ({ active, payload, total }) => {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  const pct = total ? ((p.count / total) * 100).toFixed(0) : 0;
  return (
    <div className="rounded-lg border border-emerald-200 bg-white px-3 py-2 shadow-md text-xs">
      <div className="font-medium text-gray-900">{p.label}</div>
      <div className="text-gray-600 mt-0.5">
        {p.count} {p.count === 1 ? "response" : "responses"} ({pct}%)
      </div>
    </div>
  );
};

export function SingleChoiceChart({ options, distribution, total }) {
  const data = options.map((opt) => ({
    label: opt,
    short: opt.length > 28 ? opt.slice(0, 26) + "…" : opt,
    count: distribution[opt] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={Math.max(180, options.length * 44)}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 4, right: 36, bottom: 4, left: 4 }}
      >
        <XAxis type="number" hide domain={[0, "dataMax"]} />
        <YAxis
          type="category"
          dataKey="short"
          width={170}
          tick={{ fontSize: 12, fill: "#374151" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "rgba(16,185,129,0.06)" }}
          content={<PercentTooltip total={total} />}
        />
        <Bar dataKey="count" radius={[6, 6, 6, 6]} fill={PRIMARY} barSize={22}>
          <LabelList
            dataKey="count"
            position="right"
            style={{ fontSize: 11, fill: "#047857", fontWeight: 600 }}
          />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ScaleChart({ distribution, total, scaleLabels }) {
  const data = [1, 2, 3, 4, 5].map((n, i) => ({
    label: String(n),
    count: distribution[n] || 0,
    fill: SCALE_PALETTE[i],
  }));

  const sum = data.reduce((acc, d) => acc + d.count * Number(d.label), 0);
  const avg = total ? (sum / total).toFixed(1) : "—";

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-gray-500">{scaleLabels[0]}</span>
        <div className="text-xs">
          <span className="text-gray-500">avg </span>
          <span className="font-semibold text-emerald-900">{avg}</span>
        </div>
        <span className="text-xs text-gray-500">{scaleLabels[1]}</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 12, right: 4, bottom: 4, left: 4 }}>
          <XAxis
            dataKey="label"
            tick={{ fontSize: 12, fill: "#374151", fontWeight: 600 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={[0, "dataMax"]} />
          <Tooltip
            cursor={{ fill: "rgba(16,185,129,0.06)" }}
            content={<PercentTooltip total={total} />}
          />
          <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={48}>
            {data.map((entry, idx) => (
              <Cell key={idx} fill={entry.fill} />
            ))}
            <LabelList
              dataKey="count"
              position="top"
              style={{ fontSize: 11, fill: "#374151", fontWeight: 600 }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
