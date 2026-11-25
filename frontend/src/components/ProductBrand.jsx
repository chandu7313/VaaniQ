export function ProductBrand({ size = 'md', surface = 'auto', compact = false, className = '' }) {
  const isSm = size === 'sm';
  const isLg = size === 'lg';
  const isDarkSurface = surface === 'dark';

  return (
    <div className={`flex items-center ${isSm ? 'gap-2.5' : isLg ? 'gap-3.5' : 'gap-3'} ${className}`}>
      <div
        className={`grid shrink-0 place-items-center rounded-xl ${
          isDarkSurface ? 'bg-white/95 p-1 shadow-sm' : ''
        }`}
      >
        <img
          src="/logo.png"
          alt="VaaniQ"
          className={`${isSm ? 'size-7' : isLg ? 'size-11' : 'size-8.5'} shrink-0 rounded-md object-contain`}
        />
      </div>
      {!compact && (
        <div className="flex flex-col">
          <div className={`font-bold leading-none tracking-tight ${isSm ? 'text-[16px]' : isLg ? 'text-[24px]' : 'text-[19px]'}`}>
            <span className={isDarkSurface ? 'text-[#F3F6F4]' : 'text-[var(--vq-wordmark)]'}>Vaani</span>
            <span className="text-[#F16704]">Q</span>
          </div>
          <div
            className={`flex items-center gap-1.5 font-medium italic ${
              isDarkSurface ? 'text-rail-muted' : 'text-ink-2'
            } ${isSm ? 'mt-0.5 text-[9.5px]' : isLg ? 'mt-1.5 text-[11.5px]' : 'mt-1 text-[10.5px]'}`}
          >
            <span className={`h-px ${isDarkSurface ? 'bg-rail-border' : 'bg-line-strong'} ${isSm ? 'w-2.5' : isLg ? 'w-4' : 'w-3'}`} />
            <span className="whitespace-nowrap tracking-wider">AI Sales Agent</span>
            <span className={`h-px ${isDarkSurface ? 'bg-rail-border' : 'bg-line-strong'} ${isSm ? 'w-2.5' : isLg ? 'w-4' : 'w-3'}`} />
          </div>
        </div>
      )}
    </div>
  );
}
