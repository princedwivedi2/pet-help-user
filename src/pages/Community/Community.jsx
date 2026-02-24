import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import communityService from '../../services/communityService';
import { useAuth } from '../../hooks/useAuth';
import { apiList, apiPagination } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import Button from '../../components/common/Button/Button';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Pagination from '../../components/common/Pagination/Pagination';
import Modal from '../../components/common/Modal/Modal';
import FormInput from '../../components/common/FormInput/FormInput';
import Icon from '../../components/common/Icon/Icon';
import Badge from '../../components/common/Badge/Badge';
import styles from './Community.module.css';

export default function Community() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { loading, execute } = useApi(communityService.getPosts);
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [search, setSearch] = useState('');
  const [topic, setTopic] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1 });
  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState({ title: '', content: '', topic_uuid: '' });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    const loadTopics = async () => {
      try {
        const res = await communityService.getTopics();
        setTopics(apiList(res?.data, 'topics'));
      } catch (_) {}
    };
    loadTopics();
  }, []);

  const load = useCallback(async () => {
    try {
      const params = { search, page, per_page: 15 };
      if (topic) params.topic_uuid = topic;
      const raw = await execute(params);
      setPosts(apiList(raw, 'posts'));
      setMeta(apiPagination(raw));
    } catch (_) {}
  }, [execute, search, topic, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleTopic = (id) => { setTopic(topic === id ? '' : id); setPage(1); };

  const openNew = () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    setNewForm({ title: '', content: '', topic_uuid: '' });
    setCreateError('');
    setShowNew(true);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setCreating(true);
    setCreateError('');
    try {
      await communityService.storePost(newForm);
      setShowNew(false);
      load();
    } catch (err) {
      setCreateError(err.response?.data?.message || 'Failed to create post');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Community</h1>
          <p className={styles.subtitle}>Ask questions and share experiences with fellow pet parents</p>
        </div>
        <Button onClick={openNew}>
          <Icon name="plus" size={16} />
          New Post
        </Button>
      </div>

      <SearchBar value={search} onChange={handleSearch} placeholder="Search discussions..." />

      {topics.length > 0 && (
        <div className={styles.filters}>
          {topics.map((t) => (
            <button
              key={t.uuid || t.id}
              className={`${styles.filterBtn} ${topic === (t.uuid || String(t.id)) ? styles.filterActive : ''}`}
              onClick={() => handleTopic(t.uuid || String(t.id))}
            >
              {t.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader center />
      ) : posts.length === 0 ? (
        <EmptyState title="No posts" message="Start a discussion by creating a new post." />
      ) : (
        <>
          <div className={styles.list}>
            {posts.map((post) => (
              <Link key={post.uuid || post.id} to={`/community/${post.uuid}`} className={styles.cardLink}>
                <Card>
                  <div className={styles.postCard}>
                    <div className={styles.postMain}>
                      <h3 className={styles.postTitle}>{post.title}</h3>
                      <p className={styles.postPreview}>
                        {(post.content || '').substring(0, 140)}
                        {(post.content || '').length > 140 ? '...' : ''}
                      </p>
                      <div className={styles.postMeta}>
                        <span>{post.user?.name || 'User'}</span>
                        <span className={styles.dot} />
                        <span>{post.created_at?.split('T')[0]}</span>
                        {post.topic && (
                          <>
                            <span className={styles.dot} />
                            <Badge>{post.topic.name || post.topic}</Badge>
                          </>
                        )}
                      </div>
                    </div>
                    <div className={styles.postStats}>
                      <span className={styles.stat}><Icon name="thumbUp" size={13} /> {post.votes_count || 0}</span>
                      <span className={styles.stat}><Icon name="message" size={13} /> {post.replies_count || 0}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>

          {meta.last_page > 1 && (
            <Pagination page={page} totalPages={meta.last_page} onPageChange={setPage} />
          )}
        </>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Post">
        {createError && <div className={styles.error}>{createError}</div>}
        <form onSubmit={handleCreate}>
          <FormInput label="Title" value={newForm.title} onChange={(e) => setNewForm({ ...newForm, title: e.target.value })} required placeholder="What's your question? (min 5 chars)" />
          {topics.length > 0 && (
            <FormInput label="Topic" as="select" value={newForm.topic_uuid} onChange={(e) => setNewForm({ ...newForm, topic_uuid: e.target.value })} required>
              <option value="">Select a topic</option>
              {topics.map((t) => <option key={t.uuid || t.id} value={t.uuid || t.id}>{t.name}</option>)}
            </FormInput>
          )}
          <FormInput label="Content" as="textarea" value={newForm.content} onChange={(e) => setNewForm({ ...newForm, content: e.target.value })} required placeholder="Describe your question or experience (min 10 chars)..." />
          <Button type="submit" fullWidth loading={creating}>Create Post</Button>
        </form>
      </Modal>
    </div>
  );
}
