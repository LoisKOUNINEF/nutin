#!/usr/bin/env node
/**
 npm run code-to-json -- SOURCE_FILE --output DEST_FILE
*/
const fs = require('fs');

function escapeWhitespace(str, options = {}) {
  const { spacesToTab = 2, convertSpacesToTabs = true } = options;
  
  let result = str;
  
  if (convertSpacesToTabs) {
    const spacePattern = new RegExp(`^( {${spacesToTab}})+`, 'gm');
    result = result.replace(spacePattern, (match) => {
      return '\\t'.repeat(match.length / spacesToTab);
    });
  }
  
  result = result.replace(/\t/g, '\\t');
  
  result = result.replace(/\n/g, '\\n');
  
  return result;
}

function replaceEscapedChars(str) {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '\\"');
}

function showHelp() {
  console.log(`
Usage: node escape-whitespace.js [options] <file>

Options:
  --spaces <n>        Number of spaces to convert to one tab (default: 2)
  --no-convert        Don't convert spaces to tabs, keep them as spaces
  --output <file>     Output file (default: stdout)
  --help, -h          Show this help message
`);
}

function parseArgs(args) {
  const options = {
    spacesToTab: 2,
    convertSpacesToTabs: true,
    inputFile: null,
    outputFile: null
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    switch (arg) {
      case '--help':
      case '-h':
        showHelp();
        process.exit(0);
      case '--spaces':
        const spaces = parseInt(args[i + 1]);
        if (isNaN(spaces) || spaces < 1) {
          console.error('Error: --spaces must be a positive number');
          process.exit(1);
        }
        options.spacesToTab = spaces;
        i++;
        break;
      case '--no-convert':
        options.convertSpacesToTabs = false;
        break;
      case '--output':
        if (!args[i + 1]) {
          console.error('Error: --output requires a filename');
          process.exit(1);
        }
        options.outputFile = args[i + 1];
        i++;
        break;
      default:
        if (arg.startsWith('--')) {
          console.error(`Error: Unknown option ${arg}`);
          process.exit(1);
        }
        if (!options.inputFile) {
          options.inputFile = arg;
        } else {
          console.error('Error: Multiple input files not supported');
          process.exit(1);
        }
    }
  }

  return options;
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 && process.stdin.isTTY) {
    showHelp();
    process.exit(1);
  }

  const options = parseArgs(args);
  
  let input = '';
  
  try {
    if (options.inputFile) {
      if (!fs.existsSync(options.inputFile)) {
        console.error(`Error: File '${options.inputFile}' not found`);
        process.exit(1);
      }
      input = fs.readFileSync(options.inputFile, 'utf8');
    } else {
      const chunks = [];
      for await (const chunk of process.stdin) {
        chunks.push(chunk);
      }
      input = Buffer.concat(chunks).toString('utf8');
    }

    let result = '';

    result = replaceEscapedChars(input);
    result = escapeWhitespace(result, {
      spacesToTab: options.spacesToTab,
      convertSpacesToTabs: options.convertSpacesToTabs
    });

    if (options.outputFile) {
      const output = `"content": "${result}"`;
      fs.writeFileSync(options.outputFile, output);
      console.log(`Output written to ${options.outputFile}`);
    } else {
      console.log(result);
    }

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { escapeWhitespace };