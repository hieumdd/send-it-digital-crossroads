import { getSecret } from '../secret-manager/secret-manager.service';

import axios from 'axios';

export type GetCampaignIdsOptions = { start: string; end: string };

type GetCampaignInfosResponse = { campaigns_info: { campaign_id: number }[] };

export const getCampaignIds = async ({ start, end }: GetCampaignIdsOptions) => {
    const key = await getSecret('crossroads-api-key');

    return axios
        .request<GetCampaignInfosResponse>({
            url: 'https://crossroads.domainactive.com/api/v2/get-campaigns-info',
            params: { key, 'start-date': start, 'end-date': end },
        })
        .then(({ data }) => data)
        .then((data) => data.campaigns_info.map(({ campaign_id }) => campaign_id));
};
