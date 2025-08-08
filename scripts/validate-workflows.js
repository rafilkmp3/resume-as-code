#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// GitHub Actions schema from SchemaStore
const GITHUB_ACTIONS_SCHEMA_URL =
  'https://json.schemastore.org/github-workflow.json';

async function fetchSchema() {
  try {
    const response = await fetch(GITHUB_ACTIONS_SCHEMA_URL);
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch GitHub Actions schema:', error.message);
    return null;
  }
}

async function validateWorkflow(filePath) {
  console.log(`🔍 Validating workflow: ${filePath}`);

  try {
    // Read and parse YAML
    const yamlContent = fs.readFileSync(filePath, 'utf8');
    const workflowData = yaml.load(yamlContent);

    // Basic YAML syntax check passed if we get here
    console.log('  ✅ YAML syntax is valid');

    // Fetch and validate against GitHub Actions schema
    const schema = await fetchSchema();
    if (!schema) {
      console.log('  ⚠️  Schema validation skipped (could not fetch schema)');
      return true;
    }

    const ajv = new Ajv({ allErrors: true, verbose: true });
    addFormats(ajv);

    const validate = ajv.compile(schema);
    const valid = validate(workflowData);

    if (valid) {
      console.log('  ✅ GitHub Actions schema validation passed');
      return true;
    } else {
      console.log('  ❌ GitHub Actions schema validation failed:');
      validate.errors.forEach(error => {
        console.log(`    - ${error.instancePath || 'root'}: ${error.message}`);
        if (error.data !== undefined) {
          console.log(`      Got: ${JSON.stringify(error.data)}`);
        }
      });
      return false;
    }
  } catch (error) {
    console.log(`  ❌ YAML parsing failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🔄 GitHub Actions Workflow Validator');
  console.log('===================================');

  const workflowsDir = path.join(process.cwd(), '.github', 'workflows');

  if (!fs.existsSync(workflowsDir)) {
    console.log('❌ No .github/workflows directory found');
    process.exit(1);
  }

  const workflowFiles = fs
    .readdirSync(workflowsDir)
    .filter(file => file.endsWith('.yml') || file.endsWith('.yaml'))
    .map(file => path.join(workflowsDir, file));

  if (workflowFiles.length === 0) {
    console.log('❌ No workflow files found');
    process.exit(1);
  }

  let allValid = true;

  for (const file of workflowFiles) {
    const isValid = await validateWorkflow(file);
    if (!isValid) {
      allValid = false;
    }
    console.log('');
  }

  if (allValid) {
    console.log('🎉 All workflow files are valid!');
    process.exit(0);
  } else {
    console.log('❌ Some workflow files have validation errors');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
