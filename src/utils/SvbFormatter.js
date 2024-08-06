class SvbFormatter {
    static numeric (value, precision, nullswap = null) {
        if (value !== null && value !== undefined && value !== 'Infinity') {
            const response = String(value).replace(',', '.').replaceAll(' ', '');
            const splited = response.split('.');
            const prefix = String(value).indexOf('-') >= 0 ? '-' : '';
            const sides = {
                left:  splited[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') || `${prefix}0`,
                right: splited[1] ? `${splited[1]}0000`.substring(0, precision) : '0'.repeat(precision)
            };

            if ((nullswap !== null && nullswap !== undefined) && Number(value) === 0) {
                return nullswap;
            }

            return `${sides.left}${sides.right ? `.${sides.right}` : ''}`;
        }

        return (nullswap === null || nullswap === undefined) ? '0.00' : nullswap;
    }

    static date (value) {
        if (value) {
            const date = new Date(value);
            const dateObject = {
                day:   date.getDate().toString().padStart(2, '0'),
                month: (date.getMonth() + 1).toString().padStart(2, '0'),
                year:  date.getFullYear().toString().padStart(4, '0')
            };

            return `${dateObject.day}.${dateObject.month}.${dateObject.year}`;
        }

        return value;
    }

    static sqlDate (value) {
        if (value) {
            const date = new Date(value);
            const dateObject = {
                day:   date.getDate().toString().padStart(2, '0'),
                month: (date.getMonth() + 1).toString().padStart(2, '0'),
                year:  date.getFullYear().toString().padStart(4, '0')
            };

            return `${dateObject.year}-${dateObject.month}-${dateObject.day}`;
        }

        return value;
    }

    static timestamp (value) {
        if (value) {
            const date = new Date(value);
            const dateObject = {
                day:    date.getDate().toString().padStart(2, '0'),
                month:  (date.getMonth() + 1).toString().padStart(2, '0'),
                year:   date.getFullYear().toString().padStart(4, '0'),
                hour:   date.getHours().toString().padStart(2, '0'),
                minute: date.getMinutes().toString().padStart(2, '0'),
                second: date.getSeconds().toString().padStart(2, '0')
            };

            return `${dateObject.day}.${dateObject.month}.${dateObject.year} ${
                dateObject.hour}:${dateObject.minute}:${dateObject.second}`;
        }

        return value;
    }

    static sqlTimestamp (value) {
        if (value) {
            const date = new Date(value);
            const dateObject = {
                day:    date.getDate().toString().padStart(2, '0'),
                month:  (date.getMonth() + 1).toString().padStart(2, '0'),
                year:   date.getFullYear().toString().padStart(4, '0'),
                hour:   date.getHours().toString().padStart(2, '0'),
                minute: date.getMinutes().toString().padStart(2, '0'),
                second: date.getSeconds().toString().padStart(2, '0')
            };

            return `${dateObject.year}-${dateObject.month}-${dateObject.day} ${
                dateObject.hour}:${dateObject.minute}:${dateObject.second}`;
        }

        return value;
    }

    static boolean (value) {
        if (value !== null && value !== undefined) {
            if (value === true) {
                return '<i class="fa-solid fa-check"></i>';
            }

            return '<i class="fa-solid fa-xmark"></i>';
        }

        return value;
    }

    static textarea (value) {
        if (value) {
            return value.replaceAll('\n', '<br>');
        }

        return value;
    }

    static catalog (value) { return value.r; }

    static text (value) { return value; }
}

export default SvbFormatter;
