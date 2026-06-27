import React from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { useAuthStore } from '../store/authStore';

export const LoginPage: React.FC = () => {
  const { user } = useAuthStore();

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/home" replace />;
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 'calc(100vh - 120px)',
        padding: '1.5rem',
      }}
    >
      <LoginForm />
    </div>
  );
};
export default LoginPage;
