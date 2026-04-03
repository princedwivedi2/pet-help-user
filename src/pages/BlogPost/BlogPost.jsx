import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DOMPurify from 'dompurify';
import useApi from '../../hooks/useApi';
import blogService from '../../services/blogService';
import { useAuth } from '../../hooks/useAuth';
import { apiObject } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Button from '../../components/common/Button/Button';
import Icon from '../../components/common/Icon/Icon';
import Loader from '../../components/common/Loader/Loader';
import FormInput from '../../components/common/FormInput/FormInput';
import styles from './BlogPost.module.css';

export default function BlogPost() {
  const { uuid } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { loading, execute } = useApi(blogService.getPost);
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [commenting, setCommenting] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [loadError, setLoadError] = useState('');

  const load = async () => {
    try {
      setLoadError('');
      const raw = await execute(uuid);
      const p = apiObject(raw, 'post');
      setPost(p);
      setLiked(p?.is_liked || false);
      setLikesCount(p?.likes_count || 0);
    } catch (err) {
      setLoadError(err?.message || 'Failed to load post');
    }
  };

  useEffect(() => { load(); }, [uuid]);

  const handleLike = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    try {
      await blogService.toggleLike(uuid);
      setLiked(!liked);
      setLikesCount((c) => liked ? c - 1 : c + 1);
    } catch {
      // Like toggle errors are non-critical — count will re-sync on next load
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setCommenting(true);
    setCommentError('');
    try {
      await blogService.addComment(uuid, { content: comment });
      setComment('');
      load();
    } catch (err) {
      setCommentError(err?.message || 'Failed to post comment');
    } finally {
      setCommenting(false);
    }
  };

  if (loading) return <Loader center />;
  if (loadError) return <div className={styles.notFound}>{loadError}</div>;
  if (!post) return <div className={styles.notFound}>Post not found</div>;

  const comments = Array.isArray(post.comments) ? post.comments : [];

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        <Icon name="arrowLeft" size={16} />
        <span>Back</span>
      </button>

      <article className={styles.article}>
        <h1 className={styles.title}>{post.title}</h1>
        <div className={styles.meta}>
          <span>{post.author?.name || 'Author'}</span>
          <span className={styles.dot} />
          <span>{post.created_at?.split('T')[0]}</span>
          {post.category && (
            <>
              <span className={styles.dot} />
              <Badge>{post.category.name || post.category}</Badge>
            </>
          )}
        </div>

        <div className={styles.content} dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }} />

        <div className={styles.actions}>
          <button className={`${styles.likeBtn} ${liked ? styles.liked : ''}`} onClick={handleLike}>
            <Icon name={liked ? 'heartFilled' : 'heart'} size={16} />
            <span>{likesCount}</span>
          </button>
          <span className={styles.commentCount}>
            <Icon name="message" size={16} />
            {comments.length}
          </span>
        </div>
      </article>

      <section className={styles.commentsSection}>
        <h2 className={styles.sectionTitle}>Comments ({comments.length})</h2>

        {isAuthenticated && (
          <form onSubmit={handleComment} className={styles.commentForm}>
            <FormInput
              as="textarea"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Write a comment..."
            />
            {commentError && <p style={{ color: '#dc2626', fontSize: 13, marginTop: 4 }}>{commentError}</p>}
            <Button type="submit" size="sm" loading={commenting}>Post comment</Button>
          </form>
        )}

        {comments.length === 0 ? (
          <p className={styles.noComments}>No comments yet. Be the first to share your thoughts.</p>
        ) : (
          <div className={styles.commentList}>
            {comments.map((c) => (
              <div key={c.id || c.uuid} className={styles.commentItem}>
                <div className={styles.commentHead}>
                  <span className={styles.commentAuthor}>{c.user?.name || 'User'}</span>
                  <span className={styles.commentDate}>{c.created_at?.split('T')[0]}</span>
                </div>
                <p className={styles.commentText}>{c.content}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
