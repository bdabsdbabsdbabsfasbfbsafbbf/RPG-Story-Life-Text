import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create initial classes
  const classes = [
    {
      name: "ShadowStalker",
      slug: "shadowstalker",
      description: "A master of shadows who strikes from darkness. Assassins who excel at burst damage and mobility.",
      lore: "Born in the twilight realms, ShadowStalkers have mastered the art of moving unseen. They strike when least expected, leaving only shadows behind.",
      element: "dark",
      rarity: "rare",
      difficulty: "hard",
      role: "assassin",
      baseHp: 80, baseMana: 40,
      baseAttack: 18, baseDefense: 6, baseMagic: 8, baseMagicDefense: 4, baseSpeed: 18,
      requiredLevel: 1,
    },
    {
      name: "Crystal Guardian",
      slug: "crystal-guardian",
      description: "Unyielding protectors who harness crystalline energy to shield allies and crush foes.",
      lore: "Forged in the heart of ancient crystal caves, these guardians draw power from the earth itself. Their shields are unbreakable, their resolve unshakable.",
      element: "earth",
      rarity: "rare",
      difficulty: "easy",
      role: "tank",
      baseHp: 150, baseMana: 30,
      baseAttack: 8, baseDefense: 22, baseMagic: 4, baseMagicDefense: 18, baseSpeed: 6,
      requiredLevel: 1,
    },
    {
      name: "Arcane Weaver",
      slug: "arcane-weaver",
      description: "Masters of arcane magic who weave spells of immense power and complexity.",
      lore: "The Arcane Weavers study the fundamental threads of magic, pulling and twisting them to reshape reality. Their power is boundless but demands great focus.",
      element: "light",
      rarity: "rare",
      difficulty: "medium",
      role: "mage",
      baseHp: 70, baseMana: 100,
      baseAttack: 4, baseDefense: 4, baseMagic: 22, baseMagicDefense: 12, baseSpeed: 10,
      requiredLevel: 1,
    },
    {
      name: "Storm Berserker",
      slug: "storm-berserker",
      description: "Fury incarnate. These warriors channel the storm's rage into devastating physical attacks.",
      lore: "When the first storm touched the heart of a warrior, the Berserkers were born. They fight with wild abandon, each blow carrying the thunder's wrath.",
      element: "wind",
      rarity: "uncommon",
      difficulty: "easy",
      role: "dps",
      baseHp: 110, baseMana: 20,
      baseAttack: 20, baseDefense: 10, baseMagic: 2, baseMagicDefense: 4, baseSpeed: 14,
      requiredLevel: 1,
    },
    {
      name: "Holy Luminary",
      slug: "holy-luminary",
      description: "Divine healers who bathe allies in holy light and smite darkness with sacred power.",
      lore: "Chosen by the celestial light, Holy Luminaries carry the blessing of the ancients. Their healing knows no bounds, and their wrath against evil is absolute.",
      element: "light",
      rarity: "epic",
      difficulty: "medium",
      role: "support",
      baseHp: 90, baseMana: 90,
      baseAttack: 6, baseDefense: 8, baseMagic: 18, baseMagicDefense: 16, baseSpeed: 8,
      requiredLevel: 1,
    },
  ];

  for (const cls of classes) {
    await prisma.gameClass.upsert({
      where: { slug: cls.slug },
      update: cls,
      create: cls,
    });
  }
  console.log(`Created ${classes.length} classes`);

  // Create skills for ShadowStalker
  const shadowStalker = await prisma.gameClass.findUnique({ where: { slug: "shadowstalker" } });
  if (shadowStalker) {
    const skills = [
      {
        classId: shadowStalker.id,
        name: "Shadow Strike",
        description: "A quick strike from the shadows, dealing physical damage and applying Bleeding.",
        type: "active",
        cooldown: 4000,
        manaCost: 10,
        castTime: 200,
        rankRequired: 1,
        sortOrder: 1,
        baseDamage: 25,
        damageType: "physical",
        damageScaling: JSON.stringify({ attack: 0.7 }),
        buffsApplied: JSON.stringify([]),
        debuffsApplied: JSON.stringify([]),
        stacksApplied: JSON.stringify({ stackId: "bleeding", amount: 1 }),
      },
      {
        classId: shadowStalker.id,
        name: "Shadow Dance",
        description: "Dance through shadows, evading attacks and striking multiple foes.",
        type: "active",
        cooldown: 8000,
        manaCost: 20,
        castTime: 500,
        rankRequired: 3,
        sortOrder: 2,
        baseDamage: 40,
        damageType: "physical",
        damageScaling: JSON.stringify({ attack: 1.0 }),
      },
      {
        classId: shadowStalker.id,
        name: "Dark Energy Blade",
        description: "Infuse your weapon with dark energy, consuming Bleeding stacks for bonus damage.",
        type: "active",
        cooldown: 12000,
        manaCost: 30,
        castTime: 300,
        rankRequired: 5,
        sortOrder: 3,
        baseDamage: 60,
        damageType: "dark",
        damageScaling: JSON.stringify({ attack: 0.8, magic: 0.4 }),
        stacksRequired: JSON.stringify({ stackId: "bleeding", amount: 3, consume: true }),
      },
      {
        classId: shadowStalker.id,
        name: "Shadow Cloak",
        description: "Envelop yourself in shadows, gaining invisibility and increased critical chance.",
        type: "active",
        cooldown: 20000,
        manaCost: 25,
        castTime: 0,
        rankRequired: 7,
        sortOrder: 4,
        baseDamage: 0,
        damageType: "physical",
        buffsApplied: JSON.stringify([{ buffId: "shadow_cloak", duration: 5000, stacks: 1 }]),
      },
      {
        classId: shadowStalker.id,
        name: "Shadow Realm Execution",
        description: "Drag your target into the shadow realm, dealing massive damage based on missing HP.",
        type: "ultimate",
        cooldown: 90000,
        manaCost: 50,
        castTime: 1000,
        rankRequired: 10,
        sortOrder: 10,
        baseDamage: 200,
        damageType: "true",
        damageScaling: JSON.stringify({ attack: 2.5 }),
      },
      {
        classId: shadowStalker.id,
        name: "Assassin's Instinct",
        description: "Passively increases critical damage and attack speed.",
        type: "passive",
        cooldown: 0,
        manaCost: 0,
        castTime: 0,
        rankRequired: 2,
        sortOrder: 0,
        baseDamage: 0,
        damageType: "physical",
      },
      {
        classId: shadowStalker.id,
        name: "Shadow Walker",
        description: "Passively increases dodge chance and movement speed.",
        type: "passive",
        cooldown: 0,
        manaCost: 0,
        castTime: 0,
        rankRequired: 4,
        sortOrder: 0,
        baseDamage: 0,
        damageType: "physical",
      },
    ];

    for (const skill of skills) {
      await prisma.skill.upsert({
        where: { id: skill.name.toLowerCase().replace(/\s+/g, "-") },
        update: skill,
        create: { id: skill.name.toLowerCase().replace(/\s+/g, "-"), ...skill },
      });
    }
    console.log(`Created skills for ShadowStalker`);
  }

  // Create skills for Crystal Guardian
  const crystalGuardian = await prisma.gameClass.findUnique({ where: { slug: "crystal-guardian" } });
  if (crystalGuardian) {
    const skills = [
      { name: "Crystal Shield Bash", description: "Bash the enemy with your crystal shield, dealing damage and stunning.", type: "active", cooldown: 6000, manaCost: 15, rankRequired: 1, sortOrder: 1, baseDamage: 20, damageType: "physical", damageScaling: JSON.stringify({ defense: 0.6 }), debuffsApplied: JSON.stringify([{ buffId: "stun", duration: 1500, stacks: 1 }]) },
      { name: "Fortress Stance", description: "Enter a defensive stance, increasing defense and healing over time.", type: "active", cooldown: 15000, manaCost: 20, rankRequired: 3, sortOrder: 2, baseDamage: 0, damageType: "physical", buffsApplied: JSON.stringify([{ buffId: "fortress", duration: 8000, stacks: 1 }]) },
      { name: "Crystal Eruption", description: "Crystals erupt from the ground, damaging and slowing enemies.", type: "active", cooldown: 10000, manaCost: 25, rankRequired: 5, sortOrder: 3, baseDamage: 45, damageType: "magic", damageScaling: JSON.stringify({ magicDefense: 0.7 }) },
      { name: "Guardian's Sacrifice", description: "Take reduced damage and redirect ally damage to yourself.", type: "active", cooldown: 30000, manaCost: 30, rankRequired: 7, sortOrder: 4, baseDamage: 0, damageType: "physical", buffsApplied: JSON.stringify([{ buffId: "sacrifice", duration: 6000, stacks: 1 }]) },
      { name: "Diamond Shell", description: "Ultimate: Encased in pure diamond, becoming immune to all damage and reflecting attacks.", type: "ultimate", cooldown: 90000, manaCost: 60, rankRequired: 10, sortOrder: 10, baseDamage: 0, damageType: "true", buffsApplied: JSON.stringify([{ buffId: "diamond_shell", duration: 4000, stacks: 1 }]) },
      { name: "Crystal Body", description: "Passively increases max HP and defense.", type: "passive", cooldown: 0, manaCost: 0, rankRequired: 2, sortOrder: 0, baseDamage: 0, damageType: "physical" },
      { name: "Thorns Aura", description: "Passively reflects damage back to attackers.", type: "passive", cooldown: 0, manaCost: 0, rankRequired: 4, sortOrder: 0, baseDamage: 0, damageType: "physical" },
    ];
    for (const skill of skills) {
      await prisma.skill.upsert({
        where: { id: skill.name.toLowerCase().replace(/\s+/g, "-") },
        update: skill,
        create: { id: skill.name.toLowerCase().replace(/\s+/g, "-"), ...skill },
      });
    }
    console.log(`Created skills for Crystal Guardian`);
  }

  // Create initial monsters
  const monsters = [
    { name: "Slime", description: "A gelatinous blob of ooze.", level: 1, hp: 30, attack: 5, defense: 2, xpReward: 10, goldReward: 5, attackSpeed: 2500, isBoss: false, isElite: false, element: "neutral", accuracy: 85, dodge: 1 },
    { name: "Goblin Scout", description: "A sneaky goblin armed with a rusty dagger.", level: 2, hp: 45, attack: 8, defense: 3, xpReward: 18, goldReward: 8, attackSpeed: 2000, isBoss: false, isElite: false, element: "neutral", accuracy: 88, dodge: 3 },
    { name: "Skeleton Warrior", description: "An undead warrior raised from the grave.", level: 3, hp: 60, attack: 10, defense: 6, xpReward: 25, goldReward: 12, attackSpeed: 2200, isBoss: false, isElite: false, element: "dark", accuracy: 85, dodge: 1 },
    { name: "Shadow Wraith", description: "A tormented spirit from the shadow realm.", level: 5, hp: 50, attack: 7, magic: 12, defense: 3, magicDefense: 8, xpReward: 35, goldReward: 15, attackSpeed: 1800, isBoss: false, isElite: false, element: "dark", accuracy: 90, dodge: 5 },
    { name: "Fire Elemental", description: "A blazing entity of pure fire.", level: 8, hp: 80, attack: 15, magic: 18, defense: 5, magicDefense: 10, xpReward: 60, goldReward: 25, attackSpeed: 2000, isBoss: false, isElite: true, element: "fire", accuracy: 85, dodge: 2 },
    { name: "Dragon Whelp", description: "A young dragon, still dangerous.", level: 15, hp: 200, attack: 25, magic: 20, defense: 15, magicDefense: 12, xpReward: 150, goldReward: 80, attackSpeed: 1800, isBoss: true, isElite: false, element: "fire", accuracy: 90, dodge: 5, criticalChance: 10, criticalDamage: 160 },
  ];

  for (const monster of monsters) {
    await prisma.monster.upsert({
      where: { id: monster.name.toLowerCase().replace(/\s+/g, "-") },
      update: monster,
      create: { id: monster.name.toLowerCase().replace(/\s+/g, "-"), ...monster },
    });
  }
  console.log(`Created ${monsters.length} monsters`);

  // Create initial maps
  const maps = [
    { name: "Battleon", description: "The main hub of the realm. Adventurers gather here.", slug: "battleon", region: "core", requiredLevel: 1, sortOrder: 1 },
    { name: "Shadow Woods", description: "A dark forest infested with shadow creatures.", slug: "shadow-woods", region: "core", requiredLevel: 1, sortOrder: 2 },
    { name: "Crystal Caverns", description: "Glittering caves filled with crystalline monsters.", slug: "crystal-caverns", region: "core", requiredLevel: 3, sortOrder: 3 },
    { name: "Fire Realm", description: "A volcanic region where fire elementals roam.", slug: "fire-realm", region: "elemental", requiredLevel: 8, sortOrder: 4 },
    { name: "Dragon's Peak", description: "The lair of dragons, home to the mightiest foes.", slug: "dragons-peak", region: "endgame", requiredLevel: 15, sortOrder: 5 },
  ];

  for (const map of maps) {
    await prisma.map.upsert({
      where: { slug: map.slug },
      update: map,
      create: map,
    });
  }
  console.log(`Created ${maps.length} maps`);

  // Create map connections
  const battleon = await prisma.map.findUnique({ where: { slug: "battleon" } });
  const shadowWoods = await prisma.map.findUnique({ where: { slug: "shadow-woods" } });
  const crystalCaverns = await prisma.map.findUnique({ where: { slug: "crystal-caverns" } });
  const fireRealm = await prisma.map.findUnique({ where: { slug: "fire-realm" } });
  const dragonsPeak = await prisma.map.findUnique({ where: { slug: "dragons-peak" } });

  if (battleon && shadowWoods) {
    await prisma.mapConnection.upsert({
      where: { id: "battleon-shadow-woods" },
      update: { direction: "bidirectional" },
      create: { id: "battleon-shadow-woods", fromMapId: battleon.id, toMapId: shadowWoods.id, direction: "bidirectional" },
    });
  }
  if (battleon && crystalCaverns) {
    await prisma.mapConnection.upsert({
      where: { id: "battleon-crystal-caverns" },
      update: { direction: "bidirectional" },
      create: { id: "battleon-crystal-caverns", fromMapId: battleon.id, toMapId: crystalCaverns.id, requiredLevel: 3, direction: "bidirectional" },
    });
  }
  if (shadowWoods && fireRealm) {
    await prisma.mapConnection.upsert({
      where: { id: "shadow-woods-fire-realm" },
      update: { direction: "bidirectional" },
      create: { id: "shadow-woods-fire-realm", fromMapId: shadowWoods.id, toMapId: fireRealm.id, requiredLevel: 8, direction: "bidirectional" },
    });
  }
  if (crystalCaverns && dragonsPeak) {
    await prisma.mapConnection.upsert({
      where: { id: "crystal-caverns-dragons-peak" },
      update: { direction: "bidirectional" },
      create: { id: "crystal-caverns-dragons-peak", fromMapId: crystalCaverns.id, toMapId: dragonsPeak.id, requiredLevel: 15, direction: "bidirectional" },
    });
  }

  // Spawn monsters on maps
  if (shadowWoods) {
    const slime = await prisma.monster.findUnique({ where: { id: "slime" } });
    const goblin = await prisma.monster.findUnique({ where: { id: "goblin-scout" } });
    const skeleton = await prisma.monster.findUnique({ where: { id: "skeleton-warrior" } });
    const wraith = await prisma.monster.findUnique({ where: { id: "shadow-wraith" } });

    if (slime) await prisma.mapMonster.upsert({ where: { id: "shadow-woods-slime" }, update: {}, create: { id: "shadow-woods-slime", mapId: shadowWoods.id, monsterId: slime.id, spawnRate: 0.8, minLevel: 1, maxLevel: 2, maxInstances: 10 } });
    if (goblin) await prisma.mapMonster.upsert({ where: { id: "shadow-woods-goblin" }, update: {}, create: { id: "shadow-woods-goblin", mapId: shadowWoods.id, monsterId: goblin.id, spawnRate: 0.6, minLevel: 2, maxLevel: 3, maxInstances: 8 } });
    if (skeleton) await prisma.mapMonster.upsert({ where: { id: "shadow-woods-skeleton" }, update: {}, create: { id: "shadow-woods-skeleton", mapId: shadowWoods.id, monsterId: skeleton.id, spawnRate: 0.4, minLevel: 3, maxLevel: 5, maxInstances: 5 } });
    if (wraith) await prisma.mapMonster.upsert({ where: { id: "shadow-woods-wraith" }, update: {}, create: { id: "shadow-woods-wraith", mapId: shadowWoods.id, monsterId: wraith.id, spawnRate: 0.2, minLevel: 5, maxLevel: 7, maxInstances: 3 } });
  }

  if (crystalCaverns) {
    const slime = await prisma.monster.findUnique({ where: { id: "slime" } });
    const skeleton = await prisma.monster.findUnique({ where: { id: "skeleton-warrior" } });
    if (slime) await prisma.mapMonster.upsert({ where: { id: "crystal-caverns-slime" }, update: {}, create: { id: "crystal-caverns-slime", mapId: crystalCaverns.id, monsterId: slime.id, spawnRate: 0.5, minLevel: 3, maxLevel: 5, maxInstances: 8 } });
    if (skeleton) await prisma.mapMonster.upsert({ where: { id: "crystal-caverns-skeleton" }, update: {}, create: { id: "crystal-caverns-skeleton", mapId: crystalCaverns.id, monsterId: skeleton.id, spawnRate: 0.6, minLevel: 4, maxLevel: 6, maxInstances: 6 } });
  }

  if (fireRealm) {
    const fireElemental = await prisma.monster.findUnique({ where: { id: "fire-elemental" } });
    if (fireElemental) await prisma.mapMonster.upsert({ where: { id: "fire-realm-elemental" }, update: {}, create: { id: "fire-realm-elemental", mapId: fireRealm.id, monsterId: fireElemental.id, spawnRate: 0.7, minLevel: 8, maxLevel: 12, maxInstances: 5 } });
  }

  if (dragonsPeak) {
    const dragon = await prisma.monster.findUnique({ where: { id: "dragon-whelp" } });
    if (dragon) await prisma.mapMonster.upsert({ where: { id: "dragons-peak-dragon" }, update: {}, create: { id: "dragons-peak-dragon", mapId: dragonsPeak.id, monsterId: dragon.id, spawnRate: 0.3, minLevel: 15, maxLevel: 20, maxInstances: 2 } });
  }

  // Create initial NPCs
  const npcs = [
    { name: "Twilly", description: "The friendly guide of Battleon. Always ready to help new adventurers.", type: "quest_giver" },
    { name: "Zorbak", description: "A mischievous merchant with rare goods.", type: "vendor" },
    { name: "Artix", description: "The legendary undead slayer. Offers hunting quests.", type: "quest_giver" },
    { name: "Maya", description: "A master blacksmith who can craft powerful weapons.", type: "blacksmith" },
    { name: "Sage Uldor", description: "A wise mage who teaches arcane arts.", type: "trainer" },
  ];

  for (const npc of npcs) {
    await prisma.npc.upsert({
      where: { id: npc.name.toLowerCase().replace(/\s+/g, "-") },
      update: npc,
      create: { id: npc.name.toLowerCase().replace(/\s+/g, "-"), ...npc },
    });
  }

  // Place NPCs in maps
  if (battleon) {
    const twilly = await prisma.npc.findUnique({ where: { id: "twilly" } });
    const zorbak = await prisma.npc.findUnique({ where: { id: "zorbak" } });
    const artix = await prisma.npc.findUnique({ where: { id: "artix" } });
    const maya = await prisma.npc.findUnique({ where: { id: "maya" } });
    const uldor = await prisma.npc.findUnique({ where: { id: "sage-uldor" } });

    if (twilly) await prisma.mapNpc.upsert({ where: { id: "battleon-twilly" }, update: {}, create: { id: "battleon-twilly", mapId: battleon.id, npcId: twilly.id } });
    if (zorbak) await prisma.mapNpc.upsert({ where: { id: "battleon-zorbak" }, update: {}, create: { id: "battleon-zorbak", mapId: battleon.id, npcId: zorbak.id } });
    if (artix) await prisma.mapNpc.upsert({ where: { id: "battleon-artix" }, update: {}, create: { id: "battleon-artix", mapId: battleon.id, npcId: artix.id } });
    if (maya) await prisma.mapNpc.upsert({ where: { id: "battleon-maya" }, update: {}, create: { id: "battleon-maya", mapId: battleon.id, npcId: maya.id } });
    if (uldor) await prisma.mapNpc.upsert({ where: { id: "battleon-uldor" }, update: {}, create: { id: "battleon-uldor", mapId: battleon.id, npcId: uldor.id } });
  }

  // Create initial buffs/debuffs
  const buffs = [
    { name: "Shadow Cloak", description: "Shrouded in shadows, gaining invisibility.", type: "buff", maxStacks: 1, duration: 5000, statModifiers: JSON.stringify({ dodge: 50, criticalChance: 25 }), stackBehavior: "refresh" },
    { name: "Fortress", description: "Defense increased and regenerating HP.", type: "buff", maxStacks: 1, duration: 8000, statModifiers: JSON.stringify({ defense: 50, healingReceived: 30 }), stackBehavior: "refresh" },
    { name: "Sacrifice", description: "Taking reduced damage, redirecting ally damage.", type: "buff", maxStacks: 1, duration: 6000, statModifiers: JSON.stringify({ defense: 30 }), stackBehavior: "refresh" },
    { name: "Diamond Shell", description: "Immune to all damage and reflecting attacks.", type: "buff", maxStacks: 1, duration: 4000, stackBehavior: "none" },
    { name: "Bleeding", description: "Taking damage over time.", type: "debuff", maxStacks: 10, duration: 8000, tickInterval: 1000, tickEffect: JSON.stringify({ damage: 5, type: "true" }), stackBehavior: "extend", maxStackEffect: JSON.stringify({ explode: true, damagePercent: 500, removeStacks: true }) },
    { name: "Stun", description: "Unable to act.", type: "debuff", maxStacks: 1, duration: 1500, stackBehavior: "none" },
  ];

  for (const buff of buffs) {
    await prisma.buff.upsert({
      where: { id: buff.name.toLowerCase().replace(/\s+/g, "-") },
      update: buff,
      create: { id: buff.name.toLowerCase().replace(/\s+/g, "-"), ...buff },
    });
  }

  // Create initial items
  const items = [
    { name: "Iron Sword", description: "A basic iron sword.", type: "weapon", rarity: "common", level: 1, stats: JSON.stringify({ attack: 5 }), buyPrice: 50, sellPrice: 10, isTradable: true, isSellable: true },
    { name: "Wooden Shield", description: "A simple wooden shield.", type: "shield", rarity: "common", level: 1, stats: JSON.stringify({ defense: 3 }), buyPrice: 40, sellPrice: 8, isTradable: true, isSellable: true },
    { name: "Leather Helmet", description: "Basic leather head protection.", type: "helmet", rarity: "common", level: 1, stats: JSON.stringify({ defense: 2, maxHp: 10 }), buyPrice: 30, sellPrice: 6, isTradable: true, isSellable: true },
    { name: "Leather Chestplate", description: "Basic leather body armor.", type: "chestplate", rarity: "common", level: 1, stats: JSON.stringify({ defense: 4, maxHp: 20 }), buyPrice: 60, sellPrice: 12, isTradable: true, isSellable: true },
    { name: "Leather Pants", description: "Basic leather leg protection.", type: "pants", rarity: "common", level: 1, stats: JSON.stringify({ defense: 2 }), buyPrice: 35, sellPrice: 7, isTradable: true, isSellable: true },
    { name: "Leather Boots", description: "Basic leather boots.", type: "boots", rarity: "common", level: 1, stats: JSON.stringify({ defense: 1, speed: 2 }), buyPrice: 25, sellPrice: 5, isTradable: true, isSellable: true },
    { name: "Leather Gloves", description: "Basic leather gloves.", type: "gloves", rarity: "common", level: 1, stats: JSON.stringify({ attack: 1 }), buyPrice: 20, sellPrice: 4, isTradable: true, isSellable: true },
    { name: "Copper Amulet", description: "A simple copper amulet.", type: "amulet", rarity: "common", level: 1, stats: JSON.stringify({ magic: 2, maxMana: 10 }), buyPrice: 45, sellPrice: 9, isTradable: true, isSellable: true },
    { name: "Silver Ring", description: "A basic silver ring.", type: "ring", rarity: "uncommon", level: 3, stats: JSON.stringify({ luck: 2, goldBonus: 5 }), buyPrice: 100, sellPrice: 20, isTradable: true, isSellable: true },
    { name: "Shadow Blade", description: "A blade forged in shadow essence.", type: "weapon", rarity: "rare", level: 5, stats: JSON.stringify({ attack: 15, criticalChance: 5, lifeSteal: 2 }), buyPrice: 500, sellPrice: 100, isTradable: true, isSellable: true },
    { name: "Crystal Shield", description: "A shield made of pure crystal.", type: "shield", rarity: "rare", level: 5, stats: JSON.stringify({ defense: 12, maxHp: 50, block: 5 }), buyPrice: 450, sellPrice: 90, isTradable: true, isSellable: true },
    { name: "Health Potion", description: "Restores 50 HP.", type: "consumable", rarity: "common", level: 1, stats: JSON.stringify({}), buyPrice: 10, sellPrice: 2, isTradable: true, isSellable: true, isStackable: true, maxStack: 99 },
    { name: "Mana Potion", description: "Restores 30 Mana.", type: "consumable", rarity: "common", level: 1, stats: JSON.stringify({}), buyPrice: 10, sellPrice: 2, isTradable: true, isSellable: true, isStackable: true, maxStack: 99 },
  ];

  for (const item of items) {
    await prisma.item.upsert({
      where: { id: item.name.toLowerCase().replace(/\s+/g, "-") },
      update: item,
      create: { id: item.name.toLowerCase().replace(/\s+/g, "-"), ...item },
    });
  }

  // Create initial quests
  const twillyNpc = await prisma.npc.findUnique({ where: { id: "twilly" } });
  const artixNpc = await prisma.npc.findUnique({ where: { id: "artix" } });

  if (twillyNpc && battleon) {
    await prisma.quest.upsert({
      where: { id: "first-steps" },
      update: {},
      create: {
        id: "first-steps",
        title: "First Steps",
        description: "Welcome to the realm! Defeat 5 Slimes to prove yourself.",
        type: "story",
        difficulty: "easy",
        requiredLevel: 1,
        giverNpcId: twillyNpc.id,
        mapId: battleon.id,
        isRepeatable: false,
        objectives: JSON.stringify([{ type: "kill", target: "slime", amount: 5, current: 0 }]),
        xpReward: 50,
        goldReward: 20,
      },
    });
  }

  if (artixNpc && battleon) {
    await prisma.quest.upsert({
      where: { id: "undead-menace" },
      update: {},
      create: {
        id: "undead-menace",
        title: "Undead Menace",
        description: "The undead are rising! Defeat 10 Skeleton Warriors in Shadow Woods.",
        type: "story",
        difficulty: "easy",
        requiredLevel: 3,
        giverNpcId: artixNpc.id,
        mapId: battleon.id,
        objectives: JSON.stringify([{ type: "kill", target: "skeleton-warrior", amount: 10, current: 0 }]),
        xpReward: 150,
        goldReward: 50,
      },
    });
  }

  // Create stack definitions
  const stacks = [
    { name: "Bleeding", description: "Taking damage over time. At 10 stacks, explodes for 500% damage.", type: "debuff", maxAmount: 10, duration: 8000, perStackEffect: JSON.stringify({ tickDamage: 5 }), maxEffect: JSON.stringify({ explode: true, damagePercent: 500, removeStacks: true }) },
    { name: "Dark Energy", description: "Dark energy buildup. Consumed by Dark Energy Blade for bonus damage.", type: "resource", maxAmount: 5, duration: 15000, consumeEffect: JSON.stringify({ damageBonus: 35, duration: 10000 }) },
  ];

  for (const stack of stacks) {
    await prisma.stackDefinition.upsert({
      where: { id: stack.name.toLowerCase().replace(/\s+/g, "-") },
      update: stack,
      create: { id: stack.name.toLowerCase().replace(/\s+/g, "-"), ...stack },
    });
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
