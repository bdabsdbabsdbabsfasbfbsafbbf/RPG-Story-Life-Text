import { useState, useEffect, useCallback } from 'react';
import { useGameStore } from '../../store/gameStore';
import styles from './CombatScreen.module.css';

interface Skill {
  id: string;
  name: string;
  icon: string;
  cooldown: number;
  manaCost: number;
  type: 'basic' | 'skill' | 'ultimate';
  description: string;
}

const mockSkills: Skill[] = [
  { id: 'basic', name: 'Ataque Básico', icon: '⚔', cooldown: 1000, manaCost: 0, type: 'basic', description: 'Um ataque rápido' },
  { id: 'skill1', name: 'Golpe Cortante', icon: '🗡', cooldown: 4000, manaCost: 10, type: 'skill', description: 'Causa dano físico' },
  { id: 'skill2', name: 'Escudo de Gelo', icon: '❄', cooldown: 8000, manaCost: 15, type: 'skill', description: 'Escudo que absorve dano' },
  { id: 'skill3', name: 'Rajada de Fogo', icon: '🔥', cooldown: 12000, manaCost: 25, type: 'skill', description: 'Ataque em área' },
  { id: 'skill4', name: 'Curar', icon: '💚', cooldown: 15000, manaCost: 20, type: 'skill', description: 'Recupera HP' },
  { id: 'ultimate', name: 'Fúria Divina', icon: '💫', cooldown: 90000, manaCost: 50, type: 'ultimate', description: 'Dano massivo' },
];

export default function CombatScreen() {
  useGameStore();
  const [cooldowns, setCooldowns] = useState<Record<string, number>>({});
  const [combatLog, setCombatLog] = useState<Array<{ text: string; type: string; id: number }>>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCooldowns((prev) => {
        const next: Record<string, number> = {};
        for (const [id, remaining] of Object.entries(prev)) {
          if (remaining > 0) {
            next[id] = Math.max(0, remaining - 100);
          }
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const useSkill = useCallback(
    (skill: Skill) => {
      if (cooldowns[skill.id] > 0) return;

      setCooldowns((prev) => ({ ...prev, [skill.id]: skill.cooldown }));

      const logEntry = {
        id: Date.now(),
        text: `${skill.name} usado!`,
        type: skill.type === 'ultimate' ? 'crit' : 'damage',
      };
      setCombatLog((prev) => [logEntry, ...prev].slice(0, 50));
    },
    [cooldowns]
  );

  const getCooldownPercent = (skill: Skill) => {
    const remaining = cooldowns[skill.id] || 0;
    return skill.cooldown > 0 ? (remaining / skill.cooldown) * 100 : 0;
  };

  const formatCooldown = (skill: Skill) => {
    const remaining = cooldowns[skill.id] || 0;
    if (remaining <= 0) return 'Pronto';
    return `${(remaining / 1000).toFixed(1)}s`;
  };

  return (
    <div className={styles.container}>
      <div className={styles.combatArena}>
        <div className={styles.targetPanel}>
          <div className={styles.targetName}>Monstro Selvagem</div>
          <div className={styles.targetHpBar}>
            <div className={styles.targetHpFill} style={{ width: '65%' }} />
          </div>
          <div className={styles.targetHpText}>650/1000 HP</div>
          <div className={styles.targetLevel}>Nv. 12</div>
        </div>

        <div className={styles.combatLogContainer}>
          <h3 className={styles.logTitle}>Log de Combate</h3>
          <div className={styles.combatLog}>
            {combatLog.map((entry) => (
              <div
                key={entry.id}
                className={`${styles.logEntry} ${styles[`log_${entry.type}`]}`}
              >
                {entry.text}
              </div>
            ))}
            {combatLog.length === 0 && (
              <div className={styles.logEmpty}>
                Use suas habilidades para começar o combate
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.skillsBar}>
        {mockSkills.map((skill) => {
          const isOnCooldown = (cooldowns[skill.id] || 0) > 0;
          const cdPercent = getCooldownPercent(skill);
          return (
            <button
              key={skill.id}
              className={`${styles.skillBtn} ${
                skill.type === 'ultimate' ? styles.ultimateBtn : ''
              } ${isOnCooldown ? styles.onCooldown : ''}`}
              onClick={() => useSkill(skill)}
              disabled={isOnCooldown}
              title={`${skill.name}: ${skill.description} (CD: ${skill.cooldown / 1000}s)`}
            >
              <div className={styles.skillIcon}>{skill.icon}</div>
              <div className={styles.skillName}>{skill.name}</div>
              <div className={styles.skillCost}>{skill.manaCost} MP</div>
              {isOnCooldown && (
                <div
                  className={styles.cooldownOverlay}
                  style={{ height: `${cdPercent}%` }}
                >
                  <span className={styles.cooldownText}>
                    {formatCooldown(skill)}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
