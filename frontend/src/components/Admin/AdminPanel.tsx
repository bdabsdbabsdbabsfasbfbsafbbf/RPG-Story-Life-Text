import { useAuthStore } from '../../store/authStore';
import styles from './AdminPanel.module.css';

export default function AdminPanel() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'developer';

  if (!isAdmin) {
    return <div className={styles.denied}>Acesso negado. Apenas administradores podem acessar esta área.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Painel Administrativo</h1>
      <div className={styles.grid}>
        <div className={styles.card}><h3>Jogadores Online</h3><div className={styles.value}>0</div></div>
        <div className={styles.card}><h3>Total de Jogadores</h3><div className={styles.value}>0</div></div>
        <div className={styles.card}><h3>Combates Ativos</h3><div className={styles.value}>0</div></div>
        <div className={styles.card}><h3>Uptime</h3><div className={styles.value}>-</div></div>
      </div>
      <div className={styles.section}>
        <h2>Criadores</h2>
        <div className={styles.creatorGrid}>
          {['Classes', 'Itens', 'Monstros', 'Mapas', 'Missões', 'NPCs', 'Buffs', 'Receitas'].map((item) => (
            <button key={item} className={styles.creatorBtn}>{item}</button>
          ))}
        </div>
      </div>
    </div>
  );
}
