import { ImageResponse } from 'next/og';

export const size = {
  width: 512,
  height: 512,
};

export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 96,
          color: '#ffffff',
          fontSize: 118,
          fontWeight: 900,
          letterSpacing: -4,
          fontFamily: 'Arial',
        }}
      >
        Bull<span style={{ color: '#e8001d' }}>Rep</span>
      </div>
    ),
    size
  );
}
