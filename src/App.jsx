import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Legend,
} from "recharts";

// ---- Utilities ----
function statusInfo(status) {
  switch (status) {
    case "vent_now":
      return { label: "Vent Now", color: "bg-rose-600", ring: "ring-rose-200", text: "text-rose-700" };
    case "vent_soon":
      return { label: "Vent Soon", color: "bg-orange-600", ring: "ring-orange-200", text: "text-orange-700" };
    default:
      return { label: "Good", color: "bg-emerald-600", ring: "ring-emerald-200", text: "text-emerald-700" };
  }
}

function fmtTime(ts) {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function clamp(n, lo, hi) { return Math.max(lo, Math.min(hi, n)); }

// Minimal radial progress using CSS conic-gradient
function AccuracyGauge({ value }) {
  const pct = clamp(Math.round(value), 0, 100);
  const angle = (pct / 100) * 360;
  return (
    <div className="flex items-center gap-4">
      <div
        className="relative w-24 h-24 rounded-full grid place-items-center"
        style={{
          background: `conic-gradient(rgb(16,185,129) ${angle}deg, rgba(229,231,235,1) 0deg)`,
        }}
      >
        <div className="absolute inset-2 bg-white rounded-full grid place-items-center shadow-inner">
          <div className="text-xl font-semibold">{pct}%</div>
        </div>
      </div>
      <div className="text-sm text-zinc-600 leading-tight">
        Model accuracy (last 7 days)
      </div>
    </div>
  );
}

// Mini inline sparkline for a single series
function Sparkline({ data, dataKey, stroke }) {
  return (
    <div className="h-10 w-40">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 4, bottom: 0, left: 0, right: 0 }}>
          <Line type="monotone" dataKey={dataKey} dot={false} stroke={stroke} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// ---- Mock fetch (replace with your API) ----
async function fetchRoom() {
  // Example mock series (120 minutes at 2-min steps)
  const now = new Date();
  const series = Array.from({ length: 60 }, (_, i) => {
    const t = new Date(now.getTime() - (59 - i) * 2 * 60 * 1000);
    const baseT = 23.2 + Math.sin(i / 8) * 0.6; // gentle wave
    const baseH = 48.0 + Math.cos(i / 10) * 3.0;
    return {
      ts: t.toISOString(),
      temperature: +(baseT + (Math.random() - 0.5) * 0.4).toFixed(2),
      humidity: +(baseH + (Math.random() - 0.5) * 1.5).toFixed(1),
    };
  });
  const last = series[series.length - 1];
  return {
    roomName: "SCH · 공학관 9209",
    status: "vent_soon",
    etaMinutes: 12,
    accuracy: 86,
    now: { temperature: last.temperature, humidity: last.humidity },
    series,
    updatedAt: now.toISOString(),
  };
}

export default function VentilationSinglePage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        // Replace with: const res = await fetch("/api/room/:id"); const json = await res.json();
        const json = await fetchRoom();
        setData(json);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const status = data ? statusInfo(data.status) : null;

  const header = (
    <header className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-semibold text-zinc-900">Classroom Ventilation · Single View</h1>
        <p className="text-zinc-500 text-sm">Focused on one room: prediction & accuracy · current temperature / humidity</p>
      </div>
      <div className="text-xs text-zinc-500">{data && (`Updated ${fmtTime(data.updatedAt)}`)}</div>
    </header>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-50 p-6">
        {header}
        <div className="animate-pulse grid gap-6 lg:grid-cols-3">
          <div className="h-40 bg-white rounded-2xl shadow-sm" />
          <div className="h-40 bg-white rounded-2xl shadow-sm" />
          <div className="h-40 bg-white rounded-2xl shadow-sm" />
          <div className="h-80 bg-white rounded-2xl shadow-sm lg:col-span-3" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-zinc-50 p-6">
      {header}

      {/* Top cards */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Prediction card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 ring-1 ring-zinc-100">
          <div className="flex items-start justify-between">
            <div>
              <div className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-white text-sm ${status?.color} shadow-sm`}>
                <span className="w-2 h-2 rounded-full bg-white/80" />
                {status?.label}
              </div>
              <h2 className="mt-3 text-xl font-semibold text-zinc-900">{data.roomName}</h2>
              <p className="text-sm text-zinc-500">Predicted ventilation timing</p>
            </div>
            <AccuracyGauge value={data.accuracy} />
          </div>
          <div className="mt-5">
            {data.status === "good" ? (
              <div className="text-zinc-700">No ventilation needed imminently. Monitoring…</div>
            ) : (
              <div className="text-zinc-800">
                <span className="font-medium">ETA:</span>{" "}
                {data.etaMinutes !== null ? (
                  <span className="font-semibold">T+{data.etaMinutes} minutes</span>
                ) : (
                  <span className="text-zinc-500">—</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Temperature card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">Current</div>
              <div className="text-3xl font-semibold text-zinc-900">{data.now.temperature.toFixed(1)}°C</div>
              <div className="text-xs text-zinc-500 mt-1">Target 20–26°C</div>
            </div>
            <Sparkline data={data.series} dataKey="temperature" stroke="#0ea5e9" />
          </div>
        </div>

        {/* Humidity card */}
        <div className="bg-white rounded-2xl shadow-sm p-5 ring-1 ring-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-zinc-500">Current</div>
              <div className="text-3xl font-semibold text-zinc-900">{data.now.humidity.toFixed(0)}%</div>
              <div className="text-xs text-zinc-500 mt-1">Comfort 40–60%</div>
            </div>
            <Sparkline data={data.series} dataKey="humidity" stroke="#10b981" />
          </div>
        </div>
      </div>

      {/* Timeseries */}
      <div className="bg-white rounded-2xl shadow-sm p-5 ring-1 ring-zinc-100 mt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-zinc-900">Last 2 hours · Temperature & Humidity</h3>
          <div className="text-xs text-zinc-500">{data.series.length} points</div>
        </div>
        <div className="h-[320px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data.series} margin={{ top: 8, right: 12, left: 12, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="ts"
                tickFormatter={(v) => fmtTime(v)}
                minTickGap={32}
                tick={{ fill: "#71717a", fontSize: 12 }}
              />
              <YAxis yAxisId="left" tick={{ fill: "#71717a", fontSize: 12 }} domain={["auto", "auto"]} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: "#71717a", fontSize: 12 }} domain={[0, 100]} />
              <Tooltip
                labelFormatter={(v) => fmtTime(v)}
                contentStyle={{ borderRadius: 12, borderColor: "#e5e7eb" }}
              />
              <Legend verticalAlign="top" height={24} wrapperStyle={{ color: "#52525b" }} />
              <Line yAxisId="left" type="monotone" dataKey="temperature" name="Temp (°C)" stroke="#0ea5e9" strokeWidth={2} dot={false} />
              <Line yAxisId="right" type="monotone" dataKey="humidity" name="Humidity (%)" stroke="#10b981" strokeWidth={2} dot={false} />
              <ReferenceLine yAxisId="right" y={40} stroke="#94a3b8" strokeDasharray="4 4" />
              <ReferenceLine yAxisId="right" y={60} stroke="#94a3b8" strokeDasharray="4 4" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-8 text-xs text-zinc-500">
        Tip: Swap the mock fetch with your real API (e.g., GET /api/room/:id). Provide fields:
        status, etaMinutes, accuracy, now{`{`}temperature,humidity{`}`}, series[{`{`}ts,temperature,humidity{`}`}].
      </div>
    </div>
  );
}
