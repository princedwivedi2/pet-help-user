import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import guideService from '../../services/guideService';
import { apiObject } from '../../utils/helpers';
import Card from '../../components/common/Card/Card';
import Badge from '../../components/common/Badge/Badge';
import Loader from '../../components/common/Loader/Loader';
import Icon from '../../components/common/Icon/Icon';
import styles from './GuideDetail.module.css';

export default function GuideDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { loading, execute } = useApi(guideService.getOne);
  const [guide, setGuide] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const raw = await execute(id);
        setGuide(apiObject(raw, 'guide'));
      } catch (_) {}
    };
    load();
  }, [execute, id]);

  if (loading) return <Loader center />;
  if (!guide) return <div className={styles.notFound}>Guide not found</div>;

  const steps = Array.isArray(guide.steps) ? guide.steps : [];

  return (
    <div className={styles.page}>
      <button className={styles.back} onClick={() => navigate(-1)}>
        <Icon name="arrowLeft" size={16} />
        <span>Back to guides</span>
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>{guide.title}</h1>
        {guide.severity_level && (
          <Badge variant={guide.severity_level === 'critical' ? 'danger' : guide.severity_level === 'moderate' ? 'warning' : 'default'}>
            {guide.severity_level}
          </Badge>
        )}
      </div>

      {(guide.summary || guide.description) && (
        <p className={styles.description}>{guide.summary || guide.description}</p>
      )}

      {guide.content && (
        <Card>
          <div className={styles.content} dangerouslySetInnerHTML={{ __html: guide.content }} />
        </Card>
      )}

      {steps.length > 0 && (
        <section className={styles.stepsSection}>
          <h2 className={styles.sectionTitle}>Steps</h2>
          <div className={styles.steps}>
            {steps.map((step, i) => (
              <div key={i} className={styles.step}>
                <div className={styles.stepNum}>{i + 1}</div>
                <div className={styles.stepContent}>
                  {step.title && <h3 className={styles.stepTitle}>{step.title}</h3>}
                  <p className={styles.stepText}>{step.description || step.content || step}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {guide.category && (
        <div className={styles.meta}>
          <span className={styles.metaLabel}>Category:</span>
          <span>{guide.category.name || guide.category}</span>
        </div>
      )}
    </div>
  );
}
