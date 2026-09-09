import { cp, lstat, rm } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

const source = path.resolve(fileURLToPath(new URL("../../groceries-client/build/", import.meta.url)));
const destination = path.resolve(fileURLToPath(new URL("../www/", import.meta.url)));

try {
  const sourceInfo = await lstat(source);

  if (sourceInfo.isSymbolicLink() || !sourceInfo.isDirectory()) {
    throw new Error("The client build must be a real directory, not a symlink.");
  }

  const indexInfo = await lstat(path.join(source, "index.html"));

  if (!indexInfo.isFile()) {
    throw new Error("The client build must contain a regular index.html file.");
  }

  const destinationInfo = await lstat(destination).catch((error) => {
    if (error.code === "ENOENT") {
      return null;
    }

    throw error;
  });

  if (destinationInfo && (destinationInfo.isSymbolicLink() || !destinationInfo.isDirectory())) {
    throw new Error("The www destination must be a real directory, not a symlink or file.");
  }

  await rm(destination, { recursive: true, force: true });
  await cp(source, destination, { recursive: true });
  process.stdout.write("Copied the existing client build into groceries-ios/www.\n");
} catch (error) {
  process.stderr.write(`Unable to copy the client build: ${error.message}\n`);
  process.stderr.write("Build groceries-client with the production API before running npm run copy:web.\n");
  process.exitCode = 1;
}
