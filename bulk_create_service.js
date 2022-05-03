/*
  Bulk create service script
*/

const fs = require('fs');
const csv = require('csv-parser');
const commander = require('commander');
const pdjs = require('@pagerduty/pdjs');

// API key
require('dotenv').config();
const token = process.env.PAGERDUTY_API_KEY || 'UNSET';
if (token === 'UNSET') {
  console.error('API key required. Set PAGERDUTY_API_KEY in .env file in your local repo root directory. This file is gitignored.');
  process.exit(1);
}
const pd = pdjs.api({token: token});

// CLI
commander
  .requiredOption('-e, --escalation_policy <id>', 'Common escalation policy id for the new services.')
  .requiredOption('-f, --file <path-to-csv-file>', 'CSV file with service definitions.')
  .parse(process.argv);

const options = commander.opts();
const csv_file = options.file;
const escalation_policy_id = options.escalation_policy;

// CSV
const rows = [];
fs.createReadStream(csv_file)
  .on('error', (error) => {
    console.error(`Unable to read input file. Please check path and name. - ${error}`);
    process.exit(1);
  })
  .pipe(csv())
  .on('data', (data) => rows.push(data))
  .on('end', () => {
    const requests = [];
    console.log(`Creating ${rows.length} services`);

    rows.forEach(row => {
      let body = {
        service: {
          type: row.type,
          name: row.name,
          description: row.description,
          auto_resolve_timeout: row.auto_resolve_timeout,
          escalation_policy: {
            id: escalation_policy_id,
            type: 'escalation_policy_reference'
          }
        }
      };
      let request = pd.post('/services', { data: body }).catch(console.error);
      process.stdout.write('.');
      requests.push(request);
    });

    Promise.allSettled(requests)
    .then(responses => {
      const results = responses
        .filter(response => response.status === 'fulfilled')
        .map(response => response.value.data);

      const results_json = JSON.stringify(results, null, 2);
      const output_file = `${__dirname}/output/services_${new Date().toISOString()}.json`;

      fs.writeFile(output_file, results_json, 'utf8', function (err) {
        if (err) return console.error(err);
        console.log(`\nCheck ${output_file} for processed results`);
      });
    });
  });
