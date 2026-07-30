import { AppDataSource } from '../connection';

export async function seedNPCs(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query(`TRUNCATE TABLE "npcs" CASCADE`);

    const npcs = [
      {
        name: 'Elder Marcus',
        title: 'Village Elder',
        description: 'A wise old man who has guided Thornport for decades. He remembers the days before the Great Sundering.',
        type: 'QUEST_GIVER',
        level: 10,
        max_hp: 500,
        max_mp: 200,
        stats: '{"wisdom": 20, "intelligence": 15}',
        faction: 'thornport',
        aggression: 'FRIENDLY',
        respawn_time: 10,
        experience_reward: 0,
        gold_drop_min: 0,
        gold_drop_max: 0,
        loot_table: '[]',
        dialogue: JSON.stringify([
          'Ah, a new face in Thornport! Welcome, young one.',
          'The road ahead is dangerous, but great rewards await the brave.',
          'Have you spoken with Merchant Lena? She has supplies for new adventurers.',
          'The Whispering Meadows to the east are a good place to start your training.',
        ]),
        shop: '[]',
        quests: JSON.stringify(['quest_first_steps', 'quest_into_the_meadows']),
        behavior: JSON.stringify({ movement: 'stationary', abilities: [], attackPattern: [], spawnEffects: [], deathEffects: [] }),
      },
      {
        name: 'Merchant Lena',
        title: 'Traveling Merchant',
        description: 'A sharp-eyed trader who travels between settlements. She always has useful goods at fair prices.',
        type: 'MERCHANT',
        level: 15,
        max_hp: 300,
        max_mp: 150,
        stats: '{"intelligence": 18, "dexterity": 12}',
        faction: 'thornport',
        aggression: 'FRIENDLY',
        respawn_time: 10,
        experience_reward: 0,
        gold_drop_min: 0,
        gold_drop_max: 0,
        loot_table: '[]',
        dialogue: JSON.stringify([
          'Welcome to my shop! I have everything a young adventurer needs.',
          'Fresh supplies from across the realm! Take a look.',
          'I hear the Shadowfen Crypt holds treasures beyond imagination... if you survive.',
        ]),
        shop: JSON.stringify(['item_rusty_sword', 'item_wooden_shield', 'item_apprentice_wand', 'item_healing_herb', 'item_mana_leaf', 'item_leather_helmet', 'item_novice_boots']),
        quests: '[]',
        behavior: JSON.stringify({ movement: 'stationary', abilities: [], attackPattern: [], spawnEffects: [], deathEffects: [] }),
      },
      {
        name: 'Slime',
        title: '',
        description: 'A bouncy, gelatinous creature that oozes across the ground. Harmless alone, dangerous in groups.',
        type: 'MONSTER',
        level: 1,
        max_hp: 30,
        max_mp: 0,
        stats: '{"strength": 3, "vitality": 2}',
        faction: 'monsters',
        aggression: 'AGGRESSIVE',
        respawn_time: 10,
        experience_reward: 15,
        gold_drop_min: 1,
        gold_drop_max: 3,
        loot_table: JSON.stringify([
          { itemId: 'item_slime_gel', chance: 0.6, minQuantity: 1, maxQuantity: 2, isGuaranteed: false },
        ]),
        dialogue: '[]',
        shop: '[]',
        quests: '[]',
        behavior: JSON.stringify({ movement: 'random', abilities: ['tackle'], attackPattern: ['tackle'], spawnEffects: [], deathEffects: [] }),
      },
      {
        name: 'Wild Boar',
        title: '',
        description: 'A fierce tusked boar that charges at anything it perceives as a threat. Its hide is tough as leather.',
        type: 'MONSTER',
        level: 3,
        max_hp: 60,
        max_mp: 0,
        stats: '{"strength": 8, "vitality": 6, "agility": 4}',
        faction: 'monsters',
        aggression: 'AGGRESSIVE',
        respawn_time: 15,
        experience_reward: 30,
        gold_drop_min: 3,
        gold_drop_max: 8,
        loot_table: JSON.stringify([
          { itemId: 'item_boar_tusk', chance: 0.5, minQuantity: 1, maxQuantity: 2, isGuaranteed: false },
          { itemId: 'item_tough_hide', chance: 0.4, minQuantity: 1, maxQuantity: 1, isGuaranteed: false },
        ]),
        dialogue: '[]',
        shop: '[]',
        quests: '[]',
        behavior: JSON.stringify({ movement: 'random', abilities: ['charge', 'tusk_strike'], attackPattern: ['charge', 'tusk_strike', 'tusk_strike'], spawnEffects: [], deathEffects: [] }),
      },
      {
        name: 'Forest Fairy',
        title: 'Meadow Spirit',
        description: 'A mischievous but friendly forest spirit. It glows with soft luminescence and leaves a trail of sparkling dust.',
        type: 'MONSTER',
        level: 2,
        max_hp: 25,
        max_mp: 40,
        stats: '{"intelligence": 10, "wisdom": 8, "agility": 12}',
        faction: 'neutral',
        aggression: 'NEUTRAL',
        respawn_time: 20,
        experience_reward: 25,
        gold_drop_min: 2,
        gold_drop_max: 5,
        loot_table: JSON.stringify([
          { itemId: 'item_fairy_dust', chance: 0.7, minQuantity: 1, maxQuantity: 3, isGuaranteed: false },
        ]),
        dialogue: JSON.stringify(['*giggles* You can see me? Most humans just walk right through!']),
        shop: '[]',
        quests: '[]',
        behavior: JSON.stringify({ movement: 'random', abilities: ['magic_bolt', 'dazzle'], attackPattern: ['magic_bolt', 'dazzle', 'magic_bolt'], spawnEffects: ['sparkle'], deathEffects: ['burst_of_light'] }),
      },
      {
        name: 'Skeleton Warrior',
        title: 'Crypt Warden',
        description: 'An animated skeleton clad in rusted armor. It mindlessly guards the secrets of Shadowfen Crypt.',
        type: 'MONSTER',
        level: 5,
        max_hp: 80,
        max_mp: 10,
        stats: '{"strength": 12, "vitality": 8, "dexterity": 6}',
        faction: 'undead',
        aggression: 'AGGRESSIVE',
        respawn_time: 20,
        experience_reward: 45,
        gold_drop_min: 5,
        gold_drop_max: 12,
        loot_table: JSON.stringify([
          { itemId: 'item_ancient_bone', chance: 0.5, minQuantity: 1, maxQuantity: 2, isGuaranteed: false },
          { itemId: 'item_rusty_helmet', chance: 0.2, minQuantity: 1, maxQuantity: 1, isGuaranteed: false },
        ]),
        dialogue: '[]',
        shop: '[]',
        quests: '[]',
        behavior: JSON.stringify({ movement: 'patrol', patrolPath: [{ x: 30, y: 30, waitTime: 3 }, { x: 50, y: 30, waitTime: 3 }, { x: 50, y: 50, waitTime: 3 }, { x: 30, y: 50, waitTime: 3 }], abilities: ['slash', 'shield_bash'], attackPattern: ['slash', 'shield_bash', 'slash'], spawnEffects: ['rising_bones'], deathEffects: ['bone_explosion'] }),
      },
      {
        name: 'Wraith',
        title: 'Soul Collector',
        description: 'A spectral entity that feeds on the life force of the living. Its touch drains warmth and vitality.',
        type: 'MONSTER',
        level: 7,
        max_hp: 60,
        max_mp: 80,
        stats: '{"intelligence": 15, "wisdom": 12, "agility": 10}',
        faction: 'undead',
        aggression: 'AGGRESSIVE',
        respawn_time: 30,
        experience_reward: 60,
        gold_drop_min: 8,
        gold_drop_max: 20,
        loot_table: JSON.stringify([
          { itemId: 'item_soul_fragment', chance: 0.4, minQuantity: 1, maxQuantity: 1, isGuaranteed: false },
          { itemId: 'item_ethereal_essence', chance: 0.3, minQuantity: 1, maxQuantity: 1, isGuaranteed: false },
        ]),
        dialogue: JSON.stringify(['*eerie whisper* ...so cold... so alone...']),
        shop: '[]',
        quests: '[]',
        behavior: JSON.stringify({ movement: 'random', abilities: ['life_drain', 'shadow_bolt', 'fear'], attackPattern: ['shadow_bolt', 'life_drain', 'fear', 'shadow_bolt'], spawnEffects: ['mist_appear'], deathEffects: ['soul_release'] }),
      },
      {
        name: 'Crypt Guardian',
        title: 'The Sealed One',
        description: 'A massive construct of bone and shadow, bound to protect the innermost chamber of Shadowfen Crypt.',
        type: 'BOSS',
        level: 10,
        max_hp: 500,
        max_mp: 150,
        stats: '{"strength": 20, "vitality": 18, "intelligence": 10, "wisdom": 8}',
        faction: 'undead',
        aggression: 'AGGRESSIVE',
        respawn_time: 120,
        experience_reward: 300,
        gold_drop_min: 50,
        gold_drop_max: 150,
        loot_table: JSON.stringify([
          { itemId: 'item_silver_ring_protection', chance: 0.3, minQuantity: 1, maxQuantity: 1, isGuaranteed: false },
          { itemId: 'item_guardian_core', chance: 0.8, minQuantity: 1, maxQuantity: 1, isGuaranteed: true },
          { itemId: 'item_dark_shard', chance: 0.5, minQuantity: 1, maxQuantity: 2, isGuaranteed: false },
        ]),
        dialogue: JSON.stringify(['YOU SHALL NOT PASS.', 'THE MASTER COMMANDS IT.', '*ground-shaking roar*']),
        shop: '[]',
        quests: '[]',
        behavior: JSON.stringify({ movement: 'stationary', abilities: ['bone_spike', 'shadow_wave', 'soul_shatter', 'enrage'], attackPattern: ['bone_spike', 'shadow_wave', 'bone_spike', 'soul_shatter'], enrageAtHp: 0.25, enrageAbility: 'enrage', spawnEffects: ['ground_rumble', 'darkness_descends'], deathEffects: ['crystal_shatter', 'light_returns'] }),
      },
    ];

    for (const npc of npcs) {
      await queryRunner.query(
        `INSERT INTO "npcs" (name, title, description, type, level, max_hp, max_mp, stats, faction, aggression, respawn_time, experience_reward, gold_drop_min, gold_drop_max, loot_table, dialogue, shop, quests, behavior)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [npc.name, npc.title, npc.description, npc.type, npc.level, npc.max_hp, npc.max_mp, npc.stats, npc.faction, npc.aggression, npc.respawn_time, npc.experience_reward, npc.gold_drop_min, npc.gold_drop_max, npc.loot_table, npc.dialogue, npc.shop, npc.quests, npc.behavior]
      );
    }

    console.log('NPCs seeded successfully');
  } finally {
    await queryRunner.release();
  }
}

if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedNPCs())
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
