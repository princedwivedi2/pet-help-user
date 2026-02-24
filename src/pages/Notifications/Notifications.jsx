import { useState, useEffect, useCallback } from 'react';
import useApi from '../../hooks/useApi';
import notificationService from '../../services/notificationService';
import { apiList, apiPagination } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Pagination from '../../components/common/Pagination/Pagination';
import Icon from '../../components/common/Icon/Icon';
import styles from './Notifications.module.css';

export default function Notifications() {
  const { loading, execute } = useApi(notificationService.getAll);
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1 });
  const [marking, setMarking] = useState(false);

  const load = useCallback(async () => {
    try {
      const raw = await execute({ page, per_page: 20 });
      setNotifications(apiList(raw, 'notifications'));
      const pg = apiPagination(raw);
      if (pg) setMeta(pg);
    } catch (_) {}
  }, [execute, page]);

  useEffect(() => { load(); }, [load]);

  const markAllRead = async () => {
    setMarking(true);
    try {
      await notificationService.markAllAsRead();
      load();
    } catch (_) {} finally {
      setMarking(false);
    }
  };

  const markRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      load();
    } catch (_) {}
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Notifications</h1>
          <p className={styles.subtitle}>Stay updated on your pet care activities</p>
        </div>
        <Button size="sm" variant="outline" onClick={markAllRead} loading={marking}>
          Mark all as read
        </Button>
      </div>

      {loading ? (
        <Loader center />
      ) : notifications.length === 0 ? (
        <EmptyState title="No notifications" message="You're all caught up." />
      ) : (
        <>
          <div className={styles.list}>
            {notifications.map((n) => (
              <div
                key={n.id || n.uuid}
                className={`${styles.item} ${!n.read_at ? styles.unread : ''}`}
                onClick={() => !n.read_at && markRead(n.id)}
              >
                <div className={styles.iconWrap}>
                  <Icon name="notification" size={16} />
                </div>
                <div className={styles.itemContent}>
                  <p className={styles.itemText}>
                    {n.data?.message || n.message || n.data?.title || 'Notification'}
                  </p>
                  <span className={styles.itemTime}>
                    {n.created_at?.split('T')[0]}
                  </span>
                </div>
                {!n.read_at && <div className={styles.unreadDot} />}
              </div>
            ))}
          </div>

          {meta.last_page > 1 && (
            <Pagination page={page} totalPages={meta.last_page} onPageChange={setPage} />
          )}
        </>
      )}
    </div>
  );
}
