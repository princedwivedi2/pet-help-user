import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Navbar from './Navbar/Navbar';
import Footer from './Footer/Footer';
import BottomTabs from './BottomTabs/BottomTabs';
import PageTransition from '../common/PageTransition/PageTransition';
import styles from './Layout.module.css';

export default function Layout() {
  const location = useLocation();

  return (
    <div className={styles.layout}>
      <Navbar />
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </AnimatePresence>
      </main>
      <Footer />
      <BottomTabs />
    </div>
  );
}
