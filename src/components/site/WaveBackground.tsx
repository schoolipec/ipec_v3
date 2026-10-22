// Fondo con ondas de colores en las esquinas (referencia: banners "Ofrendas" y "Bienvenidos").
// Los colores salen de variables CSS (--wave-*) que cambian con el tema; el centro queda limpio para el contenido.
export default function WaveBackground() {
  const stop = (v: string, opacity = 1) => ({ stopColor: `var(${v})`, stopOpacity: opacity });

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" style={{ background: 'var(--wave-base)' }}>
      <svg className="h-full w-full" viewBox="0 0 1600 900" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="wave-lime" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" style={stop('--wave-lime')} />
            <stop offset="100%" style={stop('--wave-green', 0)} />
          </linearGradient>
          <linearGradient id="wave-green" x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" style={stop('--wave-green')} />
            <stop offset="100%" style={stop('--wave-teal', 0)} />
          </linearGradient>
          <linearGradient id="wave-blue" x1="1" y1="1" x2="0" y2="0">
            <stop offset="0%" style={stop('--wave-blue')} />
            <stop offset="100%" style={stop('--wave-sky', 0)} />
          </linearGradient>
          <linearGradient id="wave-sky" x1="1" y1="0" x2="0" y2="1">
            <stop offset="0%" style={stop('--wave-sky')} />
            <stop offset="100%" style={stop('--wave-sky', 0)} />
          </linearGradient>
        </defs>

        {/* Ondas orgánicas: dejan el centro despejado y enmarcan el contenido. */}
        <path d="M0 0H560C395 96 178 252 0 560Z" fill="url(#wave-lime)" />
        <path d="M0 0H365C254 74 112 202 0 410Z" fill="url(#wave-lime)" opacity="0.84" />
        <path d="M0 900V606C186 647 420 788 700 900Z" fill="url(#wave-green)" />
        <path d="M0 900V690C158 692 334 778 520 900Z" fill="url(#wave-green)" opacity="0.78" />

        <path d="M1600 900H842C1090 778 1370 572 1600 334Z" fill="url(#wave-blue)" />
        <path d="M1600 900H1060C1242 816 1450 657 1600 502Z" fill="url(#wave-blue)" opacity="0.86" />
        <path d="M1600 0H1230C1372 72 1504 183 1600 338Z" fill="url(#wave-sky)" opacity="0.62" />

        {/* Trazos de luz: aportan profundidad sin competir con el contenido. */}
        <g fill="none" strokeLinecap="round" style={{ stroke: "var(--wave-streak)" }}>
          <path d="M0 500C122 300 307 111 506 0" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d="M0 430C116 264 268 112 430 0" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <path d="M0 648C226 660 466 793 680 900" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
          <path d="M0 721C185 716 391 808 548 900" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <path d="M878 900C1156 782 1410 570 1600 388" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d="M1024 900C1288 816 1474 646 1600 486" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
    </div>
  );
}
