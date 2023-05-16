import express from 'express';
import bodyParser from 'body-parser';

import { runPipeline } from './pipeline/pipeline.service';
import { DailyClickHash, HourlyClickHash } from './pipeline/pipeline.const';

const app = express();

app.use(bodyParser.json());

app.use(({ params, path, body }, _, next) => {
    console.log(JSON.stringify({ path, params, body }));
    next();
});

app.post('/daily', ({ body }, res) => {
    DailyClickHash.validationSchema
        .validateAsync(body)
        .then((options) => {
            runPipeline({ ...options, table: DailyClickHash.table })
                .then((result) => res.status(200).json({ result }))
                .catch((error) => {
                    console.log(JSON.stringify({ error }));
                    res.status(500).json({ error });
                });
        })
        .catch((error) => {
            console.log(JSON.stringify({ error }));
            res.status(400).json({ error });
        });
});

app.post('/hourly', ({ body }, res) => {
    HourlyClickHash.validationSchema
        .validateAsync(body)
        .then((options) => {
            runPipeline({ ...options, table: HourlyClickHash.table })
                .then((result) => res.status(200).json({ result }))
                .catch((error) => {
                    console.log(JSON.stringify({ error }));
                    res.status(500).json({ error });
                });
        })
        .catch((error) => {
            console.log(JSON.stringify({ error }));
            res.status(400).json({ error });
        });
});

app.listen(8080);
