import express, { RequestHandler } from 'express';
import bodyParser from 'body-parser';

import { runPipeline } from './pipeline/pipeline.service';
import { Pipeline, DailyClickHash, HourlyClickHash } from './pipeline/pipeline.const';

const app = express();

app.use(bodyParser.json());

app.use(({ params, path, body }, _, next) => {
    console.log(JSON.stringify({ path, params, body }));
    next();
});

const controllerFactory = (pipeline: Pipeline): RequestHandler => {
    return ({ body }, res) => {
        pipeline.validationSchema
            .validateAsync(body)
            .then((options) => {
                runPipeline(pipeline, options)
                    .then((result) => res.status(200).json({ result }))
                    .catch((error) => {
                        console.log(error);
                        console.log(JSON.stringify({ error }));
                        res.status(500).json({ error });
                    });
            })
            .catch((error) => {
                console.log(JSON.stringify({ error }));
                res.status(400).json({ error });
            });
    };
};

app.post('/daily', controllerFactory(DailyClickHash));

app.post('/hourly', controllerFactory(HourlyClickHash));

app.listen(8080);
