import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#050505',
          borderRadius: 32,
          color: '#ffffff',
          fontSize: 44,
          fontWeight: 900,
          letterSpacing: -1.5,
          fontFamily: 'Arial',
        }}
      >
        Bull<span style={{ color: '#e8001d' }}>Rep</span>
      </div>
    ),
    size
  );
}
