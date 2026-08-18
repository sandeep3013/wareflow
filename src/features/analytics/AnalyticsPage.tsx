import { useState } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, Users, Clock, Zap, Activity, Award } from 'lucide-react';
import { PageHeader } from '../../components/common/PageHeader';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { MetricCard } from '../../components/common/MetricCard';
import { MOCK_ZONE_BOTTLENECKS, MOCK_ACTIVITY_LOGS } from '../../data/analytics';
import { MOCK_EMPLOYEES } from '../../data/employees';
import {
  TableContainer,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '../../components/ui/table';
import { formatRelativeTime } from '../../lib/formatters';

export function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'today' | '7d' | '30d'>('7d');

  const slaDataByRange = {
    today: [
      { day: '06:00', sla: 96.2, target: 92.0 },
      { day: '08:00', sla: 94.5, target: 92.0 },
      { day: '10:00', sla: 91.8, target: 92.0 },
      { day: '12:00', sla: 95.4, target: 92.0 },
      { day: '14:00', sla: 97.1, target: 92.0 },
      { day: '16:00', sla: 96.8, target: 92.0 },
    ],
    '7d': [
      { day: 'Mon', sla: 92.4, target: 92.0 },
      { day: 'Tue', sla: 93.1, target: 92.0 },
      { day: 'Wed', sla: 91.8, target: 92.0 },
      { day: 'Thu', sla: 94.6, target: 92.0 },
      { day: 'Fri', sla: 95.2, target: 92.0 },
      { day: 'Sat', sla: 96.0, target: 92.0 },
      { day: 'Sun', sla: 94.2, target: 92.0 },
    ],
    '30d': [
      { day: 'W1', sla: 93.2, target: 92.0 },
      { day: 'W2', sla: 94.1, target: 92.0 },
      { day: 'W3', sla: 92.8, target: 92.0 },
      { day: 'W4', sla: 95.7, target: 92.0 },
    ],
  };

  const slaTrendData = slaDataByRange[timeRange];

  return (
    <div className="space-y-6 pb-8">
      <PageHeader
        title="Operations Intelligence & Performance Analytics"
        description="Historical fulfillment velocities, floor labor productivity rankings, zone pick variance, and SLA risk forecasting."
        badge={
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
            Real-Time Intelligence
          </span>
        }
        actions={
          <div className="flex items-center space-x-1 bg-white p-1 rounded-md border border-border shadow-subtle text-xs">
            <button
              id="analytics-timerange-today"
              name="timeRangeToday"
              onClick={() => setTimeRange('today')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                timeRange === 'today'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              Today
            </button>
            <button
              id="analytics-timerange-7d"
              name="timeRange7d"
              onClick={() => setTimeRange('7d')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                timeRange === '7d'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              7 Days
            </button>
            <button
              id="analytics-timerange-30d"
              name="timeRange30d"
              onClick={() => setTimeRange('30d')}
              className={`px-2.5 py-1 rounded font-medium transition-all ${
                timeRange === '30d'
                  ? 'bg-indigo-600 text-white font-semibold shadow-xs'
                  : 'text-foreground-secondary hover:text-foreground'
              }`}
            >
              30 Days
            </button>
          </div>
        }
      />

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Average Fulfillment Time"
          value="42.5m"
          trend={-8.4}
          trendLabel="faster cycle time"
          variant="success"
          sparklineData={[52, 49, 47, 45, 43, 42]}
          icon={<Clock className="w-4 h-4 text-emerald-600" />}
        />
        <MetricCard
          title="Pick Accuracy Rate"
          value="99.88%"
          trend={+0.12}
          trendLabel="error reduction"
          sparklineData={[99.4, 99.5, 99.6, 99.7, 99.8, 99.88]}
          icon={<Zap className="w-4 h-4 text-primary-600" />}
        />
        <MetricCard
          title="Active Floor Operators"
          value="32"
          subtitle="8 shift supervisors & leads"
          sparklineData={[28, 30, 32, 32, 32, 32]}
          icon={<Users className="w-4 h-4 text-blue-600" />}
        />
        <MetricCard
          title="Current Facility UPH"
          value="412"
          trend={+14.2}
          trendLabel="vs 360 target"
          sparklineData={[340, 360, 380, 395, 410, 412]}
          icon={<TrendingUp className="w-4 h-4 text-indigo-600" />}
        />
      </div>

      {/* Dual Column Layout with Independent Scrolling on Desktop, Natural Flow on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: SLA Compliance Trend Chart & Floor Operator Productivity Matrix */}
        <div className="lg:col-span-7 space-y-6 lg:overflow-y-auto lg:max-h-[calc(100vh-280px)] lg:pr-2 overscroll-contain">
          {/* SLA Compliance History */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>SLA Compliance Trend ({timeRange.toUpperCase()})</CardTitle>
                <CardDescription>On-time carrier dispatch rate against 92.0% enterprise SLA baseline</CardDescription>
              </div>
              <div className="flex items-center space-x-3 text-xs">
                <span className="flex items-center space-x-1 text-primary-600 font-medium">
                  <span className="h-2 w-2 rounded-full bg-primary-600" />
                  <span>Actual SLA %</span>
                </span>
                <span className="flex items-center space-x-1 text-gray-400 font-medium">
                  <span className="h-2 w-2 rounded-full bg-gray-400" />
                  <span>Target (92%)</span>
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={slaTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[88, 100]} tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E4E7EC',
                        boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="sla" stroke="#4F46E5" strokeWidth={2.5} name="SLA %" />
                    <Line type="monotone" dataKey="target" stroke="#D0D5DD" strokeDasharray="4 4" strokeWidth={2} name="Target" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Operator Efficiency Leaderboard */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-indigo-600" />
                  Floor Operator Productivity Matrix
                </CardTitle>
                <CardDescription>Picks per hour, accuracy scores, and active zone deployments</CardDescription>
              </div>
              <span className="text-[11px] font-mono text-foreground-secondary">
                Shift: <strong>07:00 - 15:30</strong>
              </span>
            </CardHeader>
            <CardContent className="p-0">
              <TableContainer className="border-0 shadow-none">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Employee</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Zone</TableHead>
                      <TableHead className="text-right">PPH</TableHead>
                      <TableHead className="text-right">Accuracy</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {MOCK_EMPLOYEES.map((emp) => (
                      <TableRow key={emp.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2.5">
                            <img
                              src={emp.avatarUrl}
                              alt={emp.name}
                              className="h-6 w-6 rounded-full object-cover border border-border"
                            />
                            <div className="font-semibold text-xs text-foreground">{emp.name}</div>
                          </div>
                        </TableCell>

                        <TableCell className="text-xs text-foreground-secondary">
                          {emp.role.replace(/_/g, ' ')}
                        </TableCell>

                        <TableCell className="font-mono text-xs font-semibold">
                          {emp.currentZone}
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs font-bold tabular-nums">
                          {emp.picksPerHour || '-'}
                        </TableCell>

                        <TableCell className="text-right font-mono text-xs tabular-nums text-emerald-700 font-bold">
                          {((1 - emp.errorRatePercent) * 100).toFixed(1)}%
                        </TableCell>

                        <TableCell>
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {emp.status.replace(/_/g, ' ')}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Zone Pick Speed Variance, Zone Bottleneck Monitor & Live Facility Telemetry Logs */}
        <div className="lg:col-span-5 space-y-6 lg:overflow-y-auto lg:max-h-[calc(100vh-280px)] lg:pl-1 overscroll-contain">
          {/* Zone Pick Speed Variance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle>Zone Pick Speed (Minutes / Item)</CardTitle>
                <CardDescription>Zone B heavy displays requires dynamic labor rebalancing</CardDescription>
              </div>
              <span className="text-[11px] font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                +65% Variance
              </span>
            </CardHeader>
            <CardContent>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={MOCK_ZONE_BOTTLENECKS} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F2F4F7" />
                    <XAxis dataKey="zone" tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 11, fill: '#667085' }} tickLine={false} axisLine={false} />
                    <RechartsTooltip
                      contentStyle={{
                        backgroundColor: '#FFFFFF',
                        borderRadius: '8px',
                        border: '1px solid #E4E7EC',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="pickSpeedMinutes" fill="#4F46E5" radius={[4, 4, 0, 0]} name="Avg Pick Mins" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Live Facility Telemetry & Activity Stream */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-1.5 text-xs font-bold">
                  <Activity className="w-4 h-4 text-emerald-600" />
                  Live Operational Telemetry Feed
                </CardTitle>
                <CardDescription>Real-time stream of sensor pings, picks, and routing decisions</CardDescription>
              </div>
              <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </CardHeader>
            <CardContent className="space-y-3 pt-1">
              <div className="space-y-2">
                {MOCK_ACTIVITY_LOGS.map((log) => (
                  <div
                    key={log.id}
                    className="p-2.5 rounded-lg border border-border bg-[#F8FAFC]/70 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground">{log.title}</span>
                      <span className="text-[10px] text-foreground-tertiary font-mono">
                        {formatRelativeTime(log.timestamp)}
                      </span>
                    </div>
                    <p className="text-[11px] text-foreground-secondary leading-relaxed">
                      {log.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-foreground-tertiary pt-0.5">
                      <span>Actor: <strong className="text-foreground">{log.actor}</strong></span>
                      {log.entityId && <span className="font-mono font-bold text-indigo-700">{log.entityId}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
