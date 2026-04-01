import { useEffect, useState } from 'react';
import { Card, PageHeader, EmptyState, StatCard, StatusPill, FormField, Button, ExperienceCard, StageWrapper } from '../components/index.js';
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
    <StageWrapper
      stageKey="knowledge"
      title="Base de Conhecimento para RAG"
      subtitle="Gerencie fontes, documentos e estrutura de recuperação contextual"
      completed={sources.length > 0 ? 1 : 0}
      total={1}
      variant="resultado"
      loading={false}
    >
      {error ? <div className="error-box">{error}</div> : null}

      <div className="grid-two knowledge-layout gap-6">
        <div className="stack-gap">
          <ExperienceCard variant="destaque" title="Nova Fonte">
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
          </ExperienceCard>

          <ExperienceCard variant="destaque" title="Novo Documento">
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
          </ExperienceCard>
        </div>

        <ExperienceCard variant="default" title="Documentos Indexados">
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
        </ExperienceCard>
      </div>
    </StageWrapper>
  );
}
