import { useGameStore } from '../../store/gameStore';
import styles from './MainHUD.module.css';

const mockMaps = [
  { id: 'arcadia', name: 'Arcadia', level: 1, players: 42 },
  { id: 'floresta-sombria', name: 'Floresta Sombria', level: 10, players: 28 },
];

export default function MainHUD() {
  useGameStore();

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Mundo de RPG Story Life</h1>
        <p className={styles.subtitle}>Escolha um local para explorar</p>
      </div>

      <div className={styles.mapGrid}>
        {mockMaps.map((map) => (
          <div key={map.id} className={styles.mapCard}>
            <div className={styles.mapImage}>
              <div className={styles.mapLevel}>{map.level}</div>
            </div>
            <div className={styles.mapInfo}>
              <h3 className={styles.mapName}>{map.name}</h3>
              <div className={styles.mapMeta}>
                <span className={styles.mapPlayers}>
                  {map.players} jogadores
                </span>
                <span className={styles.mapReq}>Nv. {map.level}+</span>
              </div>
            </div>
            <button className={styles.enterBtn}>Entrar</button>
          </div>
        ))}
      </div>

      <div className={styles.quickActions}>
        <h2 className={styles.sectionTitle}>Ações Rápidas</h2>
        <div className={styles.actionGrid}>
          <button className={styles.actionBtn}>
            <span className={styles.actionIcon}>⚔</span>
            <span>Encontrar Monstro</span>
          </button>
          <button className={styles.actionBtn}>
            <span className={styles.actionIcon}>📋</span>
            <span>Missões Disponíveis</span>
          </button>
          <button className={styles.actionBtn}>
            <span className={styles.actionIcon}>👥</span>
            <span>Formar Party</span>
          </button>
          <button className={styles.actionBtn}>
            <span className={styles.actionIcon}>🏪</span>
            <span>Mercado</span>
          </button>
        </div>
      </div>
    </div>
  );
}
