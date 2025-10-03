// pages/index.tsx
export default function Home() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: '20px' }}>Project Uriah Backend API</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Backend API server is running</p>
      <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left' }}>
        <h2 style={{ fontSize: '18px', marginBottom: '15px' }}>Available Endpoints:</h2>
        <ul style={{ lineHeight: '2' }}>
          <li><a href="/api/auth/providers" style={{ color: '#0070f3' }}>/api/auth/providers</a> - Auth providers</li>
          <li><a href="/api/debug/env" style={{ color: '#0070f3' }}>/api/debug/env</a> - Environment check</li>
        </ul>
      </div>
    </div>
  )
}
