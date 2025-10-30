import React from 'react';

const TestSignup = () => {
  console.log("TestSignup component is rendering");
  
  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1>🎉 Signup Page is Working!</h1>
      <p>This is a test signup page to verify routing is working correctly.</p>
      <p>If you can see this, the navigation from Landing Page → Signup is working.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <button 
          onClick={() => window.history.back()}
          style={{
            padding: '1rem 2rem',
            background: 'white',
            color: '#667eea',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: 'bold'
          }}
        >
          ← Go Back to Landing Page
        </button>
      </div>
    </div>
  );
};

export default TestSignup;
