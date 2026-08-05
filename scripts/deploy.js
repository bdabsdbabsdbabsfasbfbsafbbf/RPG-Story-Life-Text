const { spawnSync } = require("child_process");

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { stdio: "inherit", shell: !!opts.shell, ...opts });
  if (r.status !== 0 && !opts.ignoreFailure) {
    console.error(`\nFalhou: ${cmd} ${args.join(" ")}`);
    process.exit(r.status ?? 1);
  }
  return r;
}

const message = process.argv.slice(2).join(" ").trim() || "deploy: atualizacao";

console.log("=== 1/3 Verificando tipos (typecheck backend + frontend + admin) ===");
run("npm", ["run", "verify"], { shell: true });

console.log("=== 2/3 Preparando commit ===");
run("git", ["add", "-A"]);

const status = spawnSync("git", ["status", "--porcelain"], { encoding: "utf8" });
if (!status.stdout.trim()) {
  console.log("Nada para commitar — apenas fazendo push.");
} else {
  run("git", ["commit", "-m", message]);
}

console.log("=== 3/3 Push para o GitHub (dispara o deploy no Railway) ===");
run("git", ["push", "origin", "main"]);
console.log("\nDeploy disparado! Acompanhe em Railway > Deployments.");
