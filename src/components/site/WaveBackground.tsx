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

        {/* Arriba a la izquierda: lima → verde */}
        <path d="M0 0H560C420 110 240 250 0 560Z" fill="url(#wave-lime)" />
        <path d="M0 0H360C250 90 120 200 0 360Z" fill="url(#wave-lime)" />
        {/* Abajo a la izquierda: verde */}
        <path d="M0 900V600C230 660 430 790 660 900Z" fill="url(#wave-green)" />
        {/* Abajo a la derecha: azul */}
        <path d="M1600 900H880C1140 760 1370 610 1600 360Z" fill="url(#wave-blue)" />
        <path d="M1600 900H1180C1350 800 1490 690 1600 560Z" fill="url(#wave-blue)" />
        {/* Arriba a la derecha: celeste suave */}
        <path d="M1600 0H1150C1320 90 1470 200 1600 340Z" fill="url(#wave-sky)" />

        {/* Líneas de luz que siguen las ondas */}
        <g fill="none" strokeLinecap="round" style={{ stroke: "var(--wave-streak)" }}>
          <path d="M0 470C200 300 380 160 520 0" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d="M0 400C170 260 320 140 450 0" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <path d="M0 680C240 720 460 820 600 900" strokeWidth="2" vectorEffect="non-scaling-stroke" />
          <path d="M920 900C1170 770 1390 620 1600 420" strokeWidth="3" vectorEffect="non-scaling-stroke" />
          <path d="M1060 900C1280 790 1460 660 1600 500" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        </g>
      </svg>
    </div>
  );
}
