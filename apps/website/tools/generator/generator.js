#!/usr/bin/env node

import path from "path";
import { allFormats, getLastWord, print, promptBoolean } from "../utils/index.js";
import { generateFile, appendToIndex, generateJson, generateStylesheet } from "./handle-file.js";
import { serviceTemplate, componentTemplate, viewTemplate, htmlTemplate } from "./templates/index.js";

// Constants and Setup
const [, , rawType, rawFullPath] = process.argv;

if (!rawType || !rawFullPath) {
  showUsageAndExit("Missing arguments.");
}

const type = allFormats(rawType);
const fullPath = allFormats(rawFullPath);
const name = allFormats(getLastWord(fullPath.kebab));
const targetPath = path.join('src', 'app', `${type.kebab}s/${fullPath.kebab}`);

// Creator Mapping
const creators = {
  service: (name, targetPath) => {
    const suffix = 'service';
    print.section(`Creating service: ${name.capitalized}`);
    try {
      generateFile({ name, targetPath, templateFn: serviceTemplate, suffix });
      appendToIndex({ name, targetPath, suffix });
    } catch (err) {
      handleError("Failed to generate service", err);
    }
  },
  component: async (name, targetPath) => {
    const suffix = 'component';
    print.section(`Creating component: ${name.capitalized}`);
    const doCreateStylesheet = await promptBoolean('Create stylesheet ?');
    
    try {
      generateFile({ name, targetPath, templateFn: componentTemplate, suffix });
      generateFile({ name, targetPath, templateFn: htmlTemplate, suffix, extension: 'html' });
      generateJson({ targetPath, name });
      if (doCreateStylesheet) generateStylesheet({ name, suffix });
      appendToIndex({ name, targetPath, suffix });
    } catch (err) {
      handleError("Failed to generate component", err);
    }
  },
  view: async (name, targetPath) => {
    const suffix = 'view';
    print.section(`Creating view: ${name.capitalized}`);
    const doCreateStylesheet = await promptBoolean('Create stylesheet ?');

    try {
      generateFile({ name, targetPath, templateFn: viewTemplate, suffix });
      generateFile({ name, targetPath, templateFn: htmlTemplate, suffix, extension: 'html' });
      generateJson({ targetPath, name });
      if (doCreateStylesheet) generateStylesheet({ name, suffix });
      appendToIndex({name, targetPath, suffix });
    } catch (err) {
      handleError("Failed to generate view", err);
    }
  },
};

// Main Execution
const create = creators[type.kebab];

if (create) {
  await create(name, targetPath);
  print.boldSuccess(`\n${type.capitalized} ${name.capitalized} has been generated.\n`)
} else {
  showUsageAndExit(`Unsupported type: '${type.kebab}'`);
}

// Helper Functions
function showUsageAndExit(message) {
  print.boldError(`\n❌ ${message}`);
  print.boldError("Usage: npm run generate <type> <path>");
  print.boldError(`Supported types: ${Object.keys(creators).join(", ")}`);
  process.exit(1);
}

function handleError(context, error) {
  print.boldError(`\n❌ ${context}`);
  print.boldError(error instanceof Error ? error.message : error);
  process.exit(1);
}
