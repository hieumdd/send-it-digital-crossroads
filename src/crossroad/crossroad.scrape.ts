import playwright, { chromium } from 'playwright';

import { getSecret } from '../secret-manager/secret-manager.service';
import { createDateRange } from '../utils';

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

export type CampaignNumber = {
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
};

export type LoadApiResponse = { rows: CampaignNumber[] };

export type ScrapeCampaignNumberResult = CampaignNumber & {
    campaign_id: number;
    date: string;
};

export const scrapeCampaignNumber = async (options: ScrapeCampaignNumberOptions) => {
    const { start, end, campaignIds } = options;

    const [username, password] = await Promise.all([
        getSecret('crossroads-username'),
        getSecret('crossroads-password'),
    ]);

    const { browser, page } = await initializeBrowser();

    await page.goto('https://crossroads.domainactive.com/docs#instant-api-get-campaigns-info');
    await page.locator('#usernameInput').fill(username);
    await page.locator('#passwordInput').fill(password);
    await page.locator('button[type=submit]').click();

    try {
        await page.waitForSelector('a[href="/admin/trafficguard/?noforward=true"]', {
            timeout: 10_000,
        });

        const dates = createDateRange({ start, end }).map((date) => date.format('YYYY-MM-DD'));

        const results = await page
            .evaluate(
                async ({ dates, campaignIds }) => {
                    const responses = dates.flatMap((date) => {
                        return campaignIds.map(async (campaignId) => {
                            const url = new URL(
                                `https://crossroads.domainactive.com/admin/trafficguard/load/campaign/${campaignId}/campaign_number/`,
                            );
                            url.searchParams.set('start_date', date);
                            url.searchParams.set('end_date', date);

                            return fetch(url.toString(), { credentials: 'include' })
                                .then((response) => response.json() as Promise<LoadApiResponse>)
                                .then((result) => {
                                    return result.rows.map((row) => ({
                                        ...row,
                                        date,
                                        campaign_id: campaignId,
                                    }));
                                });
                        });
                    });
                    return Promise.all(responses);
                },
                { dates, campaignIds },
            )
            .then((results) => results.flat());

        await browser.close();

        return results;
    } catch (error) {
        if (error instanceof playwright.errors.TimeoutError) {
            console.log(JSON.stringify({ severity: 'WARN', message: 'captcha' }));
        }

        await browser.close();

        return Promise.reject(error);
    }
};
