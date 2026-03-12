import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: 'admin@aprende.ai', password: 'admin123' });
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="login-page">
      <div className="login-panel">
        <div className="login-hero">
          <div className="page-eyebrow">aprende.AI</div>
          <h1>Projeto próprio, pronto para integrar</h1>
          <p>
            Frontend em React + Vite e backend em Node.js + Express + Sequelize,
            mantendo o padrão do r-agent2, mas com domínio educacional separado.
          </p>
          <ul>
            <li>multi-tenant por tenant slug</li>
            <li>JWT e seed demo</li>
            <li>módulos de learning, assessment, ai, knowledge e integration</li>
          </ul>
        </div>

        <form className="login-card" onSubmit={handleSubmit}>
          <h2>Entrar</h2>
          <label>
            E-mail
            <input value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} type="email" />
          </label>
          <label>
            Senha
            <input value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} type="password" />
          </label>
          {error ? <div className="error-box">{error}</div> : null}
          <button type="submit">Entrar</button>
          <small>Tenant padrão: demo</small>
        </form>
      </div>
    </div>
  );
}
