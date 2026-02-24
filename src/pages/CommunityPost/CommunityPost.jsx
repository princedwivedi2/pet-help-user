import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import communityService from '../../services/communityService';
import { useAuth } from '../../hooks/useAuth';
import { apiObject, apiList } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import Loader from '../../components/common/Loader/Loader';
import FormInput from '../../components/common/FormInput/FormInput';
import ConfirmDialog from '../../components/common/ConfirmDialog/ConfirmDialog';
import styles from './CommunityPost.module.css';

export default function CommunityPost() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { loading, execute } = useApi(communityService.getPost);
  const [post, setPost] = useState(null);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const raw = await execute(uuid);
      setPost(apiObject(raw, 'post'));
    } catch (_) {}
  };

  const loadReplies = async () => {
    try {
      const res = await communityService.getReplies(uuid, { per_page: 50 });
      setReplies(apiList(res?.data, 'replies'));
    } catch (_) {}
  };

  useEffect(() => { load(); loadReplies(); }, [uuid]);

  const handleVote = async (type, itemUuid) => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await communityService.vote({ votable_type: type, votable_uuid: itemUuid });
      load();
      loadReplies();
    } catch (_) {}
  };

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    setReplying(true);
    try {
      await communityService.storeReply(uuid, { content: replyText });
      setReplyText('');
      loadReplies();
    } catch (_) {} finally {
      setReplying(false);
    }
  };

  const handleReport = async (type, itemUuid) => {
    const reason = window.prompt('Reason for reporting (min 10 characters):');
    if (!reason || reason.length < 10) {
      if (reason) alert('Reason must be at least 10 characters');
      return;
    }
    try {
      await communityService.report({ reportable_type: type, reportable_uuid: itemUuid, reason });
      alert('Report submitted');
    } catch (_) {}
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      if (deleteTarget.type === 'post') {
        await communityService.deletePost(deleteTarget.id);
        navigate('/community');
      } else {
        await communityService.deleteReply(deleteTarget.id);
        loadReplies();
      }
      setDeleteTarget(null);
    } catch (_) {} finally {
      setDeleting(false);
    }
  };

  if (loading) return <Loader center />;
  if (!post) return <div className={styles.notFound}>Post not found</div>;

  const isOwner = (postUser) => user && postUser && (user.id === postUser.id || user.uuid === postUser.uuid);

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        <Icon name="arrowLeft" size={16} />
        <span>Back</span>
      </button>

      <Card>
        <div className={styles.postHeader}>
          <h1 className={styles.title}>{post.title}</h1>
          <div className={styles.postMeta}>
            <span>{post.user?.name || 'User'}</span>
            <span className={styles.dot} />
            <span>{post.created_at?.split('T')[0]}</span>
            {post.topic && <Badge>{post.topic.name || post.topic}</Badge>}
          </div>
        </div>
        <p className={styles.content}>{post.content}</p>
        <div className={styles.actions}>
          <div className={styles.voteGroup}>
            <button className={styles.voteBtn} onClick={() => handleVote('post', post.uuid)}>
              <Icon name="thumbUp" size={15} />
            </button>
            <span className={styles.voteCount}>{post.votes_count || 0}</span>
          </div>
          <button className={styles.actionBtn} onClick={() => handleReport('post', post.uuid)}>
            <Icon name="flag" size={14} />
            Report
          </button>
          {isOwner(post.user) && (
            <button className={styles.actionBtn} onClick={() => setDeleteTarget({ type: 'post', id: post.uuid })}>
              <Icon name="trash" size={14} />
              Delete
            </button>
          )}
        </div>
      </Card>

      <section className={styles.repliesSection}>
        <h2 className={styles.sectionTitle}>Replies ({replies.length})</h2>

        {isAuthenticated && (
          <form onSubmit={handleReply} className={styles.replyForm}>
            <FormInput
              as="textarea"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply..."
            />
            <Button type="submit" size="sm" loading={replying}>Reply</Button>
          </form>
        )}

        {replies.length === 0 ? (
          <p className={styles.noReplies}>No replies yet.</p>
        ) : (
          <div className={styles.replyList}>
            {replies.map((r) => (
              <div key={r.uuid || r.id} className={styles.replyItem}>
                <div className={styles.replyHead}>
                  <span className={styles.replyAuthor}>{r.user?.name || 'User'}</span>
                  <span className={styles.replyDate}>{r.created_at?.split('T')[0]}</span>
                </div>
                <p className={styles.replyText}>{r.content}</p>
                <div className={styles.replyActions}>
                  <div className={styles.voteGroup}>
                    <button className={styles.voteBtn} onClick={() => handleVote('reply', r.uuid)}>
                      <Icon name="thumbUp" size={13} />
                    </button>
                    <span className={styles.voteCount}>{r.votes_count || 0}</span>
                  </div>
                  <button className={styles.actionBtn} onClick={() => handleReport('reply', r.uuid)}>
                    <Icon name="flag" size={12} />
                  </button>
                  {isOwner(r.user) && (
                    <button className={styles.actionBtn} onClick={() => setDeleteTarget({ type: 'reply', id: r.uuid })}>
                      <Icon name="trash" size={12} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete ${deleteTarget?.type || 'item'}`}
        message="Are you sure? This cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
}
