import { chromium } from 'playwright';

export const initializeBrowser = async () => {
    const browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();

    return { browser, context, page };
};

type ScrapeCampaignNumberOptions = {
    campaignIds: number[];
    start: string;
    end: string;
};

type LoadApiResponse = {
    rows: {
        campaign_number: string;
        ctr: number;
        filtered_visitors: number;
        fraud_score: number;
        lander_searches: number;
        publisher_revenue: number;
        revenue_events: number;
        rpc: number;
        rpm: number;
        rpv: number;
        visitors: number;
        volume_by_visitors: number;
    }[];
};

export const scrapeCampaignNumber = async (options: ScrapeCampaignNumberOptions) => {
    const { start, end, campaignIds } = options;

    const { browser, page } = await initializeBrowser();

    await page.goto('https://crossroads.domainactive.com/docs#instant-api-get-campaigns-info');
    await page.locator('#usernameInput').fill(process.env.CROSSROAD_USERNAME || '');
    await page.locator('#passwordInput').fill(process.env.CROSSROAD_PASSWROD || '');
    await page.locator('button[type=submit]').click();

    await page.waitForTimeout(10_000);

    const results = await page.evaluate(
        async ({ start, end, campaignIds }) => {
            const responses = campaignIds.map(async (campaignId) => {
                const url = `https://crossroads.domainactive.com/admin/trafficguard/load/campaign/${campaignId}/campaign_number/?start_date=${start}&end_date=${end}`;

                return fetch(url, { credentials: 'include' })
                    .then((response) => response.json() as Promise<LoadApiResponse>)
                    .then((result) => {
                        return result.rows.map((row) => ({
                            ...row,
                            campaign_id: campaignId,
                            datetime: start,
                        }));
                    });
            });
            return Promise.all(responses);
        },
        { start, end, campaignIds },
    );

    await browser.close();

    return results.flat();
};
