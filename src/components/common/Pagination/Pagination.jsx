import styles from './Pagination.module.css';

export default function Pagination({ page, currentPage, totalPages, onPageChange }) {
  const current = page ?? currentPage;
  if (totalPages <= 1) return null;

  const getPages = () => {
    const pages = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, current - 1);
      let end = Math.min(totalPages - 1, current + 1);
      if (current <= 3) end = Math.min(4, totalPages - 1);
      if (current >= totalPages - 2) start = Math.max(totalPages - 3, 2);
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <button
        className={styles.nav}
        disabled={current <= 1}
        onClick={() => onPageChange(current - 1)}
      >
        Previous
      </button>
      <div className={styles.pages}>
        {getPages().map((p, i) =>
          p === '...' ? (
            <span key={`e${i}`} className={styles.ellipsis}>...</span>
          ) : (
            <button
              key={p}
              className={`${styles.pageBtn} ${p === current ? styles.active : ''}`}
              onClick={() => onPageChange(p)}
            >
              {p}
            </button>
          )
        )}
      </div>
      <button
        className={styles.nav}
        disabled={current >= totalPages}
        onClick={() => onPageChange(current + 1)}
      >
        Next
      </button>
    </div>
  );
}
