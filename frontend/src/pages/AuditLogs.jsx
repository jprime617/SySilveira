import React, { useEffect, useState } from 'react';
import api from '../services/api';

function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadLogs() {
      try {
        const response = await api.get('/audit_logs');
        setLogs(response.data);
      } catch (err) {
        console.error('Failed to load audit logs:', err);
        alert('Erro ao carregar auditoria. Acesso negado ou erro no servidor.');
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Carregando Registros de Auditoria...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: 'var(--primary)' }}>Logs do Sistema (Auditoria)</h2>
      
      <div className="card" style={{ overflowX: 'auto' }}>
        <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Data/Hora</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Usuário</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Ação</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Recurso</th>
              <th style={{ textAlign: 'left', padding: '0.75rem', borderBottom: '2px solid var(--border)' }}>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log.id} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '0.75rem', whiteSpace: 'nowrap' }}>
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {log.user ? `${log.user.name} (${log.user.role})` : 'Sistema / Anônimo'}
                </td>
                <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>
                  {log.action}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  {log.resource}
                </td>
                <td style={{ padding: '0.75rem' }}>
                  <pre style={{ margin: 0, fontSize: '0.75rem', background: '#f5f5f5', padding: '0.5rem', borderRadius: '4px', maxWidth: '300px', overflowX: 'auto' }}>
                    {JSON.stringify(log.details, null, 2)}
                  </pre>
                </td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan="5" style={{ padding: '1.5rem', textAlign: 'center' }}>
                  Nenhum registro encontrado.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AuditLogs;
