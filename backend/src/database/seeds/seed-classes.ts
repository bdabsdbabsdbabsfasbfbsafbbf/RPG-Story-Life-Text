import { AppDataSource } from '../connection';

export async function seedClasses(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query(`TRUNCATE TABLE "classes" CASCADE`);

    const classes = [
      {
        name: 'Novice',
        description: 'The beginning of every great adventure. Novices are初学者 learning the basics of combat and exploration.',
        lore: 'In the realm of Aetheria, every hero begins as a Novice. With nothing but determination and a spark of potential, they step into a world of magic and monsters. Though weak, their adaptability is their greatest strength.',
        role: 'BALANCED',
        primary_stat: 'strength',
        hp_multiplier: 1.00,
        mp_multiplier: 1.00,
        base_stats: '{"hp": 100, "mp": 50, "strength": 5, "dexterity": 5, "intelligence": 5, "vitality": 5, "wisdom": 5, "agility": 5}',
        stat_growth: '{"hp": 20, "mp": 10, "strength": 1, "dexterity": 1, "intelligence": 1, "vitality": 1, "wisdom": 1, "agility": 1}',
        rank: 0,
        rank_name: 'Initiate',
        requirements: null,
      },
      {
        name: 'Warrior',
        description: 'Masters of physical combat who wield heavy weapons and wear sturdy armor. Warriors excel at dealing and absorbing damage.',
        lore: 'Forged in the crucible of battle, Warriors are the stalwart defenders of civilization. From the Iron Peaks to the Crimson Fields, they have stood firm against the darkness. Their code of honor is matched only by their devastating blade.',
        role: 'TANK',
        primary_stat: 'strength',
        hp_multiplier: 1.30,
        mp_multiplier: 0.70,
        base_stats: '{"hp": 150, "mp": 40, "strength": 8, "dexterity": 5, "intelligence": 3, "vitality": 8, "wisdom": 3, "agility": 4}',
        stat_growth: '{"hp": 35, "mp": 5, "strength": 2, "dexterity": 1, "intelligence": 0, "vitality": 2, "wisdom": 0, "agility": 1}',
        rank: 1,
        rank_name: 'Sword Initiate',
        requirements: '{"level": 10, "stats": {"strength": 15}}',
      },
      {
        name: 'Mage',
        description: 'Wielders of arcane magic who command the elements. Mages deal devastating magical damage from a distance.',
        lore: 'The arcane arts flow through the veins of those chosen by the Crystal of Eternity. Mages spend years studying ancient tomes in the floating towers of Lumina, mastering the delicate weave of reality itself to bend fire, ice, and lightning to their will.',
        role: 'DAMAGE',
        primary_stat: 'intelligence',
        hp_multiplier: 0.70,
        mp_multiplier: 1.50,
        base_stats: '{"hp": 70, "mp": 100, "strength": 2, "dexterity": 4, "intelligence": 10, "vitality": 3, "wisdom": 8, "agility": 4}',
        stat_growth: '{"hp": 10, "mp": 25, "strength": 0, "dexterity": 1, "intelligence": 3, "vitality": 1, "wisdom": 2, "agility": 1}',
        rank: 1,
        rank_name: 'Apprentice',
        requirements: '{"level": 10, "stats": {"intelligence": 15}}',
      },
      {
        name: 'Rogue',
        description: 'Shadowy figures who strike from the darkness. Rogues excel at critical strikes, evasion, and subterfuge.',
        lore: 'Born in the shadowy alleys of Thornport, Rogues are the unseen hand that shapes destiny. They walk the fine line between light and shadow, using cunning and precision to overcome obstacles that brute force could never solve.',
        role: 'DAMAGE',
        primary_stat: 'dexterity',
        hp_multiplier: 0.85,
        mp_multiplier: 0.90,
        base_stats: '{"hp": 85, "mp": 60, "strength": 4, "dexterity": 10, "intelligence": 4, "vitality": 4, "wisdom": 3, "agility": 8}',
        stat_growth: '{"hp": 15, "mp": 8, "strength": 1, "dexterity": 3, "intelligence": 1, "vitality": 1, "wisdom": 0, "agility": 2}',
        rank: 1,
        rank_name: 'Shadow Initiate',
        requirements: '{"level": 10, "stats": {"dexterity": 15}}',
      },
      {
        name: 'Cleric',
        description: 'Holy warriors blessed by the divine. Clerics heal allies, banish undead, and protect the faithful.',
        lore: 'When the first tear fell from the Eye of Creation, it blessed the devoted souls who would become Clerics. These holy warriors carry the light of the Divine Spark, mending wounds and smiting darkness with sacred radiance.',
        role: 'HEALER',
        primary_stat: 'wisdom',
        hp_multiplier: 1.00,
        mp_multiplier: 1.20,
        base_stats: '{"hp": 100, "mp": 80, "strength": 3, "dexterity": 3, "intelligence": 6, "vitality": 6, "wisdom": 10, "agility": 3}',
        stat_growth: '{"hp": 20, "mp": 18, "strength": 0, "dexterity": 1, "intelligence": 2, "vitality": 2, "wisdom": 3, "agility": 0}',
        rank: 1,
        rank_name: 'Acolyte',
        requirements: '{"level": 10, "stats": {"wisdom": 15}}',
      },
      {
        name: 'Ranger',
        description: 'Masters of the wild who excel at ranged combat and survival. Rangers are unparalleled trackers and marksmen.',
        lore: 'Deep within the Verdant Woods, the Rangers maintain the ancient pact between civilization and nature. They speak the language of beasts and trees, defend the natural order, and never miss their mark.',
        role: 'BALANCED',
        primary_stat: 'agility',
        hp_multiplier: 0.90,
        mp_multiplier: 0.85,
        base_stats: '{"hp": 90, "mp": 55, "strength": 5, "dexterity": 7, "intelligence": 4, "vitality": 5, "wisdom": 5, "agility": 9}',
        stat_growth: '{"hp": 18, "mp": 7, "strength": 1, "dexterity": 2, "intelligence": 1, "vitality": 1, "wisdom": 1, "agility": 2}',
        rank: 1,
        rank_name: 'Scout',
        requirements: '{"level": 10, "stats": {"agility": 15}}',
      },
    ];

    for (const cls of classes) {
      await queryRunner.query(
        `INSERT INTO "classes" (name, description, lore, role, primary_stat, hp_multiplier, mp_multiplier, base_stats, stat_growth, rank, rank_name, requirements)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)`,
        [cls.name, cls.description, cls.lore, cls.role, cls.primary_stat, cls.hp_multiplier, cls.mp_multiplier, cls.base_stats, cls.stat_growth, cls.rank, cls.rank_name, cls.requirements]
      );
    }

    console.log('Classes seeded successfully');
  } finally {
    await queryRunner.release();
  }
}

if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedClasses())
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
