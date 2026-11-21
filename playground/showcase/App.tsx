import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Alert, Avatar, AvatarListing, Badge, BreadcrumbsGroup, Button, Card, Checkbox, DataGridCell, DataHeader, Dropdown, Icon, Input, MainMenuItem, MenuFloatMobile, ProgressBar, RadioButton, SidebarMenuDesktop, SidebarMenuItem, SkipContent, Switch } from '../../src/index.js';
import { RevenueChart, ChannelChart, WorkloadChart } from './charts.js';
import { accounts as initialAccounts, activity, money, revenue, type Account, type AccountStatus } from './data.js';

type Preferences = { name: string; email: string; role: string; digest: boolean; updates: boolean; quiet: boolean; density: string };
const initialPreferences: Preferences = { name: 'Alex Kim', email: 'alex@wa11y.example', role: 'Workspace admin', digest: true, updates: false, quiet: false, density: 'comfortable' };
type View = 'overview' | 'accounts' | 'settings';
const pages = { overview: 'Overview', accounts: 'Accounts', settings: 'Settings' };
const route = (): View => location.hash === '#accounts' ? 'accounts' : location.hash === '#settings' ? 'settings' : 'overview';
const initials = (name: string) => name.split(/\s+/).map(word => word[0]).join('').slice(0, 2).toUpperCase();
const status = (value: AccountStatus) => <Badge size="small" status={value === 'Active' ? 'success' : value === 'At risk' ? 'destructive' : value === 'Trial' ? 'warning' : 'neutral'} label={value} />;

function Dialog({ title, description, onClose, children }: { title: string; description: string; onClose: () => void; children: ReactNode }) {
  const ref = useRef<HTMLDialogElement>(null), id = useId();
  useEffect(() => { const dialog = ref.current!; dialog.showModal(); return () => dialog.close(); }, []);
  return <dialog ref={ref} className="app-dialog" aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} onCancel={event => { event.preventDefault(); onClose(); }}>
    <header><div><h2 id={`${id}-title`}>{title}</h2><p id={`${id}-description`}>{description}</p></div><Button variant="icon-only" appearance="link" status="neutral" leadingIcon={<Icon name="close" size={24} />} aria-label="Close dialog" onClick={onClose} /></header>
    {children}
  </dialog>;
}

function AddAccount({ onClose, onAdd }: { onClose: () => void; onAdd: (account: Account) => void }) {
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [plan, setPlan] = useState<Account['plan']>('Growth');
  const [errors, setErrors] = useState({ name: '', email: '' });
  const form = useRef<HTMLFormElement>(null);
  return <Dialog title="A new relationship starts here" description="Add an account to your workspace. All data stays in this demo session." onClose={onClose}>
    <form ref={form} noValidate onSubmit={event => {
      event.preventDefault();
      const next = { name: name.trim().length < 2 ? 'Enter a company name with at least two characters.' : '', email: !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? 'Enter a valid contact email.' : '' };
      setErrors(next);
      if (next.name || next.email) { requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()); return; }
      onAdd({ id: crypto.randomUUID(), name: name.trim(), email: email.trim(), plan, status: 'Trial', mrr: 0, joined: '2026-11-20', health: 60 });
    }}>
      <div className="dialog-fields">
        {(errors.name || errors.email) && <p role="alert" className="form-error">Please review the highlighted fields.</p>}
        <Input autoFocus label="Company name" required autoComplete="organization" value={name} leadingIcon={false} onChange={e => setName(e.target.value)} status={errors.name ? 'error' : 'default'} helper={!!errors.name} helperText={errors.name} placeholder="e.g. Acme Studio" />
        <Input label="Contact email" type="email" required autoComplete="email" value={email} leadingIcon={false} onChange={e => setEmail(e.target.value)} status={errors.email ? 'error' : 'default'} helper={!!errors.email} helperText={errors.email} placeholder="team@company.example" />
        <Dropdown label="Plan" value={plan} onChange={e => setPlan(e.target.value as Account['plan'])}><option>Starter</option><option>Growth</option><option>Enterprise</option></Dropdown>
      </div>
      <footer><Button variant="secondary" status="neutral" leadingIcon={false} onClick={onClose}>Cancel</Button><Button type="submit" leadingIcon={<Icon name="person_add" size={20} />}>Create account</Button></footer>
    </form>
  </Dialog>;
}

function AccountDetails({ account, onClose }: { account: Account; onClose: () => void }) {
  return <Dialog title={account.name} description={`${account.plan} plan · Joined ${new Date(account.joined + 'T12:00:00').toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}`} onClose={onClose}>
    <div className="dialog-fields"><div className="account-detail-identity"><Avatar variant="initials" initials={initials(account.name)} size={32} />{status(account.status)}</div>
      <dl className="account-detail-values"><div><dt>Monthly revenue</dt><dd>{money(account.mrr)}</dd></div><div><dt>Contact</dt><dd><a href={`mailto:${account.email}`}>{account.email}</a></dd></div></dl>
      <div className="health-label"><span>Account health</span><strong>{account.health}%</strong></div><ProgressBar value={account.health} label={`${account.name} account health`} />
    </div><footer><Button leadingIcon={false} onClick={onClose}>Done</Button></footer>
  </Dialog>;
}

export default function App() {
  const [view, setView] = useState<View>(route);
  const [accounts, setAccounts] = useState(initialAccounts), [adding, setAdding] = useState(false), [detail, setDetail] = useState<Account | null>(null);
  const [notice, setNotice] = useState(''), [range, setRange] = useState('6');
  const [selected, setSelected] = useState<string[]>([]), [query, setQuery] = useState(''), [filter, setFilter] = useState('all');
  const [sort, setSort] = useState<'ascending' | 'descending'>('ascending');
  const [preferences, setPreferences] = useState(initialPreferences);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const density = preferences.density;
  const heading = useRef<HTMLHeadingElement>(null), addTrigger = useRef<HTMLButtonElement>(null);
  const mounted = useRef(false);
  useLayoutEffect(() => { if (mounted.current) heading.current?.focus(); else mounted.current = true; }, [view]);
  useEffect(() => {
    const change = () => { setView(route()); };
    window.addEventListener('hashchange', change); return () => window.removeEventListener('hashchange', change);
  }, []);
  const navigate = (next: View) => { if (view === next) { heading.current?.focus(); } else location.hash = next; };
  const visible = useMemo(() => accounts.filter(account => (filter === 'all' || account.status === filter) && `${account.name} ${account.email} ${account.plan}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => (sort === 'ascending' ? 1 : -1) * a.name.localeCompare(b.name)), [accounts, filter, query, sort]);
  const allSelected = visible.length > 0 && visible.every(account => selected.includes(account.id));
  const archive = (ids: string[]) => {
    setAccounts(current => current.map(account => ids.includes(account.id) ? { ...account, status: 'Archived' } : account));
    setSelected([]); setNotice(`${ids.length} ${ids.length === 1 ? 'account' : 'accounts'} archived. Choose Archived in the status filter to find them.`);
  };
  const exportData = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify(visible, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = 'wa11y-accounts.json'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); setNotice(`Exported ${visible.length} accounts.`);
  };
  const accountLink = (account: Account) => <AvatarListing title={account.name} description={account.email} size={40} avatar={{ variant: 'initials', initials: initials(account.name) }} onClick={() => setDetail(account)} />;
  const recentAccounts = accounts.filter(account => account.status !== 'Archived').slice(0, 3);
  return <div className="showcase app-shell" data-density={density} data-sidebar-collapsed={sidebarCollapsed}>
    <SkipContent className="app-skip-link" href="#dashboard-main" label="Skip to main content" />
    <header className="app-header">
      <a className="product-brand" href="../" aria-label="wa11y-ai playground"><img className="brand-mark" src="../assets/avatars/wa11y-favicon.png" width={36} height={36} alt="" /><span>wa11y-ai</span></a>
      <div className="workspace-context"><span className="workspace-name">Studio workspace</span><Badge size="small" status="warning" label="Growth plan" /></div>
      <MainMenuItem className="back-to-system" href="../" label="Design system" leadingIcon={false} />
      <div className="header-user"><Avatar variant="initials" size={32} initials={initials(preferences.name)} alt={preferences.name} /></div>
    </header>
    <aside className="app-sidebar">
      <SidebarMenuDesktop id="dashboard-navigation" className="dashboard-sidebar-menu" label="Workspace" titleTrailingIcon={false} state={sidebarCollapsed ? 'collapsed' : 'default'} onStateChange={state => setSidebarCollapsed(state !== 'default')} aria-label="Workspace navigation" onNavigate={() => navigate('overview')}>
        {(['overview', 'accounts', 'settings'] as const).map(page => <SidebarMenuItem key={page} label={pages[page]} collapsed={sidebarCollapsed} icon={<Icon name={page === 'overview' ? 'space_dashboard' : page === 'accounts' ? 'group' : 'tune'} size={24} />} state={view === page ? 'selected' : 'default'} onClick={() => navigate(page)} />)}
      </SidebarMenuDesktop>
      <div className="sidebar-bottom"><div className="plan-usage"><span className="plan-icon"><Icon name="group_work" size={22} /></span><strong>A little room to grow</strong><p>18 of 25 team seats in use</p><ProgressBar value={72} label="Team seats used" /><span className="usage-note">7 seats available on your plan</span></div>
        <a href="../" className="sidebar-back wa-button wa-button--link wa-button--action wa-button--default"><Icon name="directions_bike" size={24} /><span>wa11y-ai playground</span></a>
      </div>
    </aside>
    <div className="mobile-floating-navigation">
      <MenuFloatMobile aria-label="Mobile workspace navigation" state={view === 'overview' ? 'home' : view === 'accounts' ? 'records' : 'more'}
        items={[{ value: 'home', label: 'Overview', icon: 'space_dashboard' }, { value: 'records', label: 'Accounts', icon: 'group' }, { value: 'more', label: 'Settings', icon: 'tune' }]}
        onNavigate={destination => navigate(destination === 'home' ? 'overview' : destination === 'records' ? 'accounts' : 'settings')} />
    </div>
    <main id="dashboard-main" tabIndex={-1} className="dashboard-main">
      <BreadcrumbsGroup items={[{ label: 'Workspace', href: '#overview', onClick: event => { event.preventDefault(); navigate('overview'); } }, { label: pages[view] }]} />
      <div className="page-heading"><div><p className="eyebrow">WA11Y / YOUR WORKSPACE, IN FOCUS</p><h1 ref={heading} tabIndex={-1}>{view === 'overview' ? 'Business overview' : view === 'accounts' ? 'Good relationships. Better growth.' : 'Make it your workspace.'}</h1><p>{view === 'overview' ? 'Revenue, customers, and the work moving your business forward.' : view === 'accounts' ? 'A thoughtful home for every account, from first hello to what’s next.' : 'Your profile, notifications, and the details that help you do your best work.'}</p></div>
        {view !== 'settings' && <div className="page-actions"><Button variant="secondary" status="neutral" leadingIcon={<Icon name="download" size={20} />} onClick={exportData}>Export data</Button><Button ref={addTrigger} status="action" leadingIcon={<Icon name="add" size={20} />} onClick={() => setAdding(true)}>Add account</Button></div>}
      </div>
      {notice && <Alert className="app-notice" type="success" title={notice} hasDescription={false} onDismiss={() => { setNotice(''); requestAnimationFrame(() => heading.current?.focus()); }} dismissLabel="Dismiss notification" />}
      {view === 'overview' && <>
        <section className="kpi-grid" aria-labelledby="metrics-title"><h2 className="sr-only" id="metrics-title">Performance at a glance</h2>
          {[
            { label: 'Monthly recurring revenue', value: money(48920), trend: '+22.9%', note: 'vs. previous period', icon: 'payments' },
            { label: 'Active customers', value: '1,284', trend: '+8.2%', note: 'vs. previous month', icon: 'group' },
            { label: 'Net revenue retention', value: '108.6%', trend: '+3.4 pts', note: 'vs. previous month', icon: 'trending_up' },
            { label: 'Tasks completed', value: '156', trend: '65% done', note: 'of 240 planned tasks', icon: 'task_alt' },
          ].map(metric => <Card key={metric.label} type="slot" className="metric-card"><div className="metric-label"><h3>{metric.label}</h3><Icon name={metric.icon} size={22} /></div><p className="metric-value">{metric.value}</p><div className="metric-foot"><span><Icon name="north_east" size={14} />{metric.trend}</span><small>{metric.note}</small></div></Card>)}
        </section>
        <div className="overview-section-heading"><div><h2>The bigger picture</h2><p>A steady view of where you are and where you're heading.</p></div><Dropdown label="Revenue period" value={range} onChange={e => setRange(e.target.value)}><option value="6">Last 6 months</option><option value="3">Last 3 months</option></Dropdown></div>
        <div className="chart-grid"><RevenueChart data={revenue.slice(-Number(range))} /><WorkloadChart /></div>
        <div className="insights-grid"><ChannelChart /><section className="dash-panel activity-panel" aria-labelledby="activity-title"><header><div><p className="eyebrow">THE PEOPLE BEHIND THE NUMBERS</p><h2 id="activity-title">Workspace pulse</h2></div><span className="live-dot">This week</span></header>
          <ul className="activity-list">{activity.map(item => <li key={item.person}><Avatar variant="initials" initials={item.initials} size={32} /><div><p><strong>{item.person}</strong> {item.action}</p><span>{item.detail}</span><small>{item.time}</small></div></li>)}</ul>
          <div className="team-note"><Icon name="verified" size={22} /><p><strong>You're in good company.</strong><br />Your team is keeping things moving.</p></div>
        </section></div>
        <section className="dash-panel recent-panel" aria-labelledby="recent-title"><header><div><p className="eyebrow">GROWING TOGETHER</p><h2 id="recent-title">Recent relationships</h2></div><Button variant="link" status="action" leadingIcon={false} trailingIcon={<Icon name="arrow_forward" size={18} />} onClick={() => navigate('accounts')}>All accounts</Button></header><ul>{recentAccounts.map(account => <li key={account.id}>{accountLink(account)}<span className="recent-plan">{account.plan}</span>{status(account.status)}<strong>{money(account.mrr)}<small>/mo</small></strong></li>)}</ul></section>
      </>}
      {view === 'accounts' && <section className="dash-panel accounts-panel" aria-labelledby="accounts-title"><header><div><h2 id="accounts-title">Your accounts <span className="account-count">{accounts.length}</span></h2><p>A fictional sample of your customer portfolio.</p></div><span className="dataset-note">Demo data · November 2026</span></header>
        <div className="account-toolbar"><Input label="Search accounts" showLabel={false} value={query} onChange={e => setQuery(e.target.value)} placeholder="Search by company, email, or plan" /><Dropdown label="Account status" showLabel={false} value={filter} onChange={e => { setFilter(e.target.value); setSelected([]); }}><option value="all">All statuses</option>{['Active', 'Trial', 'At risk', 'Archived'].map(value => <option key={value}>{value}</option>)}</Dropdown><span role="status">{visible.length} {visible.length === 1 ? 'account' : 'accounts'}</span></div>
        {selected.length > 0 && <div className="bulk-actions"><span>{selected.length} selected</span><Button size="small" variant="secondary" status="neutral" leadingIcon={<Icon name="archive" size={20} />} onClick={() => { archive(selected); requestAnimationFrame(() => heading.current?.focus()); }}>Archive selected</Button><Button size="small" variant="link" status="action" leadingIcon={false} onClick={() => { setSelected([]); requestAnimationFrame(() => heading.current?.focus()); }}>Clear selection</Button></div>}
        {visible.length === 0 ? <div className="empty-state"><Icon name="search_off" size={40} /><h3>No accounts found</h3><p>Try another company name, or clear your filters to start fresh.</p><Button variant="secondary" status="action" leadingIcon={false} onClick={() => { setQuery(''); setFilter('all'); }}>Clear filters</Button></div> : <>
          <div className="table-scroll desktop-accounts" role="region" aria-label="Accounts table" tabIndex={0}><table className="accounts-table"><caption className="sr-only">Account names, plans, statuses, monthly revenue, and archive actions</caption><thead><tr>
            <DataHeader layout="selection" aria-label="Select accounts" selection={{ label: 'Select all visible accounts', checked: allSelected, indeterminate: !allSelected && visible.some(account => selected.includes(account.id)), onChange: e => setSelected(e.target.checked ? visible.map(account => account.id) : []) }} />
            <DataHeader headerContent="Company" weight="semibold" sorting sortDirection={sort} onSort={() => setSort(current => current === 'ascending' ? 'descending' : 'ascending')} />
            <DataHeader headerContent="Plan" /><DataHeader headerContent="Status" /><DataHeader headerContent="Monthly revenue" /><DataHeader headerContent="Action" />
          </tr></thead><tbody>{visible.map(account => <tr key={account.id}>
            <DataGridCell type="multi-select" selection={{ label: `Select ${account.name}`, checked: selected.includes(account.id), onChange: e => setSelected(current => e.target.checked ? [...current, account.id] : current.filter(id => id !== account.id)) }} />
            <DataGridCell>{accountLink(account)}</DataGridCell><DataGridCell>{account.plan}</DataGridCell><DataGridCell>{status(account.status)}</DataGridCell><DataGridCell><span className="table-money">{money(account.mrr)}</span></DataGridCell><DataGridCell><Button variant="icon-only" appearance="link" status="neutral" leadingIcon={<Icon name="archive" size={20} />} disabled={account.status === 'Archived'} aria-label={`Archive ${account.name}`} onClick={() => { archive([account.id]); requestAnimationFrame(() => heading.current?.focus()); }} /></DataGridCell>
          </tr>)}</tbody></table></div>
          <ul className="mobile-accounts">{visible.map(account => <li key={account.id}><div>{accountLink(account)}{status(account.status)}</div><dl><div><dt>Plan</dt><dd>{account.plan}</dd></div><div><dt>Monthly revenue</dt><dd>{money(account.mrr)}</dd></div></dl><Button size="small" variant="secondary" status="neutral" leadingIcon={<Icon name="archive" size={20} />} disabled={account.status === 'Archived'} onClick={() => archive([account.id])}>Archive {account.name}</Button></li>)}</ul>
        </>}
        <footer className="table-footer"><span>Showing {visible.length} of {accounts.length} sample accounts</span><span>Local session · no backend</span></footer>
      </section>}
      {view === 'settings' && <Settings initial={preferences} onSave={next => { setPreferences(next); setNotice('Preferences saved for this demo session.'); }} />}
      <footer className="showcase-credit"><span className="credit-icon"><Icon name="widgets" size={22} /></span><div><strong>Built with wa11y-ai</strong><p>Reusable React components, semantic design tokens, and accessibility-focused patterns, composed into a responsive enterprise application.</p></div><span className="creator-credit">Created by <a href="https://claudiakich.com" target="_blank" rel="noopener noreferrer" aria-label="Cláudia Kich (opens in a new tab or window)">Cláudia Kich</a></span></footer>
    </main>
    {adding && <AddAccount onClose={() => setAdding(false)} onAdd={account => { setAccounts(current => [account, ...current]); setAdding(false); setNotice(`${account.name} added. Ready for a great first impression.`); requestAnimationFrame(() => addTrigger.current?.focus()); }} />}
    {detail && <AccountDetails account={detail} onClose={() => setDetail(null)} />}
  </div>;
}

function Settings({ initial, onSave }: { initial: Preferences; onSave: (preferences: Preferences) => void }) {
  const [name, setName] = useState(initial.name), [email, setEmail] = useState(initial.email), [role, setRole] = useState(initial.role);
  const [emailError, setEmailError] = useState(false), [nameError, setNameError] = useState(false), [digest, setDigest] = useState(initial.digest), [updates, setUpdates] = useState(initial.updates), [quiet, setQuiet] = useState(initial.quiet), [density, setDensity] = useState(initial.density);
  const form = useRef<HTMLFormElement>(null);
  return <form ref={form} className="settings-layout" noValidate onSubmit={event => { event.preventDefault(); const invalidEmail = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email); const invalidName = name.trim().length < 2; setEmailError(invalidEmail); setNameError(invalidName); if (invalidEmail || invalidName) { requestAnimationFrame(() => form.current?.querySelector<HTMLInputElement>('[aria-invalid="true"]')?.focus()); return; } onSave({ name: name.trim(), email: email.trim(), role, digest, updates, quiet, density }); }}>
    <section className="dash-panel settings-panel" aria-labelledby="profile-title"><header><div><p className="eyebrow">THE BASICS</p><h2 id="profile-title">Your profile</h2><p>A few details that make this workspace yours.</p></div><Avatar variant="initials" initials={initials(name)} size={32} /></header><div className="settings-fields"><Input label="Full name" required status={nameError ? 'error' : 'default'} helper={nameError} helperText="Enter your full name." value={name} onChange={e => setName(e.target.value)} autoComplete="name" leadingIcon={false} /><Input label="Email address" required type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" leadingIcon={false} status={emailError ? 'error' : 'default'} helper={emailError} helperText="Enter a valid email address." /><Dropdown label="Workspace role" value={role} onChange={e => setRole(e.target.value)}><option>Workspace admin</option><option>Team member</option><option>Observer</option></Dropdown></div></section>
    <section className="dash-panel settings-panel" aria-labelledby="preferences-title"><header><div><p className="eyebrow">A LITTLE LESS NOISE</p><h2 id="preferences-title">Notifications & preferences</h2></div><Icon name="notifications_none" size={24} /></header>
      <div className="preference-row"><div><h3>Quiet hours</h3><p>Pause notifications outside working hours.</p></div><Switch size="small" aria-label="Enable quiet hours" on={quiet} onChange={e => setQuiet(e.target.checked)} /></div>
      <fieldset className="preference-fieldset"><legend>Email updates</legend><Checkbox label="Weekly performance summary" checked={digest} onChange={e => setDigest(e.target.checked)} /><Checkbox label="Product news and improvements" checked={updates} onChange={e => setUpdates(e.target.checked)} /></fieldset>
      <fieldset className="preference-fieldset"><legend>Account table density</legend><RadioButton name="account-density" value="comfortable" label="Comfortable" checked={density === 'comfortable'} onChange={() => setDensity('comfortable')} /><RadioButton name="account-density" value="compact" label="Compact" checked={density === 'compact'} onChange={() => setDensity('compact')} /></fieldset>
    </section>
    <div className="settings-save"><p>Preferences are saved in memory for this demo session.</p><Button type="submit" status="action" leadingIcon={<Icon name="check" size={20} />}>Save preferences</Button></div>
  </form>;
}
