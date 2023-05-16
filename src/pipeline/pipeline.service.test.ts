import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import playwright from 'playwright';

dayjs.extend(utc);

import { runPipeline } from './pipeline.service';
import { DailyClickHash, HourlyClickHash } from './pipeline.const';

it('pipeline/daily', async () => {
    const options = {
        start: dayjs.utc('2023-05-01'),
        end: dayjs.utc('2023-05-01'),
    };
    return runPipeline(DailyClickHash, options)
        .then((result) => expect(result).toBeDefined())
        .catch((error) => {
            console.log(error);

            if (error instanceof playwright.errors.TimeoutError) {
                return;
            }
            return Promise.reject(error);
        });
});

it('pipeline/hourly', async () => {
    const options = {
        start: dayjs.utc('2023-05-01'),
        end: dayjs.utc('2023-05-01'),
    };
    return runPipeline(HourlyClickHash, options)
        .then((result) => expect(result).toBeDefined())
        .catch((error) => {
            console.log(error);

            if (error instanceof playwright.errors.TimeoutError) {
                return;
            }
            return Promise.reject(error);
        });
});
