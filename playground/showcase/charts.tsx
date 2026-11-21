import { useId, type ReactElement, type ReactNode } from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { cssVars, styleVars, getTokenValue, Icon } from '../../src/index.js';
import { channels, workload, money, type revenue } from './data.js';

const revenueColour = cssVars['User Profiles/Primary/Default'];
const workloadPalette = [cssVars['Feedback/Success/Dark'], cssVars['Feedback/Action/Dark'], cssVars['Primitives/Text/Secondary']];
const barRadius = getTokenValue('Radius/Radius/4');
const axis = { fontSize: styleVars['text/Body XS/fontSize'], fontFamily: styleVars['text/Body/fontFamily'], fill: cssVars['Primitives/Text/Secondary'] };
const tooltipStyle = { background: cssVars['Primitives/Surface/Default'], border: `1px solid ${cssVars['Primitives/Neutral/Light Grey']}`, borderRadius: cssVars['Radius/Radius/8'], fontFamily: styleVars['text/Body/fontFamily'], fontSize: styleVars['text/Body XS/fontSize'], color: cssVars['Primitives/Text/Primary'], boxShadow: styleVars['effect/Elevation 2'] };

type ChartFrameProps = { title: string; eyebrow: string; description: string; summary: ReactNode; columns: string[]; rows: ReactNode[][]; children: ReactElement; className?: string; extra?: ReactNode };
export function ChartFrame({ title, eyebrow, description, summary, columns, rows, children, className = '', extra }: ChartFrameProps) {
  const id = useId();
  return <figure className={`dash-panel chart-panel ${className}`} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`}>
    <figcaption><div><p className="eyebrow">{eyebrow}</p><h2 id={`${id}-title`}>{title}</h2></div><Icon name="bar_chart" size={20} /></figcaption>
    <p id={`${id}-description`} className="chart-description">{description}</p>
    <div className="chart-canvas"><ResponsiveContainer width="100%" height="100%" minWidth={0}>{children}</ResponsiveContainer></div>
    {extra}
    <p className="chart-summary">{summary}</p>
    <details className="chart-data"><summary>View data table<span className="sr-only"> for {title}</span></summary><div className="table-scroll" role="region" aria-label={`${title} data`} tabIndex={0}>
      <table><caption className="sr-only">{title}</caption><thead><tr>{columns.map(column => <th key={column} scope="col">{column}</th>)}</tr></thead><tbody>{rows.map((row, index) => <tr key={index}>{row.map((value, cell) => cell === 0 ? <th scope="row" key={cell}>{value}</th> : <td key={cell}>{value}</td>)}</tr>)}</tbody></table>
    </div></details>
  </figure>;
}

export function RevenueChart({ data }: { data: typeof revenue }) {
  const latest = data.at(-1)!;
  const growth = ((latest.current / data[0]!.current - 1) * 100).toFixed(1);
  return <ChartFrame className="revenue-chart" title="Revenue, moving forward" eyebrow="REVENUE PERFORMANCE" description="Monthly recurring revenue compared with the previous period, in US dollars. Use left and right arrows on the chart to explore values."
    summary={<><strong>{money(latest.current)}</strong> in {latest.month}, up {growth}% from {data[0]!.month}.</>}
    columns={['Month', 'Current period', 'Previous period']} rows={data.map(row => [row.month, money(row.current), money(row.previous)])}
    extra={<div className="chart-legend"><span><i style={{ background: revenueColour }} />Current period</span><span><i className="dashed-key" />Previous period</span></div>}>
    <LineChart data={data} accessibilityLayer title="Monthly recurring revenue" desc="Two lines compare current and previous periods; exact values are available in the data table." margin={{ left: 0, right: 14, top: 16, bottom: 0 }}>
      <CartesianGrid vertical={false} stroke={cssVars['Primitives/Neutral/Light Grey']} strokeDasharray="3 5" />
      <XAxis dataKey="month" axisLine={false} tickLine={false} tick={axis} tickMargin={14} />
      <YAxis axisLine={false} tickLine={false} tick={axis} width={48} tickFormatter={value => `$${Number(value) / 1000}k`} domain={[0, 'auto']} />
      <RechartsTooltip contentStyle={tooltipStyle} formatter={value => money(Number(value))} isAnimationActive={false} />
      <Line name="Previous period" dataKey="previous" stroke={cssVars['Primitives/Text/Secondary']} strokeWidth={2} strokeDasharray="5 5" dot={false} isAnimationActive={false} />
      <Line name="Current period" dataKey="current" stroke={revenueColour} strokeWidth={3} dot={{ r: 3, strokeWidth: 2, fill: cssVars['Primitives/Surface/Default'] }} activeDot={{ r: 5 }} isAnimationActive={false} />
    </LineChart>
  </ChartFrame>;
}

export function ChannelChart() {
  return <ChartFrame title="How customers find you" eyebrow="ACQUISITION" description="New customers by acquisition channel this month. Exact figures are available below."
    summary={<><strong>230 new customers.</strong> Organic is the leading channel, with 86.</>} columns={['Channel', 'New customers']} rows={channels.map(row => [row.channel, row.customers])}>
    <BarChart data={channels} accessibilityLayer title="Customer acquisition by channel" desc="Organic 86, Referral 64, Direct 48, Partners 32." margin={{ left: -18, right: 12, top: 12 }}>
      <CartesianGrid vertical={false} stroke={cssVars['Primitives/Neutral/Light Grey']} strokeDasharray="3 5" />
      <XAxis dataKey="channel" axisLine={false} tickLine={false} tick={axis} tickMargin={12} interval={0} />
      <YAxis axisLine={false} tickLine={false} tick={axis} allowDecimals={false} />
      <RechartsTooltip contentStyle={tooltipStyle} cursor={{ fill: cssVars['User Profiles/Surface/Subtle'] }} isAnimationActive={false} />
      <Bar name="New customers" dataKey="customers" fill={cssVars['Feedback/Action/Dark']} radius={[barRadius, barRadius, 0, 0]} maxBarSize={46} isAnimationActive={false} />
    </BarChart>
  </ChartFrame>;
}

export function WorkloadChart() {
  return <ChartFrame className="workload-chart" title="Making room for progress" eyebrow="TEAM OPERATIONS" description="This month's 240 tasks, grouped by status. Labels and a data table accompany the donut chart."
    summary={<><strong>65% complete.</strong> 156 of 240 tasks are done; 48 are in progress and 36 are planned.</>} columns={['Task status', 'Tasks']} rows={workload.map(row => [row.name, row.value])}
    extra={<ul className="donut-legend">{workload.map((row, index) => <li key={row.name}><span><i style={{ background: workloadPalette[index] }} />{row.name}</span><strong>{row.value}</strong></li>)}</ul>}>
    <PieChart accessibilityLayer title="Team task completion" desc="156 completed, 48 in progress, 36 planned.">
      <Pie data={workload} dataKey="value" nameKey="name" innerRadius="65%" outerRadius="86%" paddingAngle={3} startAngle={90} endAngle={-270} stroke={cssVars['Primitives/Surface/Default']} strokeWidth={2} isAnimationActive={false}>
        {workload.map((row, index) => <Cell key={row.name} fill={workloadPalette[index]} />)}
      </Pie>
      <RechartsTooltip contentStyle={tooltipStyle} isAnimationActive={false} />
      <text x="50%" y="48%" textAnchor="middle" fill={cssVars['Primitives/Text/Primary']} className="donut-total">65%</text>
      <text x="50%" y="60%" textAnchor="middle" fill={cssVars['Primitives/Text/Secondary']} className="donut-caption">completed</text>
    </PieChart>
  </ChartFrame>;
}
