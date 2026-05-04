import { ImageResponse } from 'next/og';

export const dynamic = 'force-static';

export async function GET(_request: Request, { params }: { params: Promise<{ size: string }> }) {
  const { size: sizeParam } = await params;
  const dim = sizeParam === '512' ? 512 : 192;
  const fontSize = Math.round(dim * 0.48);
  const radius = Math.round(dim * 0.18);

  return new ImageResponse(
    <div
      style={{
        width: dim,
        height: dim,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#09090b',
        borderRadius: `${radius}px`,
      }}
    >
      <span
        style={{
          color: '#a78bfa',
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          fontFamily: 'sans-serif',
          lineHeight: 1,
        }}
      >
        P
      </span>
    </div>,
    { width: dim, height: dim },
  );
}
