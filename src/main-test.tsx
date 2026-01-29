import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

function TestApp() {
  return (
    <div style={{
      padding: '50px',
      background: 'white',
      color: 'black',
      minHeight: '100vh'
    }}>
      <h1>TEST - Si vous voyez ceci, React fonctionne !</h1>
      <p>Le problème est dans l'application principale.</p>
      <button onClick={() => alert('Click fonctionne !')}>
        Tester le Click
      </button>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TestApp />
  </StrictMode>
);
