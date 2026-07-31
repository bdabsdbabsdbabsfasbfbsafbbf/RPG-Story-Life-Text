import { useGameStore } from '../../store/gameStore';
import styles from './StatusBar.module.css';

export default function StatusBar() {
  const { character, currentMap, currentLocation } = useGameStore();

  if (!character) return null;

  const hpPercent = (character.currentHp / character.maxHp) * 100;
  const manaPercent = (character.currentMana / character.maxMana) * 100;
  const staminaPercent = (character.currentStamina / character.maxStamina) * 100;
  const xpPercent = (character.experience / character.experienceToNext) * 100;

  return (
    <div className={styles.statusBar}>
      <div className={styles.playerInfo}>
        <div className={styles.level}>Lv.{character.level}</div>
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
              {character.currentHp}/{character.maxHp}
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
              {character.currentMana}/{character.maxMana}
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
              {character.currentStamina}/{character.maxStamina}
            </span>
          </div>
          <div className={styles.barRow}>
            <div className={styles.barLabel}>XP</div>
            <div className={styles.barTrack}>
              <div
                className={styles.barFill}
                style={{ width: `${xpPercent}%`, background: 'var(--xp-color)' }}
              />
            </div>
            <span className={styles.barText}>
              {character.experience}/{character.experienceToNext}
            </span>
          </div>
        </div>
      </div>
      <div className={styles.locationInfo}>
        <div className={styles.mapName}>{currentMap}</div>
        <div className={styles.locationName}>{currentLocation}</div>
      </div>
      <div className={styles.currency}>
        <div className={styles.gold}>
          <span className={styles.currencyIcon}>G</span>
          {character.gold.toLocaleString()}
        </div>
        <div className={styles.diamonds}>
          <span className={styles.currencyIcon}>D</span>
          {character.diamonds.toLocaleString()}
        </div>
      </div>
    </div>
  );
}
