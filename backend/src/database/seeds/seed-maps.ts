import { AppDataSource } from '../connection';

export async function seedMaps(): Promise<void> {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();

  try {
    await queryRunner.query(`TRUNCATE TABLE "maps" CASCADE`);

    const maps = [
      {
        name: 'Starter Village - Thornport',
        description: 'A peaceful coastal village where new adventurers begin their journey. Surrounded by gentle meadows and a calm sea.',
        lore: 'Thornport was the first settlement founded by the refugees of the Great Sundering. Its lighthouse, built from the remains of an ancient titan, has guided countless heroes to safety.',
        width: 200,
        height: 200,
        type: 'TOWN',
        danger_level: 1,
        required_level: 1,
        recommended_level: 1,
        is_instance: false,
        max_players: 100,
        connections: JSON.stringify([
          { mapId: 'map_02', targetMapId: 'map_01', x: 180, y: 100, targetX: 0, targetY: 100, requiredLevel: 1, direction: 'east' },
          { mapId: 'map_03', targetMapId: 'map_01', x: 100, y: 180, targetX: 100, targetY: 0, requiredLevel: 5, direction: 'south' },
        ]),
        resources: JSON.stringify([]),
        spawn_points: JSON.stringify([]),
        music: 'town_theme_gentle.mp3',
        ambient: 'birds_chirping.mp3',
        weather: JSON.stringify(['clear', 'light_rain']),
      },
      {
        name: 'Whispering Meadows',
        description: 'Lush green meadows filled with gentle creatures and blooming flowers. A perfect training ground for novices.',
        lore: 'It is said that the wind in these meadows carries the whispers of ancient heroes who fell in the first battle against the Void. The flowers bloom eternal, nourished by their sacrifice.',
        width: 300,
        height: 300,
        type: 'OVERWORLD',
        danger_level: 2,
        required_level: 1,
        recommended_level: 3,
        is_instance: false,
        max_players: 50,
        connections: JSON.stringify([
          { mapId: 'map_01', targetMapId: 'map_02', x: 0, y: 100, targetX: 180, targetY: 100, requiredLevel: 1, direction: 'west' },
          { mapId: 'map_03', targetMapId: 'map_02', x: 250, y: 250, targetX: 0, targetY: 50, requiredLevel: 3, direction: 'southeast' },
        ]),
        resources: JSON.stringify([
          { name: 'Copper Ore', type: 'MINING', x: 100, y: 50, respawnTime: 30, requiredLevel: 1, requiredSkill: 'mining', rewards: [{ itemId: 'item_copper_ore', quantity: 1, chance: 1.0 }] },
          { name: 'Herb Garden', type: 'HERBALISM', x: 200, y: 150, respawnTime: 25, requiredLevel: 1, requiredSkill: 'herbalism', rewards: [{ itemId: 'item_healing_herb', quantity: 1, chance: 0.8 }] },
        ]),
        spawn_points: JSON.stringify([
          { npcId: 'npc_slime', x: 50, y: 50, radius: 30, respawnTime: 10, maxCount: 8 },
          { npcId: 'npc_wild_boar', x: 150, y: 100, radius: 40, respawnTime: 15, maxCount: 5 },
          { npcId: 'npc_forest_fairy', x: 200, y: 200, radius: 20, respawnTime: 20, maxCount: 3 },
        ]),
        music: 'meadow_theme.mp3',
        ambient: 'wind_rustling.mp3',
        weather: JSON.stringify(['clear', 'cloudy', 'light_rain']),
      },
      {
        name: 'Shadowfen Crypt',
        description: 'An ancient burial ground consumed by dark magic. Undead roam the misty corridors of this forsaken place.',
        lore: 'Beneath the marshes of Shadowfen lies a crypt older than the kingdom itself. Sealed by the first Archmage, it holds a fragment of the Void Crystal. The dead do not rest here - they wait.',
        width: 150,
        height: 150,
        type: 'DUNGEON',
        danger_level: 4,
        required_level: 5,
        recommended_level: 7,
        is_instance: true,
        max_players: 5,
        connections: JSON.stringify([
          { mapId: 'map_02', targetMapId: 'map_03', x: 0, y: 50, targetX: 250, targetY: 250, requiredLevel: 3, direction: 'northwest' },
        ]),
        resources: JSON.stringify([
          { name: 'Ancient Bones', type: 'HUNTING', x: 75, y: 75, respawnTime: 60, requiredLevel: 3, requiredSkill: 'hunting', rewards: [{ itemId: 'item_ancient_bone', quantity: 1, chance: 0.6 }] },
        ]),
        spawn_points: JSON.stringify([
          { npcId: 'npc_skeleton', x: 30, y: 30, radius: 20, respawnTime: 20, maxCount: 6 },
          { npcId: 'npc_wraith', x: 100, y: 80, radius: 15, respawnTime: 30, maxCount: 3 },
          { npcId: 'npc_crypt_guardian', x: 120, y: 120, radius: 10, respawnTime: 120, maxCount: 1 },
        ]),
        music: 'dungeon_atmosphere.mp3',
        ambient: 'dripping_water.mp3',
        weather: JSON.stringify(['fog']),
      },
    ];

    for (const map of maps) {
      await queryRunner.query(
        `INSERT INTO "maps" (name, description, lore, width, height, type, danger_level, required_level, recommended_level, is_instance, max_players, connections, resources, spawn_points, music, ambient, weather)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
        [map.name, map.description, map.lore, map.width, map.height, map.type, map.danger_level, map.required_level, map.recommended_level, map.is_instance, map.max_players, map.connections, map.resources, map.spawn_points, map.music, map.ambient, map.weather]
      );
    }

    console.log('Maps seeded successfully');
  } finally {
    await queryRunner.release();
  }
}

if (require.main === module) {
  AppDataSource.initialize()
    .then(() => seedMaps())
    .then(() => process.exit(0))
    .catch((err) => { console.error(err); process.exit(1); });
}
