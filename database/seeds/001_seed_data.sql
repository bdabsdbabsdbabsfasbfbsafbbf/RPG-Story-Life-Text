-- RPG Story Life - Seed Data
-- Initial classes, maps, NPCs, and starter items

BEGIN;

-- === Starter Classes ===
INSERT INTO classes (id, name, description, lore, role, difficulty, element, is_starter, max_rank, core_stats, modifier_stats, combat_stats)
VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'Warrior',
  'Um guerreiro resistente que empunha espadas e escudos. Especialista em combate corpo a corpo.',
  'Os primeiros guerreiros foram forjados nas batalhas que moldaram este mundo. Sua força vem da disciplina e da coragem.',
  'tank', 'easy', 'neutral', true, 10,
  '{"attack": 80, "defense": 90, "magic": 10, "magicDefense": 40}',
  '{"criticalChance": 5, "criticalDamage": 150, "armorPenetration": 5, "dodge": 5, "accuracy": 85, "attackSpeed": 90}',
  '{"hp": 3500, "mana": 500, "stamina": 1100, "lifeSteal": 5, "cooldownReduction": 5}'
),
(
  'c0000000-0000-0000-0000-000000000002',
  'Mage',
  'Um poderoso usuário de magia que canaliza os elementos para destruir seus inimigos.',
  'Os magos estudam nas torres ancestrais, dominando os segredos do arcano e dos elementos.',
  'mage', 'medium', 'fire', true, 10,
  '{"attack": 10, "defense": 20, "magic": 100, "magicDefense": 60}',
  '{"criticalChance": 15, "criticalDamage": 175, "magicPenetration": 15, "dodge": 10, "accuracy": 90, "attackSpeed": 80}',
  '{"hp": 2000, "mana": 1500, "stamina": 600, "lifeSteal": 3, "cooldownReduction": 15}'
),
(
  'c0000000-0000-0000-0000-000000000003',
  'Rogue',
  'Um assassino ágil que ataca das sombras com golpes precisos e mortais.',
  'Os rogues operam nas margens da sociedade, usando furtividade e precisão para eliminar seus alvos.',
  'assassin', 'hard', 'dark', true, 10,
  '{"attack": 90, "defense": 30, "magic": 15, "magicDefense": 25}',
  '{"criticalChance": 30, "criticalDamage": 225, "armorPenetration": 20, "dodge": 25, "accuracy": 95, "attackSpeed": 150}',
  '{"hp": 2200, "mana": 700, "stamina": 1400, "lifeSteal": 10, "cooldownReduction": 20}'
);

-- === Initial Maps ===
INSERT INTO maps (id, name, description, required_level, required_rank, is_active, sort_order)
VALUES
('m0000000-0000-0000-0000-000000000001', 'Battleon', 'A cidade principal dos heróis. Um porto seguro onde aventureiros se reúnem.', 1, 0, true, 0),
('m0000000-0000-0000-0000-000000000002', 'Floresta Sombria', 'Uma floresta densa onde criaturas sombrias espreitam entre as árvores.', 5, 1, true, 1),
('m0000000-0000-0000-0000-000000000003', 'Montanhas Gélidas', 'Picos cobertos de neve habitados por bestas selvagens.', 15, 2, true, 2),
('m0000000-0000-0000-0000-000000000004', 'Vulcão Infernal', 'Um vulcão ativo no coração das terras ardentes.', 30, 4, true, 3);

-- === Initial NPCs ===
INSERT INTO npcs (id, name, dialogue, npc_type, map_id, quests)
VALUES
('n0000000-0000-0000-0000-000000000001', 'Mestre dos Novatos', 'Bem-vindo, jovem aventureiro! Estou aqui para ajudá-lo a começar sua jornada.', 'quest_giver', 'm0000000-0000-0000-0000-000000000001', '[]'),
('n0000000-0000-0000-0000-000000000002', 'Ferreiros Baltazar', 'Compre minhas armas forjadas a fogo! Nenhum monstro resistirá ao seu poder.', 'blacksmith', 'm0000000-0000-0000-0000-000000000001', '[]'),
('n0000000-0000-0000-0000-000000000003', 'Maga Evelyn', 'A magia flui em todos nós. Deixe-me ensinar-lhe os caminhos do arcano.', 'trainer', 'm0000000-0000-0000-0000-000000000001', '[]');

-- === Initial Starter Equipment ===
INSERT INTO equipment (id, name, description, slot, rarity, level, required_level, stats, tradeable, sell_price)
VALUES
('e0000000-0000-0000-0000-000000000001', 'Espada de Ferro', 'Uma espada básica de ferro.', 'weapon', 'common', 1, 1, '{"attack": 10}', true, 10),
('e0000000-0000-0000-0000-000000000002', 'Escudo de Madeira', 'Um escudo leve de madeira.', 'shield', 'common', 1, 1, '{"defense": 8}', true, 8),
('e0000000-0000-0000-0000-000000000003', 'Cajado Iniciante', 'Um cajado simples para canalizar magia.', 'weapon', 'common', 1, 1, '{"magic": 12}', true, 10),
('e0000000-0000-0000-0000-000000000004', 'Adaga de Ferro', 'Uma adaga rápida e leve.', 'weapon', 'common', 1, 1, '{"attack": 7, "attackSpeed": 110}', true, 10),
('e0000000-0000-0000-0000-000000000005', 'Armadura de Couro', 'Uma armadura leve de couro.', 'chestplate', 'common', 1, 1, '{"defense": 5, "dodge": 2}', true, 15),
('e0000000-0000-0000-0000-000000000006', 'Poção de Cura', 'Restaura 50 HP.', 'relic', 'common', 1, 1, '{"hp": 50}', true, 5);

-- === Initial Quest ===
INSERT INTO quests (id, name, description, quest_type, difficulty, required_level, objectives, rewards, map_id, npc_id)
VALUES
(
  'q0000000-0000-0000-0000-000000000001',
  'Primeiros Passos',
  'Fale com o Mestre dos Novatos em Battleon para começar sua jornada.',
  'story', 'easy', 1,
  '[{"type": "talk", "target": "n0000000-0000-0000-0000-000000000001", "quantity": 1, "description": "Fale com o Mestre dos Novatos"}]',
  '{"gold": 50, "experience": 100, "items": []}',
  'm0000000-0000-0000-0000-000000000001',
  'n0000000-0000-0000-0000-000000000001'
);

COMMIT;
