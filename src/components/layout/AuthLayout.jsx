import { Badge } from '@/components/ui/Controls';

const SAMPLE = [
  { who: 'buddy', text: 'Why do list items in React need a key prop?', meta: 'react · easy' },
  { who: 'you', text: 'So React can tell which items changed between renders.' },
  { who: 'buddy', text: 'Right. What goes wrong if you use the array index as the key and then sort the list?', meta: 'react · follow-up' },
];

/** Form on the left; on large screens a sample exchange shows what the product does. */
export default function AuthLayout({ title, subtitle, children }) {
  return (
    <div className="mx-auto grid min-h-[calc(100dvh-3.5rem)] max-w-6xl lg:grid-cols-2">
      <div className="flex items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-sm">
          <h1 className="text-2xl font-semibold">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className="mt-7">{children}</div>
        </div>
      </div>

      <aside className="hidden items-center border-l border-line px-10 lg:flex" aria-hidden="true">
        <div className="w-full max-w-md">
          <p className="label-mono mb-4">// what an interview feels like</p>
          <div className="space-y-3">
            {SAMPLE.map((m, i) => (
              <div key={i} className={m.who === 'you' ? 'flex justify-end' : ''}>
                <div className={m.who === 'you' ? 'max-w-[85%] rounded-lg bg-surface-3 px-3.5 py-2.5 text-sm' : 'max-w-[85%] rounded-lg border border-line bg-surface px-3.5 py-2.5 text-sm'}>
                  {m.meta && <p className="label-mono mb-1 normal-case">{m.meta}</p>}
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap gap-2">
            <Badge mono>max 2 follow-ups</Badge>
            <Badge mono>code runs on real tests</Badge>
            <Badge mono>scores from your answers</Badge>
          </div>
        </div>
      </aside>
    </div>
  );
}
