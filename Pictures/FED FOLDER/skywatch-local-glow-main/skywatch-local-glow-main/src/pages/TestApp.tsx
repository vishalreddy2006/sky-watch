import React from 'react';

// Minimal test component to isolate the issue
const TestApp = () => {
  return (
    <div style={{ 
      padding: '20px', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>
          🎉 SkyWatch Test
        </h1>
        
        <div style={{ 
          background: 'rgba(255,255,255,0.1)', 
          padding: '2rem', 
          borderRadius: '15px',
          marginBottom: '2rem'
        }}>
          <h2 style={{ color: '#4ade80' }}>✅ React App is Working!</h2>
          <p>If you can see this, the basic React setup is functioning correctly.</p>
        </div>

        <div style={{ 
          background: 'rgba(0,0,0,0.2)', 
          padding: '1.5rem', 
          borderRadius: '10px',
          marginBottom: '2rem'
        }}>
          <h3>🔧 Debug Information:</h3>
          <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
          <p><strong>React Version:</strong> {React.version}</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>URL:</strong> {window.location.href}</p>
        </div>

        <button 
          onClick={() => {
            alert('✅ Button click working!\\n\\nThis confirms React event handling is functional.');
          }}
          style={{
            background: '#3b82f6',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer',
            marginRight: '10px'
          }}
        >
          🧪 Test Button
        </button>

        <button 
          onClick={() => {
            window.location.href = '/';
          }}
          style={{
            background: '#16a34a',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          🌤️ Try Main App
        </button>

        <div style={{ 
          marginTop: '2rem',
          padding: '1rem',
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '8px'
        }}>
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            🎯 This is a minimal test to verify React functionality.
            <br />
            If this loads but the main app doesn't, there's likely an issue with:
            <br />
            • useWeather hook • API imports • Component dependencies
          </p>
        </div>
      </div>
    </div>
  );
};

export default TestApp;