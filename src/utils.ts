import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

type CreateDataRangeOptions = {
    start: string;
    end: string;
};

export const createDateRange = ({ start, end }: CreateDataRangeOptions) => {
    const [startDate, endDate] = [dayjs.utc(start), dayjs.utc(end)];

    const _create = (date: Dayjs): Dayjs[] => {
        return date.isBefore(endDate) ? ([date, ..._create(date.add(1, 'day'))] as Dayjs[]) : [date];
    };

    return _create(startDate);
};
