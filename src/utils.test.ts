import { createDateRange } from './utils';

it('create-date-range', () => {
    const dates = createDateRange({ start: '2023-05-01', end: '2023-05-10' });
    expect(dates).toBeDefined();

    const urls = dates.map((date) => {
        const url = new URL(
            `https://crossroads.domainactive.com/admin/trafficguard/load/campaign/123/campaign_number`,
        );
        url.searchParams.set('start_date', date.format('YYYY-MM-DD'));
        url.searchParams.set('end_date', date.format('YYYY-MM-DD'));
        return url.toString();
    });

    console.log(urls);
});
