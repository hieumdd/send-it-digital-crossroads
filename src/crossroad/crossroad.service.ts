import axios from 'axios';

export type GetCampaignIdsOptions = { start: string; end: string };

type GetCampaignInfosResponse = { campaigns_info: { campaign_id: number }[] };

export const getCampaignIds = async ({ start, end }: GetCampaignIdsOptions) => {
    return axios
        .request<GetCampaignInfosResponse>({
            url: 'https://crossroads.domainactive.com/api/v2/get-campaigns-info',
            params: {
                key: process.env.CROSSROAD_API_KEY,
                'start-date': start,
                'end-date': end,
            },
        })
        .then(({ data }) => data)
        .then((data) => data.campaigns_info.map(({ campaign_id }) => campaign_id));
};
