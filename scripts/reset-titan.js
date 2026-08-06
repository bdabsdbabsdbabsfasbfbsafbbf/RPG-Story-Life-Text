// Limpa resgate do code TITAN p/ AdmDark (permite testar de novo)
const path = require("path");
const { PrismaClient } = require(path.join(__dirname, "..", "backend", "node_modules", "@prisma", "client"));

async function main() {
  const prisma = new PrismaClient();
  const code = await prisma.redeemCode.findUnique({ where: { code: "TITAN" } });
  if (!code) { console.log("code TITAN nao encontrado"); return; }
  const user = await prisma.user.findUnique({ where: { username: "AdmDark" } });
  if (!user) { console.log("AdmDark nao encontrado"); return; }
  const del = await prisma.redeemRedemption.deleteMany({ where: { codeId: code.id, userId: user.id } });
  await prisma.redeemCode.update({ where: { id: code.id }, data: { uses: 0 } });
  console.log(`redemptions removidas: ${del.count}; uses resetado para 0`);
  await prisma.$disconnect();
}

main().catch(async (err) => { console.error("ERRO:", err.message); process.exit(1); });
