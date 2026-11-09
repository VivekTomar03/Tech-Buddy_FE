import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { Input } from './Field';

export default function PasswordInput(props) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input type={show ? 'text' : 'password'} className="pr-11" {...props} />
      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="absolute top-1/2 right-1 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-subtle hover:text-fg"
        aria-label={show ? 'Hide password' : 'Show password'}
        aria-pressed={show}
      >
        {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
      </button>
    </div>
  );
}
