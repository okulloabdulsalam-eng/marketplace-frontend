import { useState } from 'react';

function Auth({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('buyer');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');

    const endpoint = isLogin ? 'login' : 'signup';
    const body = isLogin
      ? { email, password }
      : { name, email, password, role };

    try {
      const res = await fetch(`http://localhost:5000/api/v1/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.error || 'Something went wrong');
        return;
      }

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      setMessage(`Welcome, ${data.user.name || data.user.email}!`);
      onLogin(data.user, data.token);
    } catch (err) {
      console.error(err);
      setMessage('Could not connect to server');
    }
  };

  return (
    <div style={{ maxWidth: '350px', margin: '20px auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
      <h2>{isLogin ? 'Log In' : 'Sign Up'}</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {!isLogin && (
          <input
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        )}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {!isLogin && (
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            <option value="buyer">I'm a Buyer</option>
            <option value="seller">I'm a Seller</option>
          </select>
        )}

        <button type="submit">{isLogin ? 'Log In' : 'Sign Up'}</button>
      </form>

      {message && <p style={{ marginTop: '10px' }}>{message}</p>}

      <p style={{ marginTop: '10px', fontSize: '14px' }}>
        {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
        <button
          onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
          style={{ background: 'none', border: 'none', color: 'blue', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isLogin ? 'Sign up' : 'Log in'}
        </button>
      </p>
    </div>
  );
}

export default Auth;
