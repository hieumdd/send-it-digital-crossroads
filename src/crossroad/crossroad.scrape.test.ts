import { getCampaignIds } from './crossroad.service';
import { scrapeCampaignNumber } from './crossroad.scrape';

it('scrape-campaign-number', async () => {
    const options = {
        start: '2023-05-01',
        end: '2023-05-03',
    };
    const campaignIds = await getCampaignIds(options);

    return scrapeCampaignNumber({ ...options, campaignIds }).then((results) => {
        results.forEach((result) => {
            console.log(result);
            expect(result).toBeDefined();
        });
    });
});
