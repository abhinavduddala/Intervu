const fs = require('fs');
const path = require('path');
const db = require('../../config/db');
const { validateRecord } = require('./datasetValidator');
const { normalizeRecord } = require('./questionNormalizer');
const { seedQuestionsBatch } = require('./questionSeeder');

const runSeeder = async () => {
  const startTime = Date.now();

  // 1. Parse dataset argument
  const args = process.argv.slice(2);
  let datasetName = 'neetcode150'; // default
  for (const arg of args) {
    if (arg.startsWith('--dataset=')) {
      datasetName = arg.split('=')[1].trim();
    }
  }

  const datasetPath = path.resolve(__dirname, 'datasets', `${datasetName}.json`);
  console.log(`🔍 Loading dataset: ${datasetName} from ${datasetPath}...`);

  if (!fs.existsSync(datasetPath)) {
    console.error(`❌ Error: Dataset file not found at ${datasetPath}`);
    process.exit(1);
  }

  let questionsArray;
  try {
    const rawContent = fs.readFileSync(datasetPath, 'utf8');
    questionsArray = JSON.parse(rawContent);
  } catch (err) {
    console.error(`❌ Error parsing JSON dataset: ${err.message}`);
    process.exit(1);
  }

  if (!Array.isArray(questionsArray)) {
    console.error('❌ Error: Dataset JSON must be an array of questions.');
    process.exit(1);
  }

  console.log(`📋 Found ${questionsArray.length} questions in dataset. Fetching database context...`);

  let inserted = 0;
  let skipped = 0;
  let failed = 0;
  const failures = [];
  const toSeed = [];

  try {
    // 2. Fetch all topics and patterns from DB to build name-to-ID maps
    const topicsRes = await db.query('SELECT id, name FROM topics');
    const patternsRes = await db.query('SELECT id, name FROM patterns');
    const topicsMap = new Map(topicsRes.rows.map(row => [row.name.toLowerCase().trim(), row.id]));
    const patternsMap = new Map(patternsRes.rows.map(row => [row.name.toLowerCase().trim(), row.id]));

    // 3. Validate and Normalize each record
    for (let i = 0; i < questionsArray.length; i++) {
      const item = questionsArray[i];
      const recordNum = i + 1;

      // Run dataset validator
      const validationErrors = validateRecord(item, recordNum, topicsMap, patternsMap);

      if (validationErrors.length > 0) {
        failed++;
        failures.push({
          recordNum,
          title: item.title || `Record ${recordNum}`,
          reasons: validationErrors
        });
        continue;
      }

      // Normalize valid record
      const normalized = normalizeRecord(item);
      normalized._recordNum = recordNum; // Keep trace of original record index
      toSeed.push(normalized);
    }

    // 4. Batch seed valid records inside a database transaction
    if (toSeed.length > 0) {
      console.log(`🚀 Seeding ${toSeed.length} validated questions inside transaction...`);
      const seedResult = await seedQuestionsBatch(toSeed, topicsMap, patternsMap);
      inserted = seedResult.inserted;
      skipped = seedResult.skipped;
    } else {
      console.log('ℹ️ No valid questions found to seed.');
    }

    const durationSeconds = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n=======================================');
    console.log('Seeder Run Finished.');
    console.log('---------------------------------------');
    console.log(`Duration       : ${durationSeconds}s`);
    console.log(`Total Inserted : ${inserted}`);
    console.log(`Total Skipped  : ${skipped}`);
    console.log(`Total Failed   : ${failed}`);
    console.log('=======================================');

    if (failures.length > 0) {
      console.log('\n⚠️ Failed Records Details:');
      for (const f of failures) {
        console.log(`- [Record ${f.recordNum}] "${f.title}" failed:`);
        for (const reason of f.reasons) {
          console.log(`    • ${reason}`);
        }
      }
    }

  } catch (err) {
    console.error('💥 Database query execution error:', err);
    process.exit(1);
  } finally {
    // Terminate DB connection pool so script exits cleanly
    await db.pool.end();
  }
};

runSeeder();
