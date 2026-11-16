import './login.css';

export default function RegisterPage() {
  function handleSubmit(event) {
    event.preventDefault();
    window.location.hash = '#/login';
  }

  return (
    <section className="auth-layout">
      <div className="auth-intro">
        <span className="eyebrow">YOUR COMMUNITY STARTS HERE</span>
        <h1>Make a difference together.</h1>
        <p>Connect with causes worth caring about.</p>
        <div className="auth-star" aria-hidden="true">✳</div>
      </div>
      <div className="auth-panel">
        <span className="eyebrow">CAMPAIGN CONNECT</span>
        <h2>Create your account</h2>
        <p>Join your community and explore local causes.</p>
        <form id="register-form" onSubmit={handleSubmit}>
          <label htmlFor="name">Name</label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            required
          />
          <label htmlFor="register-email">ID (email address)</label>
          <input
            id="register-email"
            name="email"
            type="email"
            autoComplete="username"
            maxLength={254}
            required
          />
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            maxLength={128}
            required
          />
          <button className="dark" id="register-button" type="submit">
            Register →
          </button>
        </form>
        <a className="auth-switch" href="#/login">Log in now</a>
        <div className="notice demo-note">
          Registration is a front end demonstration. Your details are not saved or sent anywhere.
        </div>
      </div>
    </section>
  );
}
