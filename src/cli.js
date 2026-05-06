#!/usr/bin/env node

'use strict';

const path = require('path');
const { loadEnvFile, loadEnvFiles } = require('./loader');
const { diffEnvs, isClean } = require('./diff');
const { validateAll } = require('./validator');
const { formatValidation, formatDiff, formatSnapshotDiff } = require('./reporter');
const { saveSnapshot, loadLatestSnapshot, listSnapshots } = require('./snapshot');
const { diffAgainstSnapshot } = require('./snapshotDiff');

const [,, command, ...args] = process.argv;

function resolveFile(filePath) {
  return path.resolve(process.cwd(), filePath);
}

function cmdDiff() {
  const [fileA, fileB] = args;
  if (!fileA || !fileB) {
    console.error('Usage: envguard diff <fileA> <fileB>');
    process.exit(1);
  }
  const envA = loadEnvFile(resolveFile(fileA));
  const envB = loadEnvFile(resolveFile(fileB));
  const result = diffEnvs(envA, envB);
  console.log(formatDiff(result, fileA, fileB));
  process.exit(isClean(result) ? 0 : 1);
}

function cmdValidate() {
  const [envFile, schemaFile] = args;
  if (!envFile || !schemaFile) {
    console.error('Usage: envguard validate <envFile> <schemaFile>');
    process.exit(1);
  }
  const env = loadEnvFile(resolveFile(envFile));
  const schema = require(resolveFile(schemaFile));
  const results = validateAll(env, schema);
  console.log(formatValidation(results, envFile));
  const hasErrors = results.some(r => !r.valid);
  process.exit(hasErrors ? 1 : 0);
}

function cmdSnapshot() {
  const [subCmd, envFile, tag] = args;
  if (subCmd === 'save') {
    if (!envFile) {
      console.error('Usage: envguard snapshot save <envFile> [tag]');
      process.exit(1);
    }
    const env = loadEnvFile(resolveFile(envFile));
    const snapshot = saveSnapshot(env, tag || envFile);
    console.log(`Snapshot saved: ${snapshot.id}`);
  } else if (subCmd === 'diff') {
    if (!envFile) {
      console.error('Usage: envguard snapshot diff <envFile>');
      process.exit(1);
    }
    const env = loadEnvFile(resolveFile(envFile));
    const latest = loadLatestSnapshot(envFile);
    if (!latest) {
      console.error('No snapshot found for', envFile);
      process.exit(1);
    }
    const result = diffAgainstSnapshot(env, latest);
    console.log(formatSnapshotDiff(result, latest));
  } else if (subCmd === 'list') {
    const snapshots = listSnapshots();
    if (snapshots.length === 0) {
      console.log('No snapshots found.');
    } else {
      snapshots.forEach(s => console.log(`  ${s.id}  ${s.tag}  ${s.createdAt}`));
    }
  } else {
    console.error('Usage: envguard snapshot <save|diff|list> ...');
    process.exit(1);
  }
}

switch (command) {
  case 'diff':     cmdDiff();     break;
  case 'validate': cmdValidate(); break;
  case 'snapshot': cmdSnapshot(); break;
  default:
    console.log('envguard <diff|validate|snapshot> [options]');
    process.exit(0);
}
