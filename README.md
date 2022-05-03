# pagerduty
This repo contains a script that helps to bulk create PagerDuty services defined in a CSV file.
## Prerequisites
Git and Node.js v14 or higher.
## Setup
Clone the repo locally.
```bash
$ git clone https://github.com/shasum/pagerduty.git
```
Set PAGERDUTY_API_KEY in a `.env` file in your local repo root directory. This file is gitignored.
```
PAGERDUTY_API_KEY=your-api-key
```
## Dependencies
```bash
$ npm install
```
## Run
Pass in escalation policy id and services definition CSV file as command line arguments to the script.
```bash
$ node bulk_create_service.js --escalation_policy <escalation-policy-id> --file <path/to/services_input.csv>
```

The script writes the created service responses to a timestamped JSON file in the `/output` directory.

Example:
```
$ node bulk_create_service.js --escalation_policy PANXXXM --file ./tmp/services_input.csv
Creating 3 services
...
Check /Users/janani/projects/pagerduty/output/services_2022-05-03T01:20:39.516Z.json for processed results
```
