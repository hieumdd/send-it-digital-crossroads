import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Joi from 'joi';

dayjs.extend(utc);

import { GetCampaignIdsOptions } from '../crossroads/crossroads.service';
import { RunPipelineConfig } from '../pipeline/pipeline.service';

export type Pipeline = RunPipelineConfig & { validationSchema: Joi.Schema };

export const DailyClickHash: Pipeline = {
    validationSchema: Joi.object<GetCampaignIdsOptions>({
        start: Joi.string().default(dayjs.utc().subtract(3, 'day').format('YYYY-MM-DD')),
        end: Joi.string().default(dayjs.utc().format('YYYY-MM-DD')),
    }),
    table: 'campaigns_number',
    date: (date) => ({ date: date.format('YYYY-MM-DD') }),
    filename: (date) => `campaigns-number/campaign_number_${date.format('YYYYMMDD')}.json`,
};

export const HourlyClickHash: Pipeline = {
    validationSchema: Joi.object<GetCampaignIdsOptions>({
        start: Joi.string().default(dayjs.utc().format('YYYY-MM-DD')),
        end: Joi.string().default(dayjs.utc().format('YYYY-MM-DD')),
    }),
    table: 'campaigns_number_hourly',
    date: (date) => ({ datetime: date.format('YYYY-MM-DD HH:mm:ss') }),
    filename: (date) => `campaigns-number-hourly/campaign_number_${date.format('YYYYMMDDHH')}.json`,
};
