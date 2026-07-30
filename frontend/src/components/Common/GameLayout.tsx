import { Outlet } from 'react-router-dom';
import Sidebar from '../HUD/Sidebar';
import ChatPanel from '../Chat/ChatPanel';
import StatusBar from '../HUD/StatusBar';
import styles from './GameLayout.module.css';

export default function GameLayout() {
  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <StatusBar />
        <div className={styles.content}>
          <Outlet />
        </div>
      </main>
      <ChatPanel />
    </div>
  );
}
