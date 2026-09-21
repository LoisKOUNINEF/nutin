#!/usr/bin/env node

import path from "path";
import { allFormats, getLastWord, print, promptBoolean, errorExit } from "../utils/index.js";
import { generateFile, appendToIndex, generateLocalesJson } from "./handle-file.js";
import { serviceTemplate, componentTemplate, viewTemplate, htmlTemplate, scssTemplate, testTemplate } from "./templates/index.js";
import nutinConfig from "../../nutin.config.js";

// Constants and Setup
const [, , rawType, rawFullPath] = process.argv;

if (!rawType || !rawFullPath) {
  showUsageAndExit("Missing arguments.");
  process.exit(1);
}

const type = allFormats(rawType);
const fullPath = allFormats(rawFullPath);
const name = allFormats(getLastWord(fullPath.kebab));
const targetPath = path.join('src', 'app', `${type.kebab}s/${fullPath.kebab}`);

// Creator Mapping
const creators = {
  service: async (name, targetPath) => {
    const suffix = 'service';
    print.section(`Generating service: ${name.capitalized}`);
    try {
      generateFile({ name, targetPath, templateFn: serviceTemplate, suffix: suffix });
      appendToIndex({ name, targetPath, suffix: suffix });
      await generateTest({ name, targetPath, suffix: suffix });
    } catch (err) {
      handleError("Failed to generate service", err);
    }
  },
  component: async (name, targetPath) => {
    const suffix = 'component';
    print.section(`Generating component: ${name.capitalized}`);

    try {
      generateFile({ name, targetPath, templateFn: componentTemplate, suffix: suffix });
      generateFile({ name, targetPath, templateFn: htmlTemplate, suffix: suffix, extension: 'html' });
      generateFile({ name, targetPath, templateFn: scssTemplate, suffix: suffix, extension: 'scss' });
      await generateLocales({ targetPath, name, isView: false });
      appendToIndex({ name, targetPath, suffix: suffix });
      await generateTest({ name, targetPath, suffix });
    } catch (err) {
      handleError("Failed to generate component", err);
    }
  },
  view: async (name, targetPath) => {
    const suffix = 'view';
    print.section(`Generating view: ${name.capitalized}`);

    try {
      generateFile({ name, targetPath, templateFn: viewTemplate, suffix: suffix });
      generateFile({ name, targetPath, templateFn: htmlTemplate, suffix: suffix, extension: 'html' });
      generateFile({ name, targetPath, templateFn: scssTemplate, suffix: suffix, extension: 'scss' });
      await generateLocales({ targetPath, name, isView: true });
      appendToIndex({ name, targetPath, suffix: suffix });
      await generateTest({ name, targetPath, suffix });
    } catch (err) {
      handleError("Failed to generate view", err);
    }
  },
};

// Main Execution
const create = creators[type.kebab];

if (create) {
  await create(name, targetPath);
  print.boldSuccess(`\n${type.capitalized} ${name.capitalized} generated in ${targetPath}.\n`)
} else {
  showUsageAndExit(`Unsupported type: '${type.kebab}'`);
  process.exit(1);
}

// Helper Functions
async function generateTest({ targetPath, name, suffix }) {
  if (nutinConfig.testinNutin.includeApp) generateFile({ targetPath, name, templateFn: testTemplate, extension: 'test.js', suffix: suffix });
}

async function generateLocales({ targetPath, name, isView }) {
  if (nutinConfig.i18n) generateLocalesJson({ targetPath, name, isView });
}

function showUsageAndExit(message) {
  print.boldError(`\n${message}`);
  print.warn("Usage: npm run generate <type> <path>");
  print.warn(`Supported types: ${Object.keys(creators).join(", ")}`);
  process.exit(1);
}

function handleError(context, error) {
  errorExit(error, context);
}
