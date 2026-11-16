import { useState } from 'react';
import { useAuth } from '../hooks/useAuth.js';
import './login.css';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    try {
      await login({
        email: formData.get('email').trim(),
        password: formData.get('password'),
      });
      window.location.hash = '#/campaigns';
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : String(loginError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <span className="eyebrow">YOUR COMMUNITY STARTS HERE</span>
        <h1>Good to have you back.</h1>
        <p>Connect with causes worth caring about.</p>
        <div className="auth-star" aria-hidden="true">✳</div>
      </div>
      <div className="auth-panel">
        <span className="eyebrow">CAMPAIGN CONNECT</span>
        <h2>Welcome back</h2>
        <p>Log in to explore your community.</p>
        <form id="login-form" onSubmit={handleSubmit}>
          <label htmlFor="email">ID</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="username"
            maxLength={254}
            required
          />
          <label htmlFor="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            maxLength={128}
            required
          />
          {error && <p className="notice" role="alert">{error}</p>}
          <button className="dark" id="login-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in →'}
          </button>
        </form>
        <a className="auth-switch" href="#/register">Register now</a>
        <div className="notice demo-note">
          <strong>Demo access</strong>
          <br />
          Email: demo@campaignconnect.test
          <br />
          Password: Demo123!
          <br />
          This is a front end simulation. No real account is created.
        </div>
      </div>
    </section>
  );
}
