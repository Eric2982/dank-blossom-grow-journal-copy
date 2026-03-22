import React from "react";
import { base44 } from "@/api/base44Client";
import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Users, UserPlus, Activity, Zap } from "lucide-react";
import { format, parse } from "date-fns";

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-5 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${color}`}>
                <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
                <p className="text-white/40 text-xs uppercase tracking-widest">{label}</p>
                <p className="text-2xl font-light text-white">{value?.toLocaleString() ?? "—"}</p>
            </div>
        </div>
    );
}

export default function Analytics() {
    const { data, isLoading, error } = useQuery({
        queryKey: ["analyticsStats"],
        queryFn: async () => {
            const res = await base44.functions.invoke("analyticsStats", {});
            return res.data.rows;
        },
    });

    const totals = data?.reduce(
        (acc, row) => ({
            activeUsers: acc.activeUsers + row.activeUsers,
            newUsers: acc.newUsers + row.newUsers,
            sessions: acc.sessions + row.sessions,
            events: acc.events + row.events,
        }),
        { activeUsers: 0, newUsers: 0, sessions: 0, events: 0 }
    );

    const chartData = data?.map((row) => ({
        ...row,
        label: format(parse(row.date, "yyyyMMdd", new Date()), "MMM d"),
    }));

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-light text-white">Analytics</h1>
                <p className="text-white/40 text-sm mt-1">Last 30 days — Google Analytics data</p>
            </div>

            {isLoading && (
                <div className="text-white/30 text-sm">Loading analytics...</div>
            )}

            {error && (
                <div className="text-red-400 text-sm">Failed to load analytics data.</div>
            )}

            {totals && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <StatCard icon={Users} label="Active Users" value={totals.activeUsers} color="bg-emerald-600/20" />
                    <StatCard icon={UserPlus} label="New Users" value={totals.newUsers} color="bg-blue-600/20" />
                    <StatCard icon={Activity} label="Sessions" value={totals.sessions} color="bg-purple-600/20" />
                    <StatCard icon={Zap} label="Events" value={totals.events} color="bg-amber-600/20" />
                </div>
            )}

            {chartData && (
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6">
                    <h2 className="text-white/60 text-sm mb-4 uppercase tracking-widest">Daily Active Users</h2>
                    <ResponsiveContainer width="100%" height={240}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="label" tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} axisLine={false} />
                            <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 11 }} tickLine={false} axisLine={false} width={32} />
                            <Tooltip contentStyle={{ background: "#18181b", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, color: "#fff" }} />
                            <Line type="monotone" dataKey="activeUsers" stroke="#10b981" strokeWidth={2} dot={false} name="Active Users" />
                            <Line type="monotone" dataKey="newUsers" stroke="#3b82f6" strokeWidth={2} dot={false} name="New Users" />
                            <Line type="monotone" dataKey="sessions" stroke="#a78bfa" strokeWidth={2} dot={false} name="Sessions" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}