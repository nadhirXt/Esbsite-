import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          height: '100%',
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#040814', // Dark background
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '32px' }}>
          {/* Graduation Cap SVG */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="240"
            height="240"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f59e0b" // amber-500
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ transform: 'rotate(-6deg)' }}
          >
            <path d="M21.42 10.922a1 1 0 0 0-.019-1.838L12.83 5.18a2 2 0 0 0-1.66 0L2.6 9.08a1 1 0 0 0 0 1.832l8.57 3.908a2 2 0 0 0 1.66 0z" />
            <path d="M22 10v6" />
            <path d="M6 12.5V16a6 3 0 0 0 12 0v-3.5" />
          </svg>
          
          <div style={{ display: 'flex', alignItems: 'center', fontFamily: '"Inter", sans-serif' }}>
            <span style={{ fontSize: '180px', fontWeight: 900, color: '#ffffff', letterSpacing: '-0.02em' }}>ESB</span>
            <span style={{ fontSize: '180px', fontWeight: 700, color: '#38bdf8', marginLeft: '16px' }}>Hub</span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1080,
    }
  );
}
