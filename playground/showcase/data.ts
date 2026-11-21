export type AccountStatus = 'Active' | 'Trial' | 'At risk' | 'Archived';
export type Account = { id: string; name: string; email: string; plan: 'Starter' | 'Growth' | 'Enterprise'; status: AccountStatus; mrr: number; joined: string; health: number };
export const accounts: Account[] = [
  { id: 'a1', name: 'Forma Studio', email: 'team@forma.example', plan: 'Growth', status: 'Active', mrr: 1290, joined: '2026-11-18', health: 92 },
  { id: 'a2', name: 'Meridian Labs', email: 'hello@meridian.example', plan: 'Enterprise', status: 'Active', mrr: 4800, joined: '2026-11-15', health: 96 },
  { id: 'a3', name: 'Goodkind', email: 'team@goodkind.example', plan: 'Starter', status: 'Trial', mrr: 0, joined: '2026-11-14', health: 68 },
  { id: 'a4', name: 'Fieldwork', email: 'ops@fieldwork.example', plan: 'Growth', status: 'At risk', mrr: 1290, joined: '2026-11-11', health: 38 },
  { id: 'a5', name: 'Openwater', email: 'hello@openwater.example', plan: 'Enterprise', status: 'Active', mrr: 6200, joined: '2026-11-09', health: 89 },
  { id: 'a6', name: 'Common Ground', email: 'team@common.example', plan: 'Growth', status: 'Active', mrr: 1890, joined: '2026-11-07', health: 84 },
  { id: 'a7', name: 'Sunday Supply', email: 'hello@sunday.example', plan: 'Starter', status: 'Trial', mrr: 0, joined: '2026-11-05', health: 72 },
  { id: 'a8', name: 'Offscript', email: 'team@offscript.example', plan: 'Growth', status: 'Active', mrr: 1290, joined: '2026-11-03', health: 91 },
  { id: 'a9', name: 'Parallel', email: 'ops@parallel.example', plan: 'Enterprise', status: 'Active', mrr: 7500, joined: '2026-10-29', health: 94 },
  { id: 'a10', name: 'Moss & Co.', email: 'hello@moss.example', plan: 'Starter', status: 'Active', mrr: 390, joined: '2026-10-25', health: 81 },
  { id: 'a11', name: 'Arc Digital', email: 'team@arc.example', plan: 'Growth', status: 'At risk', mrr: 1290, joined: '2026-10-21', health: 42 },
  { id: 'a12', name: 'Kinfolk Works', email: 'hello@kinfolk.example', plan: 'Enterprise', status: 'Active', mrr: 5200, joined: '2026-10-18', health: 88 },
];
export const revenue = [
  { month: 'Jun', current: 32400, previous: 29800 }, { month: 'Jul', current: 35800, previous: 31200 },
  { month: 'Aug', current: 34900, previous: 32600 }, { month: 'Sep', current: 41200, previous: 34800 },
  { month: 'Oct', current: 44600, previous: 37100 }, { month: 'Nov', current: 48920, previous: 39800 },
];
export const channels = [
  { channel: 'Organic', customers: 86 }, { channel: 'Referral', customers: 64 },
  { channel: 'Direct', customers: 48 }, { channel: 'Partners', customers: 32 },
];
export const workload = [
  { name: 'Completed', value: 156 }, { name: 'In progress', value: 48 }, { name: 'Planned', value: 36 },
];
export const activity = [
  { initials: 'JL', person: 'Jamie Lee', action: 'welcomed Meridian Labs', detail: 'Enterprise account · onboarding complete', time: '12 min ago', icon: 'person_add' },
  { initials: 'SR', person: 'Sam Rivera', action: 'published the November report', detail: 'Monthly performance · ready to share', time: '38 min ago', icon: 'description' },
  { initials: 'AP', person: 'Alex Park', action: 'resolved 8 customer requests', detail: 'Customer success · all within SLA', time: '1 hour ago', icon: 'task_alt' },
];
export const money = (value: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
