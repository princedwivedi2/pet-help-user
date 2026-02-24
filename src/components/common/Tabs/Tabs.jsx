import styles from './Tabs.module.css';

export default function Tabs({ tabs, active, activeTab, onChange, onTabChange }) {
  const currentTab = active ?? activeTab;
  const handleChange = onChange || onTabChange;

  return (
    <div className={styles.tabs}>
      {tabs.map((tab) => (
        <button
          key={tab.key}
          className={`${styles.tab} ${currentTab === tab.key ? styles.active : ''}`}
          onClick={() => handleChange(tab.key)}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className={styles.count}>{tab.count}</span>
          )}
        </button>
      ))}
    </div>
  );
}
