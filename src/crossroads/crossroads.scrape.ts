import playwright, { firefox } from 'playwright';

import { getSecret } from '../secret-manager/secret-manager.service';
import { createDateRange } from '../utils';
import { Dayjs } from 'dayjs';

export const initializeBrowser = async () => {
    const browser = await firefox.launch({
        headless: process.env.NODE_ENV === 'production',
        args: [
            '--disable-gpu',
            '--disable-dev-shm-usage',
            '--disable-setuid-sandbox',
            '--no-sandbox',
        ],
    });
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (X11; Linux i686; rv:109.0) Gecko/20100101 Firefox/113.0',
    });
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
    datetime: string;
};

export const scrapeCampaignNumber = async (options: ScrapeCampaignNumberOptions) => {
    const { start, end, campaignIds } = options;

    const [username, password] = await Promise.all([
        getSecret('crossroads-username'),
        getSecret('crossroads-password'),
    ]);

    const { browser, page } = await initializeBrowser();

    await page.goto('https://crossroads.domainactive.com/login');
    await page.locator('input#usernameInput').fill(username);
    await page.locator('input#passwordInput').fill(password);
    await page.locator('button[type=submit]').click();

    const getCampaignNumber = async (date: Dayjs) => {
        return page
            .evaluate(
                ({ date, campaignIds }) => {
                    const responses = campaignIds.map(async (campaignId) => {
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
                                    campaign_id: campaignId,
                                }));
                            });
                    });
                    return Promise.all(responses);
                },
                { date: date.format('YYYY-MM-DD'), campaignIds },
            )
            .then((results) => [date, results.flat()] as const);
    };

    try {
        await page.waitForSelector('a[href="/admin/trafficguard/?noforward=true"]', {
            timeout: 20_000,
        });

        const results = await Promise.all(
            createDateRange({ start, end }).map((date) => getCampaignNumber(date)),
        );

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
