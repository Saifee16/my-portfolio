import { hashAdminPassword } from "../lib/security.ts";

function readPassword() {
  if (!process.stdin.isTTY || !process.stdin.setRawMode) {
    return new Promise((resolve, reject) => {
      const chunks = [];
      process.stdin.on("data", chunk => chunks.push(chunk));
      process.stdin.on("end", () => resolve(Buffer.concat(chunks).toString().trim()));
      process.stdin.on("error", reject);
    });
  }
  return new Promise((resolve, reject) => {
    let password = "";
    const onData = chunk => {
      for (const character of String(chunk)) {
        if (character === "\u0003") {
          process.stdin.setRawMode(false);
          process.stdin.off("data", onData);
          reject(new Error("Cancelled"));
          return;
        }
        if (character === "\r" || character === "\n") {
          process.stdin.setRawMode(false);
          process.stdin.off("data", onData);
          process.stdout.write("\n");
          resolve(password);
          return;
        }
        if (character === "\u007f") password = password.slice(0, -1);
        else password += character;
      }
    };
    process.stdout.write("Admin password (input hidden): ");
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.on("data", onData);
  });
}

try {
  const password = await readPassword();
  process.stdout.write(`${hashAdminPassword(password)}\n`);
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : "Unable to hash password"}\n`);
  process.exitCode = 1;
}
