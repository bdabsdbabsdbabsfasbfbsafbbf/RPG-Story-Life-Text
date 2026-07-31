import { useState } from 'react';
import styles from './ClassScreen.module.css';

interface SkillDetail {
  id: string;
  name: string;
  icon: string;
  description: string;
  cooldown: number;
  manaCost: number;
  type: 'Ativa' | 'Passiva' | 'Ultimate';
  buffs: string[];
  debuffs: string[];
  duration: number;
  maxStacks: number;
  unlockRank: number;
}

interface GameClass {
  id: string;
  name: string;
  role: string;
  difficulty: string;
  element: string;
  lore: string;
  description: string;
  currentRank: number;
  maxRank: number;
  xp: number;
  xpToNext: number;
  coreStats: Record<string, number>;
  modifierStats: Record<string, number>;
  combatStats: Record<string, number>;
  skills: SkillDetail[];
}

const mockClass: GameClass = {
  id: 'shadow-stalker',
  name: 'ShadowStalker',
  role: 'Assassin',
  difficulty: 'Hard',
  element: 'Dark',
  lore: 'Os ShadowStalkers são mestres das sombras, treinados nas antigas artes do assassinato e da furtividade. Eles usam a escuridão como lâmina.',
  description: 'Uma classe ágil e mortal que causa dano massivo através de stacks de sombra.',
  currentRank: 3,
  maxRank: 10,
  xp: 450,
  xpToNext: 1000,
  coreStats: { Ataque: 85, Defesa: 35, Magia: 20, 'Def. Mágica': 30 },
  modifierStats: { 'Chance Crítica': 25, 'Dano Crítico': 200, Penetração: 15, Esquiva: 20, Precisão: 90, 'Vel. Ataque': 130 },
  combatStats: { HP: 2800, Mana: 800, Stamina: 1200, 'Vida Roubada': 8, 'Red. CD': 15 },
  skills: [
    {
      id: 's1', name: 'Lâmina Sombria', icon: '🗡', description: 'Um golpe rápido que aplica Sombra no alvo.',
      cooldown: 4000, manaCost: 10, type: 'Ativa', buffs: [], debuffs: ['Sombra'],
      duration: 8, maxStacks: 10, unlockRank: 1,
    },
    {
      id: 's2', name: 'Passos Fantasmas', icon: '👻', description: 'Aumenta a esquiva e velocidade de ataque.',
      cooldown: 8000, manaCost: 15, type: 'Ativa', buffs: ['Esquiva+', 'Vel. Ataque+'], debuffs: [],
      duration: 6, maxStacks: 1, unlockRank: 2,
    },
    {
      id: 's3', name: 'Dilacerar', icon: '💥', description: 'Consome stacks de Sombra para causar dano massivo.',
      cooldown: 10000, manaCost: 25, type: 'Ativa', buffs: [], debuffs: ['Sangramento'],
      duration: 4, maxStacks: 5, unlockRank: 4,
    },
    {
      id: 's4', name: 'Manto Sombrio', icon: '🖤', description: 'Passiva: Stacks de Sombra aumentam dano crítico.',
      cooldown: 0, manaCost: 0, type: 'Passiva', buffs: ['Dano Crítico+'], debuffs: [],
      duration: 0, maxStacks: 1, unlockRank: 6,
    },
    {
      id: 's5', name: 'Execução das Sombras', icon: '☠', description: 'Causa 500% de dano. Remove stacks de Sombra.',
      cooldown: 90000, manaCost: 50, type: 'Ultimate', buffs: [], debuffs: [],
      duration: 0, maxStacks: 0, unlockRank: 8,
    },
  ],
};

export default function ClassScreen() {
  const [selectedSkill, setSelectedSkill] = useState<SkillDetail | null>(null);
  const cls = mockClass;

  return (
    <div className={styles.container}>
      <div className={styles.mainPanel}>
        <div className={styles.classHeader}>
          <div className={styles.classIconLarge}>🌑</div>
          <div>
            <h1 className={styles.className}>{cls.name}</h1>
            <div className={styles.classTags}>
              <span className={styles.tag}>{cls.role}</span>
              <span className={styles.tag}>{cls.difficulty}</span>
              <span className={styles.tag}>{cls.element}</span>
            </div>
          </div>
          <div className={styles.rankDisplay}>
            <div className={styles.rankLabel}>Rank</div>
            <div className={styles.rankValue}>
              {cls.currentRank} <span className={styles.rankMax}>/ {cls.maxRank}</span>
            </div>
            <div className={styles.rankBar}>
              <div className={styles.rankBarFill} style={{ width: `${(cls.xp / cls.xpToNext) * 100}%` }} />
            </div>
            <div className={styles.rankXp}>{cls.xp} / {cls.xpToNext} XP</div>
          </div>
        </div>

        <div className={styles.classDescription}>
          <p>{cls.description}</p>
          <p className={styles.lore}>{cls.lore}</p>
        </div>

        <div className={styles.skillsSection}>
          <h2 className={styles.sectionTitle}>Habilidades</h2>
          <div className={styles.skillsGrid}>
            {cls.skills.map((skill) => (
              <button
                key={skill.id}
                className={`${styles.skillCard} ${selectedSkill?.id === skill.id ? styles.skillSelected : ''}`}
                onClick={() => setSelectedSkill(skill)}
              >
                <div className={styles.skillIconLarge}>{skill.icon}</div>
                <div className={styles.skillInfo}>
                  <div className={styles.skillCardName}>{skill.name}</div>
                  <div className={styles.skillCardType}>{skill.type}</div>
                  <div className={styles.skillCardUnlock}>Rank {skill.unlockRank}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className={styles.statsSection}>
          <h2 className={styles.sectionTitle}>Atributos</h2>
          <div className={styles.statsGrid}>
            <div className={styles.statGroup}>
              <h3 className={styles.statGroupTitle}>Core Stats</h3>
              {Object.entries(cls.coreStats).map(([key, val]) => (
                <div key={key} className={styles.statRow}>
                  <span className={styles.statLabel}>{key}</span>
                  <span className={styles.statValue}>{val}</span>
                </div>
              ))}
            </div>
            <div className={styles.statGroup}>
              <h3 className={styles.statGroupTitle}>Modifier Stats</h3>
              {Object.entries(cls.modifierStats).map(([key, val]) => (
                <div key={key} className={styles.statRow}>
                  <span className={styles.statLabel}>{key}</span>
                  <span className={styles.statValue}>{val}{typeof val === 'number' && val > 10 ? '%' : ''}</span>
                </div>
              ))}
            </div>
            <div className={styles.statGroup}>
              <h3 className={styles.statGroupTitle}>Combat Stats</h3>
              {Object.entries(cls.combatStats).map(([key, val]) => (
                <div key={key} className={styles.statRow}>
                  <span className={styles.statLabel}>{key}</span>
                  <span className={styles.statValue}>{val}{typeof val === 'number' && val < 100 ? '%' : ''}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedSkill && (
        <div className={styles.skillDetail}>
          <button className={styles.closeDetail} onClick={() => setSelectedSkill(null)}>✕</button>
          <div className={styles.detailIcon}>{selectedSkill.icon}</div>
          <h2 className={styles.detailName}>{selectedSkill.name}</h2>
          <span className={`${styles.detailType} ${styles[`type${selectedSkill.type}`]}`}>
            {selectedSkill.type}
          </span>
          <p className={styles.detailDesc}>{selectedSkill.description}</p>
          <div className={styles.detailInfo}>
            {selectedSkill.cooldown > 0 && (
              <div className={styles.detailRow}>
                <span>Cooldown</span>
                <span className={styles.detailValue}>{(selectedSkill.cooldown / 1000).toFixed(1)}s</span>
              </div>
            )}
            {selectedSkill.manaCost > 0 && (
              <div className={styles.detailRow}>
                <span>Custo de Mana</span>
                <span className={styles.detailValue}>{selectedSkill.manaCost}</span>
              </div>
            )}
            {selectedSkill.duration > 0 && (
              <div className={styles.detailRow}>
                <span>Duração</span>
                <span className={styles.detailValue}>{selectedSkill.duration}s</span>
              </div>
            )}
            {selectedSkill.maxStacks > 0 && (
              <div className={styles.detailRow}>
                <span>Stack Máximo</span>
                <span className={styles.detailValue}>{selectedSkill.maxStacks}</span>
              </div>
            )}
            <div className={styles.detailRow}>
              <span>Requisito</span>
              <span className={styles.detailValue}>Rank {selectedSkill.unlockRank}</span>
            </div>
          </div>
          {selectedSkill.buffs.length > 0 && (
            <div className={styles.detailEffects}>
              <h4>Buffs:</h4>
              {selectedSkill.buffs.map((b) => <span key={b} className={styles.effectBadge}>{b}</span>)}
            </div>
          )}
          {selectedSkill.debuffs.length > 0 && (
            <div className={styles.detailEffects}>
              <h4>Debuffs:</h4>
              {selectedSkill.debuffs.map((b) => <span key={b} className={`${styles.effectBadge} ${styles.debuff}`}>{b}</span>)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
