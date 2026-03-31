import { useState } from 'react';
import { MentorCard } from '../../components/DomainComponents.jsx';
import { sendMentorMessage } from '../../services/mentorApi.js';

export default function MentorPage() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSend(event) {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await sendMentorMessage(message);
      setReply(data.reply);
      setMessage('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-stack">
      <h2>Mentor IA</h2>
      <p>Mentoria adaptada ao seu perfil, meta e jornada atual.</p>

      <div className="grid-two">
        <MentorCard title="Cenario atual" value="Priorizacao critica de sprint" />
        <MentorCard title="Decisao anterior" value="Alinhar risco antes da execucao" />
        <MentorCard title="Foco da mentoria" value="Assertividade com consistencia" />
        <MentorCard title="Estilo do mentor" value="Direto" />
      </div>

      <form className="stack-form" onSubmit={handleSend}>
        <label>
          Sua mensagem
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Quero ajuda para melhorar minha decisão no cenário de conflito." />
        </label>
        {error ? <div className="error-box">{error}</div> : null}
        <button type="submit" disabled={loading || !message.trim()}>{loading ? 'Enviando...' : 'Enviar ao mentor'}</button>
      </form>

      {reply ? (
        <div className="list-item">
          <strong>Resposta do mentor</strong>
          <p>{reply}</p>
        </div>
      ) : null}
    </div>
  );
}
