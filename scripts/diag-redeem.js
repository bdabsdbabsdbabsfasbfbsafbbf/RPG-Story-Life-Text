// Diagnostico redeem codes (usar com tunel do railway connect postgres)
const path = require("path");
const { PrismaClient } = require(path.join(__dirname, "..", "backend", "node_modules", "@prisma", "client"));

async function main() {
  const prisma = new PrismaClient();
  const codes = await prisma.redeemCode.findMany({ orderBy: { createdAt: "desc" }, take: 5 });
  console.log("=== ULTIMOS CODES ===");
  for (const c of codes) {
    console.log(`code=${c.code} active=${c.isActive} uses=${c.uses}/${c.maxUses} items=${JSON.stringify(c.items)}`);
  }
  const users = await prisma.user.findMany({ where: { OR: [{ username: "aibot" }, { username: "Darkin" }] } });
  for (const u of users) {
    const char = await prisma.character.findFirst({ where: { userId: u.id } });
    const redemptions = await prisma.redeemRedemption.findMany({ where: { userId: u.id }, include: { code: true } });
    console.log(`=== USER ${u.username} (${u.role}) ===`);
    console.log(`character: ${char ? char.id + " name=" + char.name : "NENHUM"}`);
    for (const r of redemptions) console.log(`  redeem: ${r.code.code} em ${r.redeemedAt}`);
  }
  const gameClasses = await prisma.gameClass.findMany({ select: { id: true, name: true, slug: true, isActive: true }, take: 30 });
  console.log("=== CLASSES (30) ===");
  for (const gc of gameClasses) console.log(`  ${gc.name} | slug=${gc.slug} | active=${gc.isActive}`);
  await prisma.$disconnect();
}

main().catch(async (err) => { console.error("ERRO:", err.message); process.exit(1); });
