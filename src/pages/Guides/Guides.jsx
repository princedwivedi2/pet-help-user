import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import guideService from '../../services/guideService';
import { apiList, apiPagination } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import SearchBar from '../../components/common/SearchBar/SearchBar';
import Loader from '../../components/common/Loader/Loader';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Badge from '../../components/common/Badge/Badge';
import Pagination from '../../components/common/Pagination/Pagination';
import Icon from '../../components/common/Icon/Icon';
import styles from './Guides.module.css';

export default function Guides() {
  const { loading, execute } = useApi(guideService.getAll);
  const [guides, setGuides] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ last_page: 1 });

  useEffect(() => {
    const loadCats = async () => {
      try {
        const res = await guideService.getCategories();
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
      setGuides(apiList(raw, 'guides'));
      const pg = apiPagination(raw);
      if (pg) setMeta(pg);
    } catch (_) {}
  }, [execute, search, category, page]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (val) => { setSearch(val); setPage(1); };
  const handleCategory = (id) => { setCategory(category === id ? '' : id); setPage(1); };

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Emergency Guides</h1>
        <p className={styles.subtitle}>Step-by-step first-aid guides for pet emergencies</p>
      </div>

      <SearchBar value={search} onChange={handleSearch} placeholder="Search guides..." />

      {categories.length > 0 && (
        <div className={styles.filters}>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`${styles.filterBtn} ${category === String(cat.id) ? styles.filterActive : ''}`}
              onClick={() => handleCategory(String(cat.id))}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <Loader center />
      ) : guides.length === 0 ? (
        <EmptyState title="No guides found" message="Try adjusting your search or filters." />
      ) : (
        <>
          <div className={styles.grid}>
            {guides.map((guide) => (
              <Link key={guide.id || guide.uuid} to={`/guides/${guide.id}`} className={styles.cardLink}>
                <Card>
                  <div className={styles.guideCard}>
                    <div className={styles.guideIcon}>
                      <Icon name="guides" size={20} />
                    </div>
                    <h3 className={styles.guideName}>{guide.title}</h3>
                    <p className={styles.guideDesc}>
                      {(guide.summary || guide.content || '').substring(0, 100)}
                      {(guide.summary || guide.content || '').length > 100 ? '...' : ''}
                    </p>
                    {guide.severity_level && (
                      <Badge variant={guide.severity_level === 'critical' ? 'danger' : guide.severity_level === 'moderate' ? 'warning' : 'default'}>
                        {guide.severity_level}
                      </Badge>
                    )}
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
