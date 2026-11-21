import { createRef } from 'react';
import { Button, type ButtonProps } from 'wa11y-ai';

const examples = <>
  <Button ref={createRef<HTMLButtonElement>()} onClick={event => event.currentTarget.focus()}>Save</Button>
  <Button status="warning" variant="secondary" type="submit">Submit</Button>
  <Button variant="icon-only" aria-label="Add item" />
  <Button variant="icon-only" aria-labelledby="add-label" />
  <Button variant="link">Continue</Button>
  <Button size="small" variant="icon-only" appearance="link" status="success" aria-label="Add" />
</>;
const props: ButtonProps = { variant: 'secondary', children: 'Label', disabled: true };
// @ts-expect-error Icon-only controls must have an accessible name.
const unnamed = <Button variant="icon-only" />;
const small = <Button size="small">Label</Button>;
const link = <Button variant="link" status="warning">Label</Button>;
void [examples, props, unnamed, small, link];
