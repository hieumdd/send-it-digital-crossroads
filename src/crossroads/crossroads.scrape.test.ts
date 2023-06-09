import { getCampaignIds } from './crossroads.service';
import { scrapeCampaignNumber } from './crossroads.scrape';

it('scrape-campaign-number', async () => {
    const options = {
        start: '2023-05-01',
        end: '2023-05-01',
    };
    const campaignIds = await getCampaignIds(options);

    return scrapeCampaignNumber({ ...options, campaignIds }).then((results) => {
        console.log(results);
        expect(results).toBeDefined();
    });
});
