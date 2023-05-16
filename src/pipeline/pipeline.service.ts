import Joi from 'joi';

import { load } from '../bigquery/bigquery.service';
import { GetCampaignIdsOptions, getCampaignIds } from '../crossroad/crossroad.service';
import { ScrapeCampaignNumberResult, scrapeCampaignNumber } from '../crossroad/crossroad.scrape';

type RunPipelineOptions = GetCampaignIdsOptions & { table: string };

export const runPipeline = async (options: RunPipelineOptions) => {
    const schema = Joi.object<ScrapeCampaignNumberResult>({
        campaign_id: Joi.number().unsafe(),
        campaign_number: Joi.string().allow(null).empty(''),
        ctr: Joi.number().unsafe(),
        date: Joi.string(),
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

    return getCampaignIds(options)
        .then((campaignIds) => scrapeCampaignNumber({ ...options, campaignIds }))
        .then((rows) => rows.map((row) => Joi.attempt(row, schema)))
        .then((rows) => {
            return load(rows, {
                table: options.table,
                schema: [
                    { name: 'campaign_id', type: 'INTEGER' },
                    { name: 'campaign_number', type: 'STRING' },
                    { name: 'ctr', type: 'FLOAT' },
                    { name: 'date', type: 'DATE' },
                    { name: 'filtered_visitors', type: 'FLOAT' },
                    { name: 'fraud_score', type: 'INTEGER' },
                    { name: 'lander_searches', type: 'INTEGER' },
                    { name: 'publisher_revenue', type: 'FLOAT' },
                    { name: 'revenue_events', type: 'INTEGER' },
                    { name: 'rpc', type: 'FLOAT' },
                    { name: 'rpm', type: 'FLOAT' },
                    { name: 'rpv', type: 'FLOAT' },
                    { name: 'visitors', type: 'INTEGER' },
                    { name: 'volume_by_visitors', type: 'FLOAT' },
                ],
            });
        });
};
