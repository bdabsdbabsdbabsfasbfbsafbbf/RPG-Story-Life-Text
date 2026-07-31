import { useAuthStore } from '../../store/authStore';
import styles from './AuthScreen.module.css';

export default function AuthScreen() {
  const login = useAuthStore((s) => s.login);

  const handleQuickLogin = () => {
    void login('guest', 'guest123');
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>R</div>
          <h1 className={styles.title}>RPG Story Life</h1>
          <p className={styles.subtitle}>Um MMORPG de Texto Épico</p>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⚔</span>
            <span>Combate em tempo real com cooldowns</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>📜</span>
            <span>10+ classes com habilidades únicas</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🗺</span>
            <span>Mapas inspirados em AQWorlds</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>👥</span>
            <span>Guildas, Party e Mercado</span>
          </div>
        </div>

        <div className={styles.actions}>
          <button className={styles.discordBtn} onClick={handleQuickLogin}>
            Entrar com Discord
          </button>
          <button className={styles.guestBtn} onClick={handleQuickLogin}>
            Entrar como Convidado
          </button>
        </div>

        <p className={styles.footer}>v1.0.0 - Em desenvolvimento</p>
      </div>
    </div>
  );
}
