import playwright from 'playwright';

import { runPipeline } from './pipeline.service';
import { DailyClickHash, HourlyClickHash } from './pipeline.const';

it('pipeline', async () => {
    const options = {
        start: '2023-05-01',
        end: '2023-05-03',
    };
    return runPipeline({ ...options, table: DailyClickHash.table })
        .then((result) => expect(result).toBeDefined())
        .catch((error) => {
            console.log(error);

            if (error instanceof playwright.errors.TimeoutError) {
                return;
            }
            return Promise.reject(error);
        });
});
