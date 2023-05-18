import Joi from 'joi';
import { Dayjs } from 'dayjs';

import { getCampaignIds } from '../crossroads/crossroads.service';
import { ScrapeCampaignNumberResult, scrapeCampaignNumber } from '../crossroads/crossroads.scrape';
import { writeFile } from '../cloud-storage/cloud-storage';

export type RunPipelineConfig = {
    table: string;
    date: (date: Dayjs) => { [key: string]: string };
    filename: (date: Dayjs) => string;
};
export type RunPipelineOptions = { start: Dayjs; end: Dayjs };

export const runPipeline = async (config: RunPipelineConfig, options: RunPipelineOptions) => {
    const serviceOptions = {
        start: options.start.format('YYYY-MM-DD'),
        end: options.end.format('YYYY-MM-DD'),
    };

    const schema = Joi.object<ScrapeCampaignNumberResult>({
        campaign_id: Joi.number().unsafe(),
        campaign_number: Joi.string().allow(null).empty(''),
        ctr: Joi.number().unsafe(),
        date: Joi.string(),
        datetime: Joi.string(),
        filtered_visitors: Joi.number().unsafe(),
        fraud_score: Joi.number().unsafe(),
        lander_searches: Joi.number().unsafe(),
        publisher_revenue: Joi.number().unsafe(),
        revenue_events: Joi.number().unsafe(),
        rpc: Joi.number().unsafe(),
        rpm: Joi.number().unsafe(),
        rpv: Joi.number().unsafe(),
        visitors: Joi.number().unsafe(),
        volume_by_visitors: Joi.number().unsafe(),
    });

    const results = await getCampaignIds(serviceOptions).then((campaignIds) =>
        scrapeCampaignNumber({ ...serviceOptions, campaignIds }),
    );

    return Promise.all(
        results.map(([date, rows]) => {
            return writeFile(
                rows.map((row) => Joi.attempt({ ...row, ...config.date(date) }, schema)),
                config.filename(date),
            );
        }),
    );
};
