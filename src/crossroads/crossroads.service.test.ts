import { getCampaignIds } from './crossroads.service';

it('get-campaign-ids', async () => {
    return getCampaignIds({ start: '2023-05-01', end: '2023-05-03' }).then((campaignIds) => {
        expect(campaignIds).toBeDefined();
    });
});
