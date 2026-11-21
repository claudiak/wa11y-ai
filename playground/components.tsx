import { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Button, type ButtonStatus } from '../src/components/Button.js';
import { Input, type InputStatus } from '../src/components/Input.js';
import { Dropdown } from '../src/components/Dropdown.js';
import { Checkbox, type CheckboxStatus } from '../src/components/Checkbox.js';
import { RadioButton, type RadioButtonStatus } from '../src/components/RadioButton.js';
import { Switch, type SwitchState } from '../src/components/Switch.js';
import { Icon } from '../src/components/Icon.js';
import { Badge, type BadgeStatus } from '../src/components/Badge.js';

import { Alert, type AlertType } from '../src/components/Alert.js';

import { Avatar, type AvatarProps, type AvatarSize } from '../src/components/Avatar.js';
import { AvatarGroup } from '../src/components/AvatarGroup.js';

import { AvatarListing } from '../src/components/AvatarListing.js';

import { Card, type CardType } from '../src/components/Card.js';

import { ProgressBar } from '../src/components/ProgressBar.js';

import { CardHorizontal, type CardHorizontalType } from '../src/components/CardHorizontal.js';

import { DataHeader } from '../src/components/DataHeader.js';
import { DataGridCell } from '../src/components/DataGridCell.js';

import { SidebarMenuDesktop } from '../src/components/Sidebar.js';
import { MenuFloatMobile, type MenuFloatMobileState } from '../src/components/MenuFloatMobile.js';
import { MainMenuItem } from '../src/components/MainMenuItem.js';

export function mountHeaderNavigation(container: HTMLElement) {
  const root = createRoot(container);
  root.render(<nav aria-label="Main navigation">
    <MainMenuItem href="./showcase/index.html" label="Live Showcase" leadingIcon={false} trailingIcon={<Icon name="arrow_forward" size={24} />} />
  </nav>);
}

import { BreadcrumbsGroup } from '../src/components/Breadcrumbs.js';

import { SkipContentGroup } from '../src/components/SkipContent.js';

import { Tooltip } from '../src/components/Tooltip.js';

function restoreFocusAfterRemoval(update: () => void, selector: string) {
  const active = document.activeElement;
  update();
  requestAnimationFrame(() => {
    if (active && !active.isConnected) document.querySelector<HTMLElement>(selector)?.focus();
  });
}

const statuses = ['user-profile', 'success', 'warning', 'destructive', 'action', 'neutral'] as const;

function ButtonPlayground() {
  const [status, setStatus] = useState<ButtonStatus>('user-profile');
  const [variant, setVariant] = useState<'primary' | 'secondary' | 'icon-only' | 'link'>('primary');
  const [size, setSize] = useState<'default' | 'small'>('default');
  const [linkAppearance, setLinkAppearance] = useState(false);
  const [pill, setPill] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [leading, setLeading] = useState(true);
  const [trailing, setTrailing] = useState(false);
  const [clicks, setClicks] = useState(0);
  const handleClick = () => setClicks(count => count + 1);
  const common = { size, pill, appearance: linkAppearance ? 'link' as const : 'default' as const, disabled, leadingIcon: leading, trailingIcon: trailing, onClick: handleClick };
  const preview = variant === 'icon-only' ? <Button {...common} variant="icon-only" status={status} aria-label="Add item" /> :
    variant === 'link' ? <Button {...common} variant="link" status={status}>Label</Button> : <Button {...common} variant={variant} status={status}>Label</Button>;
  return <div className="button-playground component-section">
    <h3 id="button-preview-heading">Button</h3>
    <section className="button-builder" aria-labelledby="button-preview-heading">
      <div className="button-builder-controls">
        <p>Default &amp; Small · React component</p>
        <div className="field"><label htmlFor="button-status">Status</label><span className="select-wrap"><select id="button-status" value={status} onChange={e => setStatus(e.target.value as ButtonStatus)}>{statuses.map(s => <option key={s}>{s}</option>)}</select></span></div>
        <div className="field"><label htmlFor="button-variant">Variant</label><span className="select-wrap"><select id="button-variant" value={variant} onChange={e => setVariant(e.target.value as typeof variant)}><option>primary</option><option>secondary</option><option>icon-only</option><option>link</option></select></span></div>
        <div className="field"><label htmlFor="button-size">Size</label><span className="select-wrap"><select id="button-size" value={size} onChange={e => setSize(e.target.value as typeof size)}><option>default</option><option>small</option></select></span></div>
        <label className="checkbox-field"><input type="checkbox" checked={linkAppearance} onChange={e => setLinkAppearance(e.target.checked)} />Link appearance</label>
        <label className="checkbox-field"><input type="checkbox" checked={pill} onChange={e => setPill(e.target.checked)} />Pill shape</label>
        <label className="checkbox-field"><input type="checkbox" checked={disabled} onChange={e => setDisabled(e.target.checked)} />Disabled</label>
        <label className="checkbox-field"><input type="checkbox" checked={leading} onChange={e => setLeading(e.target.checked)} />Leading icon</label>
        <label className="checkbox-field"><input type="checkbox" checked={trailing} onChange={e => setTrailing(e.target.checked)} />Trailing icon</label>
      </div>
      <div className="button-preview-area">
        <div className="button-preview-target">{preview}</div>
        <p role="status" aria-live="polite">Activated {clicks} {clicks === 1 ? 'time' : 'times'}</p>
        <code>{`<Button variant="${variant}"${` status="${status}" size="${size}"`}${linkAppearance ? ' appearance="link"' : ''}${pill ? ' pill' : ''}${disabled ? ' disabled' : ''}${variant === 'icon-only' ? ' aria-label="Add item" />' : '>Label</Button>'}`}</code>
        <p>Tab to inspect the focus ring. Enter, Space, and pointer activation use native button behavior.</p>
      </div>
    </section>
    <section className="button-matrix-section" aria-labelledby="button-matrix-heading">
      <h3 id="button-matrix-heading">Status &amp; type</h3>
      <p>Both sizes and all statuses. Hover or Tab through the controls to inspect their states.</p>
      <div className="button-matrix">{statuses.map(s => <article key={s} className="button-matrix-group">
        <h4>{s}</h4>{(['default', 'small'] as const).map(buttonSize => <div key={buttonSize} style={{ marginBottom: 'var(--wa11y-spacing-spacing-16)' }}>
          <span>{buttonSize}</span><Button status={s} size={buttonSize} onClick={handleClick}>Label</Button>
          <Button status={s} size={buttonSize} variant="secondary" onClick={handleClick}>Label</Button>
          <Button status={s} size={buttonSize} variant="icon-only" aria-label={`Add ${s} item`} onClick={handleClick} />
          <Button status={s} size={buttonSize} variant="link" onClick={handleClick}>Label</Button>
          <Button status={s} size={buttonSize} variant="icon-only" appearance="link" aria-label={`Add ${s} item as link`} onClick={handleClick} />
        </div>)}
      </article>)}</div>
    </section>
  </div>;
}

export function mountButtonPlayground(container: HTMLElement) {
  const root = createRoot(container); root.render(<><IconPlayground /><InputPlayground /><DropdownPlayground /><CheckboxPlayground /><RadioPlayground /><SwitchPlayground /><BadgePlayground /><AlertPlayground /><AvatarPlayground /><AvatarListingPlayground /><CardPlayground /><CardHorizontalPlayground /><ProgressBarPlayground /><DataTablePlayground /><SidebarPlayground /><MenuFloatMobilePlayground /><MainMenuItemPlayground /><BreadcrumbsPlayground /><SkipContentPlayground /><TooltipPlayground /><ButtonPlayground /></>);
  return () => root.unmount();
}

function BadgePlayground() {
  const [dismissed, setDismissed] = useState(false);
  const variants: BadgeStatus[] = ['user-profile', 'info', 'success', 'warning', 'destructive', 'dark', 'neutral', 'disabled'];
  return <section className="component-section" aria-labelledby="badge-preview-heading">
    <h3 id="badge-preview-heading">Badge</h3>
    <div className="button-matrix">
      <article className="button-matrix-group"><h4>Icons, avatar &amp; dismissal</h4>
        <div>
        {!dismissed && <Badge label="Claudia" avatar={<Avatar {...claudiaAvatar} size={20} />} onDismiss={() => restoreFocusAfterRemoval(() => setDismissed(true), '#restore-badge')} />}
        <Badge label="Icon" size="small" leadingIcon trailingIcon />
        {dismissed && <button id="restore-badge" type="button" className="copy" onClick={() => restoreFocusAfterRemoval(() => setDismissed(false), 'section[aria-labelledby="badge-preview-heading"] .wa-badge__dismiss')}>Restore badge</button>}
      </div></article>
      {variants.map(status => <article key={status} className="button-matrix-group"><h4>{status}</h4><div>
        <Badge status={status} avatar={status === 'user-profile' ? <Avatar {...claudiaAvatar} size={20} /> : undefined} />
        <Badge status={status} size="small" leadingIcon />
        <Badge status={status} state="focus" />
        <Badge status={status} size="small" state="focus" avatar={status === 'user-profile' ? <Avatar {...claudiaAvatar} size={16} /> : undefined} trailingIcon={status !== 'user-profile'} />
      </div></article>)}
    </div>
  </section>;
}

function IconPlayground() {
  const [fill, setFill] = useState(false);
  return <section className="component-section" aria-labelledby="icon-preview-heading">
    <h3 id="icon-preview-heading">Icons · Material Symbols Outlined</h3>
    <div className="button-matrix-group">
      <label className="checkbox-field"><input type="checkbox" checked={fill} onChange={e => setFill(e.target.checked)} />Filled icons</label>
      <div style={{ display: 'flex', gap: 'var(--wa11y-spacing-spacing-24)', flexWrap: 'wrap', marginTop: 'var(--wa11y-spacing-spacing-16)' }}>
        {['add', 'arrow_forward', 'search', 'calendar_today', 'help', 'expand_more'].map(name => <div key={name} style={{ display: 'grid', justifyItems: 'center', gap: 'var(--wa11y-spacing-spacing-8)' }}><Icon name={name} size={32} fill={fill} /><code>{name}</code></div>)}
      </div>
      <p><Icon name="info" size={20} label="Information" /> Icons inherit text colour; labels expose meaningful icons to assistive technology.</p>
    </div>
  </section>;
}

function SwitchPlayground() {
  const [on, setOn] = useState(true);
  const largeStates: SwitchState[] = ['default', 'hovered', 'focused', 'pressed', 'disabled'];
  const smallStates = ['default', 'hovered', 'focused', 'disabled'] as const;
  return <section className="component-section" aria-labelledby="switch-preview-heading">
    <h3 id="switch-preview-heading">Switch · Large &amp; Small</h3>
    <div className="button-matrix">
      <article className="button-matrix-group"><h4>Interactive</h4><div><Switch aria-label="Large switch" on={on} onChange={e => setOn(e.target.checked)} /><Switch size="small" aria-label="Small switch" on={on} onChange={e => setOn(e.target.checked)} /></div></article>
      {largeStates.map(state => <article className="button-matrix-group" key={state}><h4>Large · {state}</h4><div><Switch state={state} defaultOn aria-label={`Large ${state} on`} /><Switch state={state} defaultOn={false} aria-label={`Large ${state} off`} /></div></article>)}
      {smallStates.map(state => <article className="button-matrix-group" key={`small-${state}`}><h4>Small · {state}</h4><div><Switch size="small" state={state} defaultOn aria-label={`Small ${state} on`} /><Switch size="small" state={state} defaultOn={false} aria-label={`Small ${state} off`} /></div></article>)}
    </div>
  </section>;
}

function RadioPlayground() {
  const [value, setValue] = useState('first');
  const variants: RadioButtonStatus[] = ['unselected', 'selected', 'success', 'success-selected', 'error', 'error-selected', 'disabled', 'disabled-selected'];
  return <section className="component-section" aria-labelledby="radio-preview-heading">
    <h3 id="radio-preview-heading">Radio button</h3>
    <div className="button-matrix">
      <article className="button-matrix-group"><h4>Interactive group</h4><fieldset style={{ border: 0, padding: 0, margin: 0, display: 'grid', gap: 'var(--wa11y-spacing-spacing-12)' }}>
        <legend>Choose an option</legend>
        {['first', 'second', 'third'].map(option => <RadioButton key={option} name="radio-example" value={option} label={option} checked={value === option} onChange={e => setValue(e.target.value)} />)}
      </fieldset></article>
      {variants.map(status => <article className="button-matrix-group" key={status}><h4>{status}</h4><RadioButton status={status} label="Label" /></article>)}
    </div>
  </section>;
}

function CheckboxPlayground() {
  const [checked, setChecked] = useState(false);
  const variants: CheckboxStatus[] = ['unselected', 'selected', 'success', 'success-selected', 'disabled', 'disabled-selected'];
  return <section className="component-section" aria-labelledby="checkbox-preview-heading">
    <h3 id="checkbox-preview-heading">Checkbox</h3>
    <div className="button-matrix">
      <article className="button-matrix-group"><h4>Interactive</h4><Checkbox label="Label" checked={checked} onChange={e => setChecked(e.target.checked)} /></article>
      {variants.map(status => <article className="button-matrix-group" key={status}><h4>{status}</h4><Checkbox status={status} label="Label" /></article>)}
    </div>
  </section>;
}

function DropdownPlayground() {
  const [value, setValue] = useState('');
  return <section className="component-section" aria-labelledby="dropdown-preview-heading">
    <h3 id="dropdown-preview-heading">Dropdown</h3>
    <div className="button-matrix">{(['default', 'selected', 'focus', 'error', 'disabled'] as const).map(status =>
      <article className="button-matrix-group" key={status}><h4>{status}</h4>
        <Dropdown label="Country" status={status} value={value} onChange={e => setValue(e.target.value)} helper={status === 'error'} helperText="Choose a country.">
          <option value="" disabled>Select country</option>
          <option value="brazil">Brazil</option><option value="canada">Canada</option><option value="ireland">Ireland</option>
        </Dropdown>
      </article>)}</div>
  </section>;
}

function InputPlayground() {
  const [status, setStatus] = useState<InputStatus>('default');
  const [helper, setHelper] = useState(true);
  const [trailing, setTrailing] = useState(false);
  return <section className="component-section" aria-labelledby="input-preview-heading">
    <h3 id="input-preview-heading">Input</h3>
    <div className="button-builder">
      <div className="button-builder-controls">
        <div className="field"><label htmlFor="input-status">Status</label><span className="select-wrap"><select id="input-status" value={status} onChange={e => setStatus(e.target.value as InputStatus)}>{['default', 'filled', 'selected', 'focus', 'error', 'disabled'].map(s => <option key={s}>{s}</option>)}</select></span></div>
        <label className="checkbox-field"><input type="checkbox" checked={helper} onChange={e => setHelper(e.target.checked)} />Helper text</label>
        <label className="checkbox-field"><input type="checkbox" checked={trailing} onChange={e => setTrailing(e.target.checked)} />Trailing icon</label>
      </div>
      <div className="button-preview-area"><Input key={status} label="Input" status={status} defaultValue={status === 'filled' ? 'Placeholder' : undefined} helper={helper} helperText={status === 'error' ? 'Check this value.' : 'Helper text'} trailingIcon={trailing} required hasTip tipText="Enter a value." /></div>
    </div>
    <div className="button-matrix">{(['default', 'selected', 'focus', 'filled', 'disabled', 'error'] as const).map(s => <article className="button-matrix-group" key={s}><h4>{s}</h4><Input label="Input" status={s} helper={s === 'error'} helperText="Check this value." defaultValue={s === 'filled' ? 'Placeholder' : undefined} /></article>)}</div>
  </section>;
}

function AlertPlayground() {
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [description, setDescription] = useState(false);
  const types: AlertType[] = ['destructive', 'info', 'warning', 'neutral', 'disabled', 'success'];
  return <section className="component-section" aria-labelledby="alert-preview-heading">
    <h3 id="alert-preview-heading">Alert</h3>
    <div className="button-builder">
      <div className="button-builder-controls">
        <label className="checkbox-field"><input type="checkbox" checked={description} onChange={e => setDescription(e.target.checked)} />Description</label>
        <button id="restore-alerts" type="button" onClick={() => setDismissed([])}>Restore dismissed alerts</button>
      </div>
      <div className="button-matrix">
        {types.map(type => <article className="button-matrix-group" key={type}><h4>{type}</h4>
          {(['default', 'focus'] as const).map(state => {
            const id = `${type}-${state}`;
            return dismissed.includes(id) ? null : <Alert key={id} type={type} state={state} hasDescription={description}
              style={{ marginBlock: 'var(--wa11y-spacing-spacing-12)' }}
              onDismiss={() => restoreFocusAfterRemoval(() => setDismissed(current => [...current, id]), '#restore-alerts')} dismissLabel={`Dismiss ${type} ${state} alert`} />;
          })}
        </article>)}
      </div>
    </div>
  </section>;
}

const avatarPhoto = (name: string) => `/playground/assets/avatars/${name.toLowerCase()}.png`;
const claudiaAvatar: AvatarProps = { alt: 'Claudia', children: <>
  <img className="wa-avatar__photo" src={avatarPhoto('Claudia')} alt="" />
  <span className="avatar-example-crop"><span><img src="/playground/assets/avatars/claudia-overlay.jpg" alt="" /></span></span>
</> };
function AvatarPlayground() {
  const sizes: AvatarSize[] = [40, 32, 24, 20, 16];
  const people = ['Anne', 'Claudia', 'Gilmar', 'Icon', 'Joe', 'John', 'Mark', 'Marta', 'Mary', 'Michael', 'Michelle', 'initials'];
  const group = [claudiaAvatar, { src: avatarPhoto('Gilmar'), alt: 'Gilmar' }, { src: avatarPhoto('Anne'), alt: 'Anne' }];
  const [hasNumber, setHasNumber] = useState(true);
  return <>
    <section className="component-section" aria-labelledby="avatar-preview-heading">
      <h3 id="avatar-preview-heading">Avatar</h3>
      <div className="button-matrix">
        {people.map(person => <article className="button-matrix-group" key={person}><h4>{person}</h4><div>
          {sizes.filter(size => person !== 'initials' || size !== 40).map(size => person === 'Claudia' ? <Avatar key={size} {...claudiaAvatar} size={size} /> :
            person === 'initials' ? <Avatar key={size} variant="initials" size={size as 16 | 20 | 24 | 32} initials="CK" alt="Claudia" /> :
            person === 'Icon' ? <Avatar key={size} variant="icon" size={size} alt="User" /> : <Avatar key={size} size={size} src={avatarPhoto(person)} alt={person} />)}
        </div></article>)}
      </div>
    </section>
    <section className="component-section" aria-labelledby="avatar-group-preview-heading">
      <h3 id="avatar-group-preview-heading">Avatar Group</h3>
      <div className="button-builder">
        <div className="button-builder-controls"><label className="checkbox-field"><input type="checkbox" checked={hasNumber} onChange={e => setHasNumber(e.target.checked)} />Show additional count</label></div>
        <div className="button-matrix">{([40, 32, 24, 16] as const).map(size => <article className="button-matrix-group" key={size}><h4>{size}px</h4><AvatarGroup avatars={group} size={size} additionalCount={22} hasNumber={hasNumber} /></article>)}</div>
      </div>
    </section>
  </>;
}

function AvatarListingPlayground() {
  const [hasDetails, setHasDetails] = useState(true);
  const [hasDescription, setHasDescription] = useState(true);
  const [hasDragDrop, setHasDragDrop] = useState(false);
  const [selected, setSelected] = useState('');
  return <section className="component-section" aria-labelledby="avatar-listing-heading">
    <h3 id="avatar-listing-heading">Avatar Listing</h3>
    <div className="button-builder">
      <div className="button-builder-controls">
        <label className="checkbox-field"><input type="checkbox" checked={hasDetails} onChange={e => setHasDetails(e.target.checked)} />Details</label>
        <label className="checkbox-field"><input type="checkbox" checked={hasDescription} onChange={e => setHasDescription(e.target.checked)} />Description</label>
        <label className="checkbox-field"><input type="checkbox" checked={hasDragDrop} onChange={e => setHasDragDrop(e.target.checked)} />Drag grip</label>
        <output aria-live="polite">{selected ? `Activated ${selected}` : 'Select a listing'}</output>
      </div>
      <div className="button-matrix">{([40, 32, 24, 16] as const).map(size => <article className="button-matrix-group" key={size}><h4>{size}px</h4><div>
        {(['default', 'hover', 'focus'] as const).map(state => <AvatarListing key={state} avatar={claudiaAvatar} size={size} state={state}
          hasDetails={hasDetails} hasDescription={hasDescription} hasDragDrop={hasDragDrop} onClick={() => setSelected(`${size}px ${state}`)} />)}
      </div></article>)}</div>
    </div>
  </section>;
}

function CardPlayground() {
  const [message, setMessage] = useState('Try Skip or Start Now');
  const [details, setDetails] = useState(true);
  const [progress, setProgress] = useState(50);
  const participants = [claudiaAvatar, { src: avatarPhoto('Gilmar'), alt: 'Gilmar' }, { src: avatarPhoto('Anne'), alt: 'Anne' }];
  const types: CardType[] = ['full', 'image', 'simple', 'slot'];
  return <section className="component-section" aria-labelledby="card-preview-heading">
    <h3 id="card-preview-heading">Card</h3>
    <div className="button-matrix-group">
      <label className="checkbox-field"><input type="checkbox" checked={details} onChange={e => setDetails(e.target.checked)} />Optional recommendations, metadata, progress and author</label>
      <label htmlFor="card-progress">Progress: {progress}%</label><input id="card-progress" type="range" min={0} max={100} value={progress} onChange={e => setProgress(Number(e.target.value))} />
      <output aria-live="polite">{message}</output>
    </div>
    {(['default'] as const).map(state => <section key={state} aria-label={`${state} cards`}>
      <h4>{state}</h4><div className="card-showcase">
        {types.map(type => <Card key={type} type={type} state={state} participants={participants} additionalCount={22}
          tag={details} recommendation={details} metaRow={details} progressBar={details} avatar={details} progress={progress}
          image={{ src: '/playground/assets/cards/memory.png', alt: 'A student writing at a desk with a laptop' }}
          onSkip={() => setMessage(`Skipped ${type} card`)} onStart={() => setMessage(`Started ${type} card`)}
          author={<AvatarListing title="Anne Guedes" description="10 min" avatar={{ src: avatarPhoto('Anne') }} onClick={() => setMessage('Opened Anne Guedes')} />}>
          {type === 'slot' && <div className="card-slot-example"><p>Slot Placeholder</p><span>SWITCH TO YOUR COMPONENT</span></div>}
        </Card>)}
      </div>
    </section>)}
  </section>;
}

function ProgressBarPlayground() {
  const [value, setValue] = useState(50);
  return <section className="component-section" aria-labelledby="progress-preview-heading">
    <h3 id="progress-preview-heading">Progress Bar</h3>
    <div className="button-matrix">
      <article className="button-matrix-group"><h4>Interactive</h4>
        <label htmlFor="progress-example">Progress: {value}%</label>
        <input id="progress-example" type="range" min={0} max={100} value={value} onChange={e => setValue(Number(e.target.value))} />
        <ProgressBar value={value} label="Interactive progress" />
      </article>
      {(['100', '50', '25'] as const).map(percentual => <article key={percentual} className="button-matrix-group"><h4>{percentual}%</h4><ProgressBar percentual={percentual} label={`${percentual}% example`} /></article>)}
    </div>
  </section>;
}

function CardHorizontalPlayground() {
  const [hasButton, setHasButton] = useState(true);
  const [hasClose, setHasClose] = useState(true);
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [message, setMessage] = useState('Try Join, Follow, or dismiss');
  const types: CardHorizontalType[] = ['image', 'avatar', 'icon', 'slot'];
  return <section className="component-section" aria-labelledby="card-horizontal-heading">
    <h3 id="card-horizontal-heading">Card Horizontal</h3>
    <div className="button-matrix-group">
      <label className="checkbox-field"><input type="checkbox" checked={hasButton} onChange={e => setHasButton(e.target.checked)} />Action button</label>
      <label className="checkbox-field"><input type="checkbox" checked={hasClose} onChange={e => setHasClose(e.target.checked)} />Dismiss button</label>
      <button id="restore-cards" type="button" style={{ marginTop: 'var(--wa11y-spacing-spacing-20)' }} onClick={() => setDismissed([])}>Restore dismissed cards</button>
      <output aria-live="polite">{message}</output>
    </div>
    <div className="horizontal-card-showcase">{(['default', 'hover', 'focus'] as const).map(state => <section key={state} aria-label={`${state} horizontal cards`}><h4>{state}</h4><div className="horizontal-card-examples">
      {types.map(type => {
        const id = `${state}-${type}`;
        return dismissed.includes(id) ? null : <CardHorizontal key={type} type={type} state={state} hasButton={hasButton} hasClose={hasClose}
          image={{ src: '/playground/assets/horizontal-card/blue-lake.png', alt: '' }} avatar={{ src: avatarPhoto('Anne') }}
          onAction={() => setMessage(`${type === 'avatar' ? 'Followed Martha Carvalho' : 'Joined community'} (${state})`)}
          onDismiss={() => restoreFocusAfterRemoval(() => { setDismissed(current => [...current, id]); setMessage(`Dismissed ${state} ${type} card`); }, '#restore-cards')}>
          {type === 'slot' && <button type="button" className="horizontal-card-slot" aria-label="Add custom content" onClick={() => setMessage('Add custom content')}><Icon name="add" size={24} /></button>}
        </CardHorizontal>;
      })}
    </div></section>)}</div>
  </section>;
}

function DataTablePlayground() {
  const [rows, setRows] = useState([1, 2, 3]);
  const [selected, setSelected] = useState<number[]>([]);
  const [direction, setDirection] = useState<'none' | 'ascending' | 'descending'>('none');
  const [message, setMessage] = useState('Select rows, sort, or use an action');
  const [editing, setEditing] = useState<number | null>(null);
  const [names, setNames] = useState<Record<number, string>>({});
  const sorted = [...rows].sort((a, b) => {
    if (direction === 'none') return a - b;
    const comparison = (names[a] ?? 'Name Surname').localeCompare(names[b] ?? 'Name Surname') || a - b;
    return direction === 'descending' ? -comparison : comparison;
  });
  const allSelected = rows.length > 0 && rows.every(id => selected.includes(id));
  const download = (id: number) => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ name: names[id] ?? 'Name Surname', email: 'name@email.com', date: 'July 18, 2026' }, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a'); link.href = url; link.download = `row-${id}.json`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000); setMessage(`Downloaded row ${id}`);
  };
  return <section className="component-section" aria-labelledby="data-table-heading">
    <h3 id="data-table-heading">Data Header &amp; DataGrid Cell</h3>
    <div className="button-matrix-group">
      <button id="restore-table" type="button" onClick={() => { setRows([1, 2, 3]); setSelected([]); setNames({}); setEditing(null); setDirection('none'); setMessage('Table restored'); }}>Restore table</button>
      <output aria-live="polite">{message} · {selected.length} selected</output>
    </div>
    <div className="data-table-scroll" role="region" aria-label="Table demonstration" tabIndex={0}>
      <table className="data-table-demo">
        <caption className="sr-only">Figma table template with selectable rows and actions</caption>
        <colgroup>{[48, 176, 166, 118, 212].map((width, i) => <col key={i} style={{ width }} />)}</colgroup>
        <thead><tr>
          <DataHeader layout="selection" aria-label="Select rows" selection={{ checked: allSelected, disabled: rows.length === 0,
            indeterminate: selected.length > 0 && !allSelected, onChange: e => setSelected(e.target.checked ? [...rows] : []) }} />
          <DataHeader headerContent="Person" weight="semibold" sorting sortDirection={direction} onSort={() => setDirection(current => current === 'ascending' ? 'descending' : 'ascending')} />
          <DataHeader headerContent="Email" /><DataHeader headerContent="Date" /><DataHeader headerContent="Actions" />
        </tr></thead>
        <tbody>{sorted.map(id => <tr key={id}>
          <DataGridCell type="multi-select" selection={{ label: `Select row ${id}`, checked: selected.includes(id), onChange: e => setSelected(current => e.target.checked ? [...current, id] : current.filter(value => value !== id)) }} />
          <DataGridCell avatar={claudiaAvatar} name={names[id] ?? 'Name Surname'} onAvatarClick={() => setMessage(`Viewed row ${id}`)}>
            {editing === id ? <form className="data-table-edit" onSubmit={e => { e.preventDefault(); restoreFocusAfterRemoval(() => { setEditing(null); setMessage(`Saved row ${id}`); }, `#row-${id}-actions button:nth-child(2)`); }}>
              <Input autoFocus label={`Name for row ${id}`} value={names[id] ?? 'Name Surname'} onChange={e => setNames(current => ({ ...current, [id]: e.target.value }))} leadingIcon={false} />
              <Button size="small" type="submit" leadingIcon={false}>Save</Button>
            </form> : undefined}
          </DataGridCell>
          <DataGridCell type="text" textSize="small" text="name@email.com" href="mailto:name@email.com" hasAvatar={false} hasIcon={false} hasMultiSelect={false} hasSingleSelect={false} />
          <DataGridCell type="text" textSize="small" text="July 18, 2026" hasAvatar={false} hasIcon={false} hasMultiSelect={false} hasSingleSelect={false} />
          <DataGridCell id={`row-${id}-actions`} type="buttons" editLabel={`Edit row ${id}`} downloadAriaLabel={`Download row ${id}`} actionIcon="delete" actionLabel={`Delete row ${id}`} onAction={() => restoreFocusAfterRemoval(() => { setRows(current => current.filter(row => row !== id)); setSelected(current => current.filter(row => row !== id)); setMessage(`Deleted row ${id}`); }, '#restore-table')}
            onEdit={() => setEditing(id)} onDownload={() => download(id)} />
        </tr>)}</tbody>
      </table>
    </div>
    <div className="data-table-scroll" role="region" aria-label="Additional cell variants" tabIndex={0}>
      <table className="data-table-demo data-table-variants"><caption>Additional variants</caption><thead><tr><DataHeader weight="semibold" headerContent="Content" /><DataHeader headerContent="Single-select" /><DataHeader headerContent="Badge" /><DataHeader headerContent="Slot" /></tr></thead>
        <tbody><tr><DataGridCell type="text" avatar={{ src: avatarPhoto('Mark') }} selection={{ label: 'Select example content' }} singleSelection={{ label: 'Choose example content', name: 'example-row' }} />
          <DataGridCell type="single-select" singleSelection={{ label: 'Choose example row', name: 'example-row' }} />
          <DataGridCell type="badge" /><DataGridCell type="slot"><div className="data-cell-slot-example">SWAP WITH CONTENT COMPONENT</div></DataGridCell>
        </tr></tbody>
      </table>
    </div>
  </section>;
}

function MenuFloatMobilePlayground() {
  const [selected, setSelected] = useState<MenuFloatMobileState>('home');
  return <section className="component-section" aria-labelledby="menu-float-heading">
    <h3 id="menu-float-heading">Mobile Navigation</h3>
    <div className="button-matrix-group">
      <MenuFloatMobile state={selected} onNavigate={setSelected} aria-label="Mobile navigation example" />
      <output aria-live="polite">Selected: {selected}</output>
    </div>
  </section>;
}

function MainMenuItemPlayground() {
  const [leading, setLeading] = useState(true);
  const [trailing, setTrailing] = useState(false);
  const [message, setMessage] = useState('Activate a menu item');
  return <section className="component-section" aria-labelledby="main-menu-item-heading">
    <h3 id="main-menu-item-heading">Main Menu Item</h3>
    <div className="button-matrix-group">
      <div><label className="checkbox-field"><input type="checkbox" checked={leading} onChange={e => setLeading(e.target.checked)} />Leading icon</label>
        <label className="checkbox-field"><input type="checkbox" checked={trailing} onChange={e => setTrailing(e.target.checked)} />Trailing icon</label></div>
      <div>{(['default', 'active', 'focus'] as const).map(state => <MainMenuItem key={state} href="#main-menu-item-heading"
        label="Home" state={state} leadingIcon={leading} trailingIcon={trailing}
        onClick={e => { e.preventDefault(); setMessage(`Home activated (${state})`); }} />)}</div>
      <output aria-live="polite">{message}</output>
    </div>
  </section>;
}

function SidebarPlayground() {
  const image = { src: '/playground/assets/horizontal-card/blue-lake.png', alt: '' };
  const [selected, setSelected] = useState('school');
  const [message, setMessage] = useState('Choose an item or collapse a sidebar');
  const select = (value: string) => { setSelected(value); setMessage(`Selected ${value}`); };
  return <>
    <section className="component-section" aria-labelledby="sidebar-heading">
      <h3 id="sidebar-heading">Sidebar Menu Desktop</h3>
      <div className="sidebar-showcase button-matrix-group">
        <output aria-live="polite">{message}</output>
        <section className="sidebar-examples" aria-label="Sidebar layouts">
          <SidebarMenuDesktop image={image} aria-label="Expanded sidebar example" onNavigate={select} />
          <SidebarMenuDesktop image={image} defaultState="collapsed" aria-label="Collapsed sidebar example" selectedValue={selected} onNavigate={select} />
          <SidebarMenuDesktop image={image} defaultState="collapsed-submenu" aria-label="Floating submenu sidebar example" selectedValue={selected} onNavigate={select} />
        </section>
      </div>
    </section>
  </>;
}

function BreadcrumbsPlayground() {
  const [levels, setLevels] = useState([true, true, true]);
  const [message, setMessage] = useState('Use Tab and Enter to follow a breadcrumb');
  const items = ['Home', 'Projects', 'Components', 'Breadcrumbs'].map((label, index) => ({
    label, href: `#breadcrumb-${index + 1}`, onClick: (event: React.MouseEvent<HTMLElement>) => {
      event.preventDefault(); setMessage(`Navigate to ${label}`);
    },
  }));
  return <section className="component-section" aria-labelledby="breadcrumbs-heading">
    <h3 id="breadcrumbs-heading">Breadcrumbs</h3>
    <div className="button-matrix-group">
      <div>{levels.map((visible, index) => <label className="checkbox-field" key={index}><input type="checkbox" checked={visible} onChange={e => setLevels(current => current.map((value, i) => i === index ? e.target.checked : value))} />Level {index + 1}</label>)}</div>
      <BreadcrumbsGroup items={items} hasLevel1={levels[0]} hasLevel2={levels[1]} hasLevel3={levels[2]} />
      <output aria-live="polite">{message}</output>
    </div>
  </section>;
}

function SkipContentPlayground() {
  return <section className="component-section" aria-labelledby="skip-content-heading">
    <h3 id="skip-content-heading">Skip Content</h3>
    <div className="button-matrix-group">
      <SkipContentGroup targets={{ content: '#playground-main', menu: '#playground-menu', search: '#search', footer: '#playground-footer' }} />
    </div>
  </section>;
}

function TooltipPlayground() {
  const [hasTitle, setHasTitle] = useState(true);
  const [hasBody, setHasBody] = useState(true);
  return <section className="component-section" aria-labelledby="tooltip-heading">
    <h3 id="tooltip-heading">Tooltip</h3>
    <div className="button-matrix-group"><label className="checkbox-field"><input type="checkbox" checked={hasTitle} onChange={e => setHasTitle(e.target.checked)} />Title</label>
      <label className="checkbox-field"><input type="checkbox" checked={hasBody} onChange={e => setHasBody(e.target.checked)} />Body text</label>
      <p>Hover or focus a button. Escape dismisses the tooltip. Position names describe the arrow edge.</p>
    </div>
    <div className="button-matrix tooltip-matrix">{(['bottom', 'top', 'left', 'right'] as const).map(position => <article className="button-matrix-group tooltip-example" key={position}>
      <Tooltip position={position} hasTitle={hasTitle} hasBody={hasBody}><Button variant="secondary" status="action" leadingIcon={false}>{position} arrow</Button></Tooltip>
    </article>)}</div>
  </section>;
}
