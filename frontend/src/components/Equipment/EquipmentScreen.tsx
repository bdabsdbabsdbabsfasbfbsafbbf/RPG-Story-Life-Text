import styles from './EquipmentScreen.module.css';

const slots = [
  { id: 'helmet', icon: '⛑', name: 'Capacete' },
  { id: 'chestplate', icon: '🛡', name: 'Peitoral' },
  { id: 'legs', icon: '👖', name: 'Calça' },
  { id: 'boots', icon: '👢', name: 'Botas' },
  { id: 'gloves', icon: '🧤', name: 'Luvas' },
  { id: 'weapon', icon: '🗡', name: 'Arma' },
  { id: 'shield', icon: '🔰', name: 'Escudo' },
  { id: 'amulet', icon: '📿', name: 'Amuleto' },
  { id: 'ring_1', icon: '💍', name: 'Anel 1' },
  { id: 'ring_2', icon: '💍', name: 'Anel 2' },
  { id: 'cape', icon: '🧣', name: 'Capa' },
  { id: 'relic', icon: '🔮', name: 'Relíquia' },
  { id: 'pet', icon: '🐉', name: 'Mascote' },
];

export default function EquipmentScreen() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Equipamentos</h1>
      <div className={styles.characterView}>
        <div className={styles.slotsGrid}>
          {slots.map((slot) => (
            <div key={slot.id} className={styles.slot}>
              <div className={styles.slotIcon}>{slot.icon}</div>
              <div className={styles.slotName}>{slot.name}</div>
              <div className={styles.slotItem}>Vazio</div>
            </div>
          ))}
        </div>
        <div className={styles.statsPreview}>
          <h3>Resumo de Atributos</h3>
          <div className={styles.statRow}><span>Ataque</span><span>120</span></div>
          <div className={styles.statRow}><span>Defesa</span><span>85</span></div>
          <div className={styles.statRow}><span>Magia</span><span>45</span></div>
          <div className={styles.statRow}><span>Chance Crítica</span><span>15%</span></div>
        </div>
      </div>
    </div>
  );
}
