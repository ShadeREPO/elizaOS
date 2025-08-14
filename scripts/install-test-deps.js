#!/usr/bin/env node

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const testDependencies = {
  '@cypress/react': '^9.0.1',
  '@cypress/vite-dev-server': '^6.0.3',
  '@testing-library/cypress': '^10.0.3',
  '@types/cypress': '^1.1.3',
  '@types/node': '^20.11.5',
  cypress: '^14.4.1',
};

function isInstalled(packageName) {
  try {
    const packageJsonPath = join(process.cwd(), 'package.json');
    if (existsSync(packageJsonPath)) {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
      return packageName in deps;
    }
  } catch (error) {
    // Silent fail, will install if error
  }
  return false;
}

async function installTestDependencies() {
  const missingDeps = Object.entries(testDependencies)
    .filter(([name]) => !isInstalled(name))
    .map(([name, version]) => `${name}@${version}`);

  if (missingDeps.length === 0) {
    console.log('✓ Test dependencies already installed');
    return;
  }

  console.log('Installing test dependencies...');
  try {
    // Try bun first, fallback to npm
    let success = false;
    
    if (typeof Bun !== 'undefined') {
      const proc = Bun.spawnSync(['bun', 'add', '-d', ...missingDeps], {
        stdout: 'inherit',
        stderr: 'inherit',
        cwd: process.cwd(),
      });
      success = proc.exitCode === 0;
    }
    
    if (!success) {
      // Fallback to npm
      const { spawn } = require('child_process');
      const proc = spawn('npm', ['install', '--save-dev', ...missingDeps], {
        stdio: 'inherit',
        cwd: process.cwd(),
        shell: true
      });
      
      await new Promise((resolve, reject) => {
        proc.on('close', (code) => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error(`npm install command failed with code ${code}`));
          }
        });
      });
    }
    
    console.log('✓ Test dependencies installed successfully');
  } catch (error) {
    console.error('Failed to install test dependencies:', error.message);
    process.exit(1);
  }
}

installTestDependencies().catch(console.error);
