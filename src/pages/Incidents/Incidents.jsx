import { useEffect, useState, useCallback } from 'react';
import api from '../../services/api';
import Card from '../../components/common/Card/Card';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Badge from '../../components/common/Badge/Badge';
import { formatDateTime } from '../../utils/helpers';
import styles from './Incidents.module.css';

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/incidents');
      const list = res?.data?.incidents?.data || res?.data?.incidents || res?.data?.data || res?.data || [];
      setIncidents(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.message || 'Failed to load incidents');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <Loader fullPage />;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Incident Logs</h1>
        <p className={styles.subtitle}>Your pet health incident history</p>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {incidents.length === 0 ? (
        <Card>
          <EmptyState
            icon="document"
            title="No incidents logged"
            message="Incidents related to your pets will appear here."
          />
        </Card>
      ) : (
        <div className={styles.list}>
          {incidents.map((inc) => (
            <Card key={inc.uuid || inc.id}>
              <div className={styles.incidentRow}>
                <div className={styles.incidentMain}>
                  <h3 className={styles.incidentTitle}>{inc.title || inc.incident_type || 'Incident'}</h3>
                  {inc.description && <p className={styles.incidentDesc}>{inc.description}</p>}
                  {inc.pet?.name && <p className={styles.incidentMeta}>Pet: {inc.pet.name}</p>}
                  <p className={styles.incidentDate}>{formatDateTime(inc.created_at)}</p>
                </div>
                {inc.status && (
                  <Badge variant={inc.status === 'resolved' ? 'success' : 'warning'} size="sm">
                    {inc.status}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
