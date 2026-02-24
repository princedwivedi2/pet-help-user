import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import blogService from '../../services/blogService';
import { apiList, apiPagination } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Pagination from '../../components/common/Pagination/Pagination';
import Badge from '../../components/common/Badge/Badge';
import Icon from '../../components/common/Icon/Icon';
import styles from './Blog.module.css';

export default function Blog() {
  const { loading, execute } = useApi(blogService.getPosts);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1 });

  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await blogService.getCategories();
        setCategories(apiList(res?.data, 'categories'));
      } catch (_) {}
    };
    loadCats();
  }, []);

  const load = useCallback(async () => {
    try {
      const params = { search, page, per_page: 12 };
      if (category) params.category = category;
      const raw = await execute(params);
      setPosts(apiList(raw, 'posts'));
      setMeta(apiPagination(raw));
    } catch (_) {}
  }, [execute, search, category, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleCategory = (id) => { setCategory(category === id ? '' : id); setPage(1); };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Blog</h1>
        <p className={styles.subtitle}>Read articles about pet health and care</p>
      </div>

      <SearchBar value={search} onChange={handleSearch} placeholder="Search articles..." />

      {categories.length > 0 && (
        <div className={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat.id || cat.uuid}
              className={`${styles.filterBtn} ${category === String(cat.id || cat.uuid) ? styles.filterActive : ''}`}
              onClick={() => handleCategory(String(cat.id || cat.uuid))}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader center />
      ) : posts.length === 0 ? (
        <EmptyState title="No articles found" message="Try adjusting your search." />
      ) : (
        <>
          <div className={styles.grid}>
            {posts.map((post) => (
              <Link key={post.uuid || post.id} to={`/blog/${post.uuid}`} className={styles.cardLink}>
                <Card>
                  <div className={styles.postCard}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postExcerpt}>
                      {(post.excerpt || post.content || '').substring(0, 120)}
                      {(post.excerpt || post.content || '').length > 120 ? '...' : ''}
                    </p>
                    <div className={styles.postMeta}>
                      <span className={styles.postAuthor}>{post.author?.name || 'Author'}</span>
                      <span className={styles.postDot} />
                      <span>{post.created_at?.split('T')[0]}</span>
                    </div>
                    <div className={styles.postStats}>
                      <span className={styles.stat}><Icon name="heart" size={13} /> {post.likes_count || 0}</span>
                      <span className={styles.stat}><Icon name="message" size={13} /> {post.comments_count || 0}</span>
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
    </div>
  );
}
