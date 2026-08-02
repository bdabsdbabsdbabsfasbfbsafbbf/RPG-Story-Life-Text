import { useGameStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import styles from './StatusBar.module.css';

export default function StatusBar() {
  const { selectedCharacter, currentMap } = useGameStore();
  const { user } = useAuthStore();

  if (!selectedCharacter) return null;

  const hpPercent = ((selectedCharacter.currentHp || 0) / (selectedCharacter.maxHp || 1)) * 100;
  const manaPercent = ((selectedCharacter.currentMana || 0) / (selectedCharacter.maxMana || 1)) * 100;
  const staminaPercent = ((selectedCharacter.currentStamina || 0) / (selectedCharacter.maxStamina || 1)) * 100;
  const xpPercent = ((selectedCharacter.experience || 0) / (selectedCharacter.experienceToNext || 1)) * 100;

  return (
    <div className={styles.statusBar}>
      <div className={styles.playerInfo}>
        <div className={styles.level}>Lv.{selectedCharacter.level}</div>
        <div className={styles.bars}>
          <div className={styles.barRow}>
            <div className={styles.barLabel}>HP</div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${hpPercent}%`, background: 'var(--hp-color)' }}
              />
            </div>
            <span className={styles.barText}>
              {selectedCharacter.currentHp}/{selectedCharacter.maxHp}
            </span>
          </div>
          <div className={styles.barRow}>
            <div className={styles.barLabel}>MP</div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${manaPercent}%`, background: 'var(--mana-color)' }}
              />
            </div>
            <span className={styles.barText}>
              {selectedCharacter.currentMana}/{selectedCharacter.maxMana}
            </span>
          </div>
          <div className={styles.barRow}>
            <div className={styles.barLabel}>SP</div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${staminaPercent}%`, background: 'var(--stamina-color)' }}
              />
            </div>
            <span className={styles.barText}>
              {selectedCharacter.currentStamina}/{selectedCharacter.maxStamina}
            </span>
          </div>
          <div className={styles.barRow}>
            <div className={styles.barLabel}>XP</div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{
                  width: selectedCharacter.atMaxLevel ? '100%' : `${xpPercent}%`,
                  background: 'var(--xp-color)',
                }}
              />
            </div>
            <span className={styles.barText}>
              {selectedCharacter.atMaxLevel ? 'MÁX' : `${selectedCharacter.experience}/${selectedCharacter.experienceToNext}`}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.locationInfo}>
        <div className={styles.mapName}>{currentMap?.name}</div>
        <div className={styles.locationName}>{currentMap?.region}</div>
      </div>
      <div className={styles.currency}>
        <div className={styles.gold}>
          <span className={styles.currencyIcon}>G</span>
          {(user?.gold ?? 0).toLocaleString()}
        </div>
        <div className={styles.diamonds}>
          <span className={styles.currencyIcon}>D</span>
          {(user?.diamonds ?? 0).toLocaleString()}
        </div>
      </div>
    </div>
  );
}
