import { AppDataSource } from '../connection';

export async function seedQuests(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query(`TRUNCATE TABLE "quests" CASCADE`);

    const quests = [
      {
        title: 'First Steps',
        description: 'Speak with Elder Marcus and learn the basics of adventuring in Thornport.',
        lore: 'Every journey begins with a single step. Elder Marcus has guided countless heroes before you.',
        type: 'MAIN',
        level: 1,
        required_level: 1,
        objectives: JSON.stringify([
          { type: 'TALK', targetId: 'npc_elder_marcus', targetName: 'Elder Marcus', quantity: 1, description: 'Speak with Elder Marcus', locationX: 100, locationY: 100, radius: 5 },
        ]),
        rewards: JSON.stringify({
          experience: 50,
          gold: 25,
          items: [{ itemId: 'item_healing_herb', quantity: 3 }],
          reputation: { thornport: 10 },
        }),
        prerequisites: '[]',
        npc_id: null,
        map_id: null,
        is_repeatable: false,
        is_daily: false,
        cooldown_hours: 0,
        time_limit_minutes: 0,
        failure_conditions: '[]',
        dialogue_start: JSON.stringify([
          'Welcome, adventurer! I see you are new to Thornport.',
          'To begin your journey, you must first learn the basics.',
          'Speak with me again when you are ready to listen.',
        ]),
        dialogue_progress: JSON.stringify([
          'Have you been listening? Come back when you are ready to learn.',
        ]),
        dialogue_complete: JSON.stringify([
          'Well done! You have taken your first step.',
          'Now, head east to the Whispering Meadows and test your skills.',
        ]),
      },
      {
        title: 'Into the Meadows',
        description: 'Travel to the Whispering Meadows and defeat 5 Slimes to prove your worth.',
        lore: 'The Whispering Meadows are the traditional proving grounds for young adventurers of Thornport.',
        type: 'MAIN',
        level: 2,
        required_level: 1,
        objectives: JSON.stringify([
          { type: 'KILL', targetId: 'npc_slime', targetName: 'Slime', quantity: 5, description: 'Defeat Slimes in Whispering Meadows', locationX: 50, locationY: 50, radius: 100 },
        ]),
        rewards: JSON.stringify({
          experience: 100,
          gold: 50,
          items: [{ itemId: 'item_copper_dagger', quantity: 1 }],
          reputation: { thornport: 20 },
        }),
        prerequisites: JSON.stringify(['quest_first_steps']),
        npc_id: 'npc_elder_marcus',
        map_id: 'map_01',
        is_repeatable: false,
        is_daily: false,
        cooldown_hours: 0,
        time_limit_minutes: 0,
        failure_conditions: '[]',
        dialogue_start: JSON.stringify([
          'So you have decided to prove yourself. Excellent!',
          'In the Whispering Meadows, you will face your first foes.',
          'Defeat 5 Slimes and return to me.',
        ]),
        dialogue_progress: JSON.stringify([
          'Have you defeated those Slimes yet? They are not so tough!',
        ]),
        dialogue_complete: JSON.stringify([
          'Well fought! You have proven yourself capable.',
          'You are ready for greater challenges.',
        ]),
      },
      {
        title: 'Merchant Lena\'s Errand',
        description: 'Help Merchant Lena collect 3 Fairy Dust from the Forest Fairies in Whispering Meadows.',
        lore: 'Merchant Lena needs fairy dust for her special enchantments. The Forest Fairies of the meadows are the only source.',
        type: 'SIDE',
        level: 3,
        required_level: 2,
        objectives: JSON.stringify([
          { type: 'GATHER', targetId: 'item_fairy_dust', targetName: 'Fairy Dust', quantity: 3, description: 'Collect Fairy Dust from Forest Fairies' },
        ]),
        rewards: JSON.stringify({
          experience: 80,
          gold: 100,
          items: [{ itemId: 'item_mana_leaf', quantity: 5 }],
          reputation: { thornport: 15 },
        }),
        prerequisites: '[]',
        npc_id: 'npc_merchant_lena',
        map_id: 'map_01',
        is_repeatable: false,
        is_daily: false,
        cooldown_hours: 0,
        time_limit_minutes: 0,
        failure_conditions: '[]',
        dialogue_start: JSON.stringify([
          'Oh, perfect timing! I need a brave adventurer.',
          'The Forest Fairies have been particularly active lately.',
          'Bring me 3 Fairy Dust and I will reward you handsomely.',
        ]),
        dialogue_progress: JSON.stringify([
          'Do you have my Fairy Dust yet? The enchantments await!',
        ]),
        dialogue_complete: JSON.stringify([
          'Wonderful! This is high-quality dust!',
          'Here is your reward, and a little extra for your trouble.',
        ]),
      },
      {
        title: 'The Shadowfen Menace',
        description: 'Investigate the Shadowfen Crypt and defeat the Crypt Guardian that lurks within.',
        lore: 'Darkness stirs in the ancient crypt. Elder Marcus fears that the seal on the Void fragment is weakening.',
        type: 'MAIN',
        level: 7,
        required_level: 5,
        objectives: JSON.stringify([
          { type: 'KILL', targetId: 'npc_crypt_guardian', targetName: 'Crypt Guardian', quantity: 1, description: 'Defeat the Crypt Guardian' },
          { type: 'EXPLORE', targetId: 'map_shadowfen_crypt', targetName: 'Shadowfen Crypt', quantity: 1, description: 'Reach the heart of Shadowfen Crypt' },
        ]),
        rewards: JSON.stringify({
          experience: 500,
          gold: 200,
          items: [
            { itemId: 'item_silver_ring_protection', quantity: 1 },
            { itemId: 'item_healing_herb', quantity: 10 },
          ],
          reputation: { thornport: 50 },
        }),
        prerequisites: JSON.stringify(['quest_first_steps', 'quest_into_the_meadows']),
        npc_id: 'npc_elder_marcus',
        map_id: 'map_01',
        is_repeatable: false,
        is_daily: false,
        cooldown_hours: 0,
        time_limit_minutes: 60,
        failure_conditions: JSON.stringify([
          { type: 'death', value: 'true' },
          { type: 'timeout', value: '60' },
        ]),
        dialogue_start: JSON.stringify([
          'You have grown strong, adventurer. Now I must ask a great favor.',
          'The Shadowfen Crypt... something has awakened within.',
          'I need you to venture inside and put an end to whatever threatens us.',
        ]),
        dialogue_progress: JSON.stringify([
          'The crypt is dangerous. Please be careful, and return alive.',
        ]),
        dialogue_complete: JSON.stringify([
          'You did it! The darkness has been pushed back... for now.',
          'Take this ring as a token of gratitude. You have earned it.',
        ]),
      },
      {
        title: 'Gathering Supplies',
        description: 'Collect Copper Ore from the mining nodes in Whispering Meadows for the blacksmith.',
        lore: 'The village blacksmith is running low on copper for basic equipment repairs.',
        type: 'SIDE',
        level: 2,
        required_level: 1,
        objectives: JSON.stringify([
          { type: 'GATHER', targetId: 'item_copper_ore', targetName: 'Copper Ore', quantity: 5, description: 'Mine Copper Ore in the Whispering Meadows' },
        ]),
        rewards: JSON.stringify({
          experience: 60,
          gold: 75,
          items: [{ itemId: 'item_healing_herb', quantity: 5 }],
          reputation: { thornport: 10 },
        }),
        prerequisites: '[]',
        npc_id: null,
        map_id: null,
        is_repeatable: true,
        is_daily: true,
        cooldown_hours: 24,
        time_limit_minutes: 0,
        failure_conditions: '[]',
        dialogue_start: JSON.stringify([
          'We need materials for the village forge.',
          'Bring me copper ore from the meadows and I will see you compensated.',
        ]),
        dialogue_progress: JSON.stringify([
          'The forge grows cold waiting for materials...',
        ]),
        dialogue_complete: JSON.stringify([
          'Excellent quality ore! The forge will burn bright tonight.',
        ]),
      },
    ];

    for (const quest of quests) {
      await queryRunner.query(
        `INSERT INTO "quests" (title, description, lore, type, level, required_level, objectives, rewards, prerequisites, npc_id, map_id, is_repeatable, is_daily, cooldown_hours, time_limit_minutes, failure_conditions, dialogue_start, dialogue_progress, dialogue_complete)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)`,
        [quest.title, quest.description, quest.lore, quest.type, quest.level, quest.required_level, quest.objectives, quest.rewards, quest.prerequisites, quest.npc_id, quest.map_id, quest.is_repeatable, quest.is_daily, quest.cooldown_hours, quest.time_limit_minutes, quest.failure_conditions, quest.dialogue_start, quest.dialogue_progress, quest.dialogue_complete]
      );
    }

    console.log('Quests seeded successfully');
  } finally {
    await queryRunner.release();
  }
}

if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedQuests())
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
