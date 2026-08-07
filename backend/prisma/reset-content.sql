-- Reset de progresso: limpa itens, equipamentos, encantamentos, sessões de combate
-- e classes não-iniciais, mantendo contas e personagens. Ao final, o personagem
-- volta equipado com a primeira classe inicial (ordem alfabética: Assassino).
-- Executar manualmente (não roda no preDeploy):
--   railway connect postgres --tunnel-only -P 15432  (ou reutilize um túnel ativo)
--   $env:DATABASE_URL = "postgresql://postgres:<SENHA>@127.0.0.1:15432/railway"
--   cd backend && npx prisma db execute --file prisma/reset-content.sql
-- Depois, um deploy normal re-seeda o conteúdo (NPCs, ofertas, preços de classes).

DELETE FROM "ActiveCooldown";
DELETE FROM "ActiveEffect";
DELETE FROM "CombatSession";
DELETE FROM "UserEnchantment";
DELETE FROM "Equipment";
DELETE FROM "Inventory";

-- Remove progresso de classes que não são iniciais (antes de apagar as GameClass, por causa da FK)
DELETE FROM "CharacterClass" cc
WHERE cc."classId" NOT IN (SELECT "id" FROM "GameClass" WHERE "isStarter" = true);

-- Remove classes geradas em testes (não estão no seed): ficam só as iniciais + a VIP do seed.
-- A ordem importa (FKs: passives/skills -> GameClass, Character.classId -> GameClass).
DELETE FROM "Passive"
WHERE "classId" IN (SELECT "id" FROM "GameClass" WHERE "isStarter" = false AND "name" <> 'Senhor das Sombras');
DELETE FROM "Skill"
WHERE "classId" IN (SELECT "id" FROM "GameClass" WHERE "isStarter" = false AND "name" <> 'Senhor das Sombras');
DELETE FROM "ShopItem"
WHERE "classId" IN (SELECT "id" FROM "GameClass" WHERE "isStarter" = false AND "name" <> 'Senhor das Sombras');
DELETE FROM "ShopProduct"
WHERE "classId" IN (SELECT "id" FROM "GameClass" WHERE "isStarter" = false AND "name" <> 'Senhor das Sombras');
-- Character.classId é NOT NULL: em vez de NULL, volta para a primeira starter (ordem alfabética: Assassino)
UPDATE "Character" c
SET "classId" = s."id"
FROM (SELECT g."id" FROM "GameClass" g WHERE g."isStarter" = true ORDER BY g."name" LIMIT 1) s
WHERE c."classId" IN (SELECT g."id" FROM "GameClass" g WHERE g."isStarter" = false AND g."name" <> 'Senhor das Sombras');
DELETE FROM "GameClass"
WHERE "isStarter" = false AND "name" <> 'Senhor das Sombras';

-- Limpa StatModels órfãos (não referenciados por nenhuma classe)
DELETE FROM "StatModel"
WHERE "id" NOT IN (SELECT "statModelId" FROM "GameClass" WHERE "statModelId" IS NOT NULL);

-- Se a classe atual não é inicial, volta para a primeira starter (ordem alfabética: Assassino)
UPDATE "Character" c
SET "classId" = s."id"
FROM (SELECT g."id" FROM "GameClass" g WHERE g."isStarter" = true ORDER BY g."name" LIMIT 1) s
WHERE c."classId" IS NOT NULL
  AND c."classId" NOT IN (SELECT g."id" FROM "GameClass" g WHERE g."isStarter" = true);

-- Garante uma CharacterClass ativa para a classe atual do personagem
INSERT INTO "CharacterClass" ("id", "characterId", "classId", "isActive", "rank", "experience", "createdAt", "updatedAt")
SELECT gen_random_uuid(), c."id", c."classId", true, 1, 0, now(), now()
FROM "Character" c
WHERE c."classId" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "CharacterClass" cc
    WHERE cc."characterId" = c."id" AND cc."classId" = c."classId"
  );

-- Sincroniza isActive com a classe atual
UPDATE "CharacterClass" cc
SET "isActive" = true
WHERE "isActive" = false
  AND "classId" = (SELECT c."classId" FROM "Character" c WHERE c."id" = cc."characterId");

UPDATE "CharacterClass" cc
SET "isActive" = false
WHERE "isActive" = true
  AND "classId" <> (SELECT c."classId" FROM "Character" c WHERE c."id" = cc."characterId");
