// Cria conta de teste direto no banco de produção (usar com: railway run node scripts/create-test-user.js)
const path = require("path");
const { PrismaClient } = require(path.join(__dirname, "..", "backend", "node_modules", "@prisma", "client"));
const bcrypt = require(path.join(__dirname, "..", "backend", "node_modules", "bcryptjs"));

async function main() {
  const prisma = new PrismaClient();
  const username = process.env.TEST_USER || "aibot";
  const password = process.env.TEST_PASS || "BotTeste2026!";
  const role = process.env.TEST_ROLE || "admin";
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    const updated = await prisma.user.update({ where: { id: existing.id }, data: { role } });
    console.log(`OK: usuario ${updated.username} atualizado (role=${updated.role})`);
  } else {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        username,
        displayName: username,
        email: `${username}@teste.local`,
        passwordHash,
        role,
      },
    });
    console.log(`OK: usuario criado -> ${user.username} (role=${user.role})`);
  }
  await prisma.$disconnect();
}

main().catch(async (err) => {
  console.error("ERRO:", err.message);
  process.exit(1);
});
