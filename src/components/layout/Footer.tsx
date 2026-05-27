interface FooterProps {
  sucursal?: string
  phone?:    string
  address?:  string
  demo?:     boolean
}

export function Footer({
  sucursal = 'Alpes',
  phone    = '+56 9 3263 0861',
  address  = 'Marchant Pereira 228, Providencia',
  demo     = true,
}: FooterProps) {
  return (
    <footer className="border-t border-neutral-100 bg-neutral-0 px-5 py-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

        {/* Marca */}
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-brand-500 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M12 2C8.5 2 6 5 6 8c0 2.5 1 5 2 7l1 4h6l1-4c1-2 2-4.5 2-7 0-3-2.5-6-6-6z"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
          <span className="text-xs font-semibold text-neutral-600">
            Allskin · {sucursal}
          </span>
        </div>

        {/* Contacto */}
        <div className="flex items-center gap-4 text-xs text-neutral-400">
          <span>{address}</span>
          <span className="hidden sm:block">·</span>
          <a href={`tel:${phone.replace(/\s/g, '')}`} className="hover:text-brand-600 transition-colors">
            {phone}
          </a>
        </div>

      </div>

      {demo && (
        <p className="text-[10px] text-neutral-300 mt-3 text-center">
          Demo — sin conexión a backend real · Datos mock
        </p>
      )}
    </footer>
  )
}
