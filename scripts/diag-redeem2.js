// Quem resgatou TITAN e tem character?
const path = require("path");
const { PrismaClient } = require(path.join(__dirname, "..", "backend", "node_modules", "@prisma", "client"));

async function main() {
  const prisma = new PrismaClient();
  const redemptions = await prisma.redeemRedemption.findMany({ include: { user: { select: { username: true } }, code: { select: { code: true } } } });
  for (const r of redemptions) {
    const char = await prisma.character.findFirst({ where: { userId: r.userId }, select: { name: true, id: true } });
    const classes = await prisma.characterClass.findMany({ where: { characterId: char?.id ?? "none" }, include: { gameClass: { select: { name: true } } } });
    console.log(`${r.code.code} <- ${r.user.username} | character=${char ? char.name : "NENHUM"} | classes=${classes.map((c) => c.gameClass.name).join(", ") || "nenhuma"}`);
  }
  await prisma.$disconnect();
}

main().catch(async (err) => { console.error("ERRO:", err.message); process.exit(1); });
