#!/usr/bin/env node

import * as p from "@clack/prompts";
import { execSync } from "child_process";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync, existsSync, readdirSync, statSync, unlinkSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// === File System Utilities ===

function copyDir(src: string, dest: string): void {
  if (!existsSync(dest)) {
    mkdirSync(dest, { recursive: true });
  }
  
  const files = readdirSync(src);
  
  for (const file of files) {
    const srcPath = join(src, file);
    const destPath = join(dest, file);
    
    if (statSync(srcPath).isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

function handleGitignore(projectPath: string): void {
  const gitignoreTemplatePath = join(projectPath, "_gitignore");
  const gitignorePath = join(projectPath, ".gitignore");
  
  if (existsSync(gitignoreTemplatePath)) {
    copyFileSync(gitignoreTemplatePath, gitignorePath);
    // Remove the template file
    try {
      unlinkSync(gitignoreTemplatePath);
    } catch (error) {
      // Ignore if removal fails
    }
  }
}

function updatePackageJson(projectPath: string, projectName: string): void {
  const packageJsonPath = join(projectPath, "package.json");
  
  if (existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
    packageJson.name = projectName;
    writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
  }
}

// === Project Creation ===

function validateProjectName(projectName: string): void {
  if (existsSync(projectName)) {
    throw new Error(`Directory '${projectName}' already exists.`);
  }
}

function createProjectFromTemplate(projectName: string, templateDir: string): void {
  validateProjectName(projectName);
  
  mkdirSync(projectName, { recursive: true });
  copyDir(templateDir, projectName);
  handleGitignore(projectName);
  updatePackageJson(projectName, projectName);
}

async function installDependencies(projectName: string): Promise<void> {
  const installSpinner = p.spinner();
  installSpinner.start("Installing dependencies...");
  
  try {
    execSync("bun install", { stdio: "inherit", cwd: projectName });
    installSpinner.stop("Dependencies installed!");
  } catch (error) {
    installSpinner.stop("Failed to install dependencies. You can run 'bun install' manually.");
  }
}

// === User Input ===

async function getProjectName(): Promise<string> {
  const projectName = await p.text({
    message: "What is the name of your app?",
    placeholder: "my-super-app",
    defaultValue: "my-super-app",
  });

  if (p.isCancel(projectName)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return projectName;
}

async function shouldInstallDependencies(): Promise<boolean> {
  const shouldInstall = await p.confirm({
    message: "Install dependencies?",
    initialValue: true,
  });

  if (p.isCancel(shouldInstall)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return shouldInstall;
}

// === Main CLI Flow ===

async function main(): Promise<void> {
  // Welcome
  p.intro("create-ts-router-vite");
  p.note(
    "A CLI for creating web applications with Tanstack Router and Vite",
    "Overview"
  );

  // Get user input
  const projectName = await getProjectName();
  const shouldInstallDeps = await shouldInstallDependencies();

  // Create project
  try {
    const spinner = p.spinner();
    spinner.start(`Creating project ${projectName}...`);

    const templateDir = join(__dirname, "template");
    createProjectFromTemplate(projectName, templateDir);
    
    spinner.stop(`Project '${projectName}' created successfully!`);
    
    // Install dependencies if requested
    if (shouldInstallDeps) {
      await installDependencies(projectName);
    }
    
  } catch (error) {
    p.cancel(`Failed to create project: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
  
  // Success
  p.note(
    `cd ${projectName}\nbun run index.js`,
    "Next steps"
  );
  
  p.outro(`🎉 You're all set! Navigate to '${projectName}' and start coding!`);
}

// === Entry Point ===

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
