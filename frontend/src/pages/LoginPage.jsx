import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth.js';

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
          <h1>Aprenda tomando decisoes reais</h1>
          <p>
            Jornadas adaptativas com simulacoes, mentoria por IA e evolucao de competencias.
          </p>
          <ul>
            <li>Cenarios praticos</li>
            <li>Feedback contextual</li>
            <li>Progresso acompanhado</li>
            <li>Trilhas personalizadas</li>
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
