import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import Joi from 'joi';

dayjs.extend(utc);

import { GetCampaignIdsOptions } from '../crossroad/crossroad.service';

export const DailyClickHash = {
    validationSchema: Joi.object<GetCampaignIdsOptions>({
        start: Joi.string().default(dayjs.utc().subtract(3, 'day').format('YYYY-MM-DD')),
        end: Joi.string().default(dayjs.utc().format('YYYY-MM-DD')),
    }),
    table: 'campaigns_number',
};

export const HourlyClickHash = {
    validationSchema: Joi.object<GetCampaignIdsOptions>({
        start: Joi.string().default(dayjs.utc().format('YYYY-MM-DD')),
        end: Joi.string().default(dayjs.utc().format('YYYY-MM-DD')),
    }),
    table: 'campaigns_number_hourly',
};
