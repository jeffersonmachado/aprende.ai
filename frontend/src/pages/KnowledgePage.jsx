import { useEffect, useState } from 'react';
import Card from '../components/Card.jsx';
import EmptyState from '../components/EmptyState.jsx';
import PageHeader from '../components/PageHeader.jsx';
import StatusPill from '../components/StatusPill.jsx';
import { api } from '../services/api.js';

const initialSourceForm = { name: '', sourceType: 'upload' };
const initialDocForm = { knowledgeSourceId: '', title: '', documentText: '' };

export default function KnowledgePage() {
  const [documents, setDocuments] = useState([]);
  const [sources, setSources] = useState([]);
  const [sourceForm, setSourceForm] = useState(initialSourceForm);
  const [docForm, setDocForm] = useState(initialDocForm);
  const [error, setError] = useState('');

  async function load() {
    const [sourceData, documentData] = await Promise.all([
      api.get('/api/knowledge/sources'),
      api.get('/api/knowledge/documents')
    ]);

    setSources(sourceData);
    setDocuments(documentData);
    if (!docForm.knowledgeSourceId && sourceData[0]?.id) {
      setDocForm((prev) => ({ ...prev, knowledgeSourceId: sourceData[0].id }));
    }
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  async function createSource(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/api/knowledge/sources', sourceForm);
      setSourceForm(initialSourceForm);
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function createDocument(event) {
    event.preventDefault();
    setError('');
    try {
      await api.post('/api/knowledge/documents', { ...docForm, status: 'indexed' });
      setDocForm((prev) => ({ ...prev, title: '', documentText: '' }));
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="page-stack">
      <PageHeader
        eyebrow="Conhecimento"
        title="Base para RAG"
        description="Estrutura inicial para fontes, documentos e evolução futura para chunks, embeddings e recuperação contextual."
      />

      {error ? <div className="error-box">{error}</div> : null}

      <div className="grid-two knowledge-layout">
        <div className="stack-gap">
          <Card title="Nova fonte">
            <form className="stack-form" onSubmit={createSource}>
              <label>
                Nome
                <input value={sourceForm.name} onChange={(e) => setSourceForm((prev) => ({ ...prev, name: e.target.value }))} />
              </label>
              <label>
                Tipo
                <select value={sourceForm.sourceType} onChange={(e) => setSourceForm((prev) => ({ ...prev, sourceType: e.target.value }))}>
                  <option value="upload">upload</option>
                  <option value="policy">policy</option>
                  <option value="faq">faq</option>
                </select>
              </label>
              <button type="submit">Salvar fonte</button>
            </form>
          </Card>

          <Card title="Novo documento">
            <form className="stack-form" onSubmit={createDocument}>
              <label>
                Fonte
                <select value={docForm.knowledgeSourceId} onChange={(e) => setDocForm((prev) => ({ ...prev, knowledgeSourceId: e.target.value }))}>
                  {sources.map((source) => (
                    <option key={source.id} value={source.id}>{source.name}</option>
                  ))}
                </select>
              </label>
              <label>
                Título
                <input value={docForm.title} onChange={(e) => setDocForm((prev) => ({ ...prev, title: e.target.value }))} />
              </label>
              <label>
                Texto
                <textarea value={docForm.documentText} onChange={(e) => setDocForm((prev) => ({ ...prev, documentText: e.target.value }))} />
              </label>
              <button type="submit">Salvar documento</button>
            </form>
          </Card>
        </div>

        <Card title="Documentos indexados">
          {documents.length ? (
            <div className="list">
              {documents.map((doc) => (
                <div className="list-item" key={doc.id}>
                  <div className="row-between gap-sm wrap">
                    <strong>{doc.title}</strong>
                    <StatusPill value={doc.status} />
                  </div>
                  <p>{doc.documentText}</p>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Nenhum documento indexado"
              description="Crie fontes e documentos para formar a base inicial de conhecimento do aprende.AI."
            />
          )}
        </Card>
      </div>
    </div>
  );
}
