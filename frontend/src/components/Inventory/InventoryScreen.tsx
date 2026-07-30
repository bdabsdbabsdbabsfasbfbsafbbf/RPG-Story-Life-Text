import styles from './InventoryScreen.module.css';

const mockItems = [
  { id: '1', name: 'Espada de Ferro', icon: '🗡', rarity: 'common', qty: 1, slot: 'weapon' },
  { id: '2', name: 'Elmo de Aço', icon: '⛑', rarity: 'uncommon', qty: 1, slot: 'helmet' },
  { id: '3', name: 'Poção de Cura', icon: '🧪', rarity: 'common', qty: 12, slot: 'consumable' },
  { id: '4', name: 'Anel de Rubi', icon: '💍', rarity: 'rare', qty: 1, slot: 'ring' },
];

export default function InventoryScreen() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Inventário</h1>
        <div className={styles.actions}>
          <input type="text" placeholder="Pesquisar..." className={styles.search} />
          <select className={styles.filter}>
            <option>Todos</option>
            <option>Armas</option>
            <option>Armaduras</option>
            <option>Consumíveis</option>
          </select>
        </div>
      </div>
      <div className={styles.grid}>
        {mockItems.map((item) => (
          <div key={item.id} className={styles.item}>
            <div className={styles.itemIcon}>{item.icon}</div>
            <div className={styles.itemInfo}>
              <div className={styles.itemName}>{item.name}</div>
              <div className={`${styles.itemRarity} ${styles[`rarity_${item.rarity}`]}`}>
                {item.rarity}
              </div>
            </div>
            <div className={styles.itemQty}>x{item.qty}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
