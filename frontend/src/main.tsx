import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Toaster } from 'react-hot-toast'
import { Amplify } from 'aws-amplify'
import './index.css'
import App from './App.tsx'

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
      userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
    }
  }
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Toaster position="top-right" toastOptions={{ style: { background: '#1f2937', color: '#fff' } }} />
    <App />
  </StrictMode>,
)
