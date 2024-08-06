import SvbElement from './SvbElement';
import translations from '../utils/translations';
import WheelPicker from '../components/WheelPicker';

class SvbDatepicker extends SvbElement {
    constructor (options) {
        const date = options.date
            ? new Date(options.date)
            : new Date();

        super();

        this.state = {
            classList:      options.classList || '',
            today:          new Date(),
            showTimepicker: true || options.timepicker,
            selected:       {
                day:    date.getDate(),
                month:  date.getMonth(),
                year:   date.getFullYear(),
                hour:   date.getHours(),
                minute: date.getMinutes(),
                second: date.getSeconds()
            },
            calendarDays:  [],
            calendarYears: [],
            current:       {
                month: date.getMonth(),
                year:  date.getFullYear()
            }
        };

        this.init();

        return this.render();
    }

    init () {
        this.modal = SvbElement.create('div', null, 'svb-datepicker__modal datepicker-modal');
        this.component = SvbElement.create('div', null, `svbDatepicker ${this.state.classList}`);
        this.wrapper = SvbElement.create('div', null, 'svbDatepicker__wrapper');
        this.options = SvbElement.create('div', null, 'svbDatepicker__options');
        this.calendar = SvbElement.create('div', null, 'svbCalendar svbDatepicker__calendar');
        this.timepicker = SvbElement.create('div', null, 'svbTimepicker svbDatepicker__time');
        this.timeInputs = {
            hour: {
                max: 23
            },
            minute: {
                max: 59
            },
            second: {
                max: 59
            }
        };

        this.eventChange = () => {};
        this.eventTab = () => {};

        this.renderPres();
        this.renderControll();
        this.renderCalendar();

        this.defaultEvents();

        this.component.utilityObject = this;
    }

    changeCurrentMonth (k) {
        const date = new Date(this.state.current.year, this.state.current.month);

        date.setMonth(date.getMonth() + k);
        this.state.current.month = date.getMonth();
        this.state.current.year = date.getFullYear();
    }

    createDateCalendar () {
        const date = new Date(this.state.current.year, this.state.current.month);

        const getDay = (currentDate) => {
            let day = currentDate.getDay();

            if (day === 0) day = 7;

            return day - 1;
        };

        this.state.calendarDays = [];

        if (getDay(date) !== 0) {
            date.setDate(date.getDate() - getDay(date));

            while (date.getMonth() === SvbDatepicker.getPrevMonth(this.state.current.month)) {
                this.state.calendarDays.push({
                    current: false,
                    day:     date.getDate(),
                    month:   date.getMonth(),
                    year:    date.getFullYear()
                });

                date.setDate(date.getDate() + 1);
            }
        }

        while (date.getMonth() === this.state.current.month) {
            this.state.calendarDays.push({
                current: true,
                day:     date.getDate(),
                month:   date.getMonth(),
                year:    date.getFullYear()
            });

            date.setDate(date.getDate() + 1);
        }

        if (getDay(date) <= 6) {
            for (let i = getDay(date); i <= 6; i += 1) {
                this.state.calendarDays.push({
                    current: false,
                    day:     date.getDate(),
                    month:   date.getMonth(),
                    year:    date.getFullYear()
                });

                date.setDate(date.getDate() + 1);
            }
        }

        return this.state.calendarDays;
    }

    setDate (value = null) {
        if (value) {
            const date = new Date(value);

            this.state.selected = {
                day:    date.getDate(),
                month:  date.getMonth(),
                year:   date.getFullYear(),
                hour:   date.getHours(),
                minute: date.getMinutes(),
                second: date.getSeconds()
            };

            this.state.current = {
                month: date.getMonth(),
                year:  date.getFullYear()
            };
        }
    }

    selectTime () {
        console.log(1);
        this.eventChange({
            day:            String(this.state.selected.day).padStart(2, '0'),
            month:          String(this.state.selected.month + 1).padStart(2, '0'),
            year:           String(this.state.selected.year).padStart(4, '0'),
            hour:           String(this.state.selected.hour).padStart(2, '0'),
            minute:         String(this.state.selected.minute).padStart(2, '0'),
            second:         String(this.state.selected.second).padStart(2, '0'),
            hideDatepicker: false
        });
    }

    selectDay (isCurrent, newDate) {
        this.state.selected = {
            day:    newDate.day,
            month:  newDate.month,
            year:   newDate.year,
            hour:   newDate.hour,
            minute: newDate.minute,
            second: newDate.second
        };

        if (!isCurrent) {
            this.state.current.year = newDate.year;
            this.state.current.month = newDate.month;
        }

        this.renderCalendar();

        this.eventChange({
            day:            String(this.state.selected.day).padStart(2, '0'),
            month:          String(this.state.selected.month + 1).padStart(2, '0'),
            year:           String(this.state.selected.year).padStart(4, '0'),
            hour:           String(this.state.selected.hour).padStart(2, '0'),
            minute:         String(this.state.selected.minute).padStart(2, '0'),
            second:         String(this.state.selected.second).padStart(2, '0'),
            hideDatepicker: true
        });
    }

    hideDatePicker () {
        this.component.classList.remove('svbDatepicker--show');
    }

    showDatePicker () {
        this.component.classList.add('svbDatepicker--show');

        if (this.state.showTimepicker) this.renderTimepicker();
    }

    defaultEvents () {
        this.event('click', this.calendar, (event) => {
            if (event.target.classList.contains('svbCalendar-grid__day')) {
                const day = event.target.dayObj;

                this.selectDay(
                    day.current,
                    {
                        day:    day.day,
                        month:  day.month,
                        year:   day.year,
                        hour:   this.state.selected.hour || 0,
                        minute: this.state.selected.minute || 0,
                        second: this.state.selected.second || 0
                    }
                );
            }
        });

        this.event('click', this.calendar, (event) => {
            if (event.target.classList.contains('svbCalendar-grid__year')) {
                this.state.current.year = event.target.year;
                this.state.current.month = 0;

                this.state.selected = {
                    day:   1,
                    month: 0,
                    year:  event.target.year
                };

                this.renderCalendar();
            }
        });

        this.event('keydown', this.component, (event) => {
            if (event.keyCode === 9) {
                event.preventDefault();

                this.eventTab(event);
            }
        });

        document.body.addEventListener('click', (event) => { // вот есть small проблем
            const path = event.path || (event.composedPath && event.composedPath());

            if (path && !path.includes(this.component.parentNode) && this.component.parentNode) {
                this.hideDatePicker();
            }
        });
    }

    clearCalendar () {
        while (this.calendar.firstChild) {
            this.calendar.removeChild(this.calendar.firstChild);
        }
    }

    renderModal () {
        const title = SvbElement.create('div', null, 'datepicker-modal__title');
        const body = SvbElement.create('div', null, 'datepicker-modal__body');
        const footer = SvbElement.create('div', null, 'datepicker-modal__footer');

        this.modal.appendChild(title);
        this.modal.appendChild(body);
        this.modal.appendChild(footer);

        body.appendChild(this.component);
        // document.body.querySelector('#content-block').appendChild(this.modal);
    }

    renderPres () {
        const wrapper = SvbElement.create('div', null, 'svbDatepicker__pres');
        const month   = SvbElement.create('div', null, 'svbDatepicker__pres-month');
        const year    = SvbElement.create('div', null, 'svbDatepicker__pres-year');

        month.textContent = translations.months[this.state.current.month];
        year.textContent = this.state.current.year;

        this.event('click', year, () => {
            this.renderYearGrid();
        });

        this.options.innerHTML = '';

        wrapper.appendChild(month);
        wrapper.appendChild(year);
        this.options.appendChild(wrapper);
    }

    renderControll () {
        const controll = SvbElement.create('div', null, 'svbDatepicker__controll');
        const prevBtn  = SvbElement.create(
            'div',
            null,
            'svbDatepicker__btn svbDatepicker__btn--prev',
            `
                <svg width="11" height="19" viewBox="0 0 11 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9.08802 17.9244C9.45714 18.2984 10.0617 18.2957 10.4274 17.9184C10.782 17.5527 
                    10.7794 16.9708 10.4216 16.6083L3.89311 9.99269C3.43952 9.53305 3.43952 8.79422 3.89311 
                    8.33458L10.4216 1.719C10.7794 1.35647 10.782 0.774531 10.4274 0.408849C10.0617 0.031561 
                    9.45714 0.0288868 9.08802 0.402924L1.26073 8.33458C0.807134 8.79422 0.807134 9.53305 
                    1.26073 9.99269L9.08802 17.9244Z" fill="#4B5563"/>
                </svg>

            `
        );
        const nextBtn  = SvbElement.create(
            'div',
            null,
            'svbDatepicker__btn svbDatepicker__btn--next',
            `
                <svg width="10" height="19" viewBox="0 0 10 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1.6316 17.9244C1.26248 18.2984 0.657969 18.2957 0.292178 17.9184C-0.0623612 17.5527 
                    -0.0597867 16.9708 0.297974 16.6083L6.82651 9.99269C7.2801 9.53305 7.2801 8.79422 6.82651 
                    8.33458L0.297973 1.719C-0.0597871 1.35647 -0.0623612 0.774531 0.292178 0.408849C0.657969 
                    0.031561 1.26248 0.0288868 1.6316 0.402924L9.45889 8.33458C9.91249 8.79422 9.91249 9.53305 
                    9.45889 9.99269L1.6316 17.9244Z" fill="#4B5563"/>
                </svg>

            `
        );

        this.event('click', prevBtn, () => {
            this.changeCurrentMonth(-1);
            this.renderCalendar();
        });

        this.event('click', nextBtn, () => {
            this.changeCurrentMonth(1);
            this.renderCalendar();
        });

        controll.appendChild(prevBtn);
        controll.appendChild(nextBtn);
        this.options.appendChild(controll);
    }

    renderDateGrid () {
        const body = SvbElement.create('div', null, 'svbCalendar__body svbCalendar-grid');

        for (let i = 0; i < this.state.calendarDays.length; i += 7) {
            const week = this.state.calendarDays.slice(i, i + 7);
            const weekRow = SvbElement.create('div', null, 'svbCalendar-grid__row');

            week.forEach((processed, index) => {
                const dayCell = SvbElement.create('div', null, 'svbCalendar-grid__cell');
                const dayBtn  = SvbElement.create('button', null, 'svbCalendar-grid__day');

                if (!processed.current) dayBtn.classList.add('svbCalendar-grid__day--gray');

                if (processed.day === this.state.today.getDate() &&
                    processed.month === this.state.today.getMonth() &&
                    processed.year === this.state.today.getFullYear()) {
                    dayBtn.classList.add('svbCalendar-grid__day--current');
                }

                if (processed.day === this.state.selected.day &&
                    processed.month === this.state.selected.month &&
                    processed.year === this.state.selected.year) {
                    dayBtn.classList.remove('svbCalendar-grid__day--current');
                    dayBtn.classList.add('svbCalendar-grid__day--selected');
                }

                if (index === 5 || index === 6) {
                    dayBtn.classList.add('svbCalendar-grid__day--holiday');
                }

                dayBtn.textContent = processed.day;
                dayBtn.dayObj = processed;

                dayCell.appendChild(dayBtn);
                weekRow.appendChild(dayCell);
            });

            body.appendChild(weekRow);
        }

        this.calendar.classList.remove('svbCalendar--year');
        this.calendar.appendChild(body);
    }

    renderYearGrid () {
        const body = SvbElement.create('div', null, 'svbCalendar__body svbCalendar-grid');
        let selectedYear = null;

        for (let year = 1700; year <= 2200; year += 1) {
            const yearRow = SvbElement.create('div', null, 'svbCalendar-grid__row');
            const countBtns = year + 3;

            for (year; year <= countBtns; year += 1) {
                const yearCell = SvbElement.create('div', null, 'svbCalendar-grid__cell');
                const yearBtn  = SvbElement.create('button', null, 'svbCalendar-grid__year');

                if (year === this.state.selected.year) {
                    yearBtn.classList.add('svbCalendar-grid__year--selected');

                    selectedYear = yearCell;
                }

                yearBtn.textContent = year;
                yearBtn.year = year;

                yearCell.appendChild(yearBtn);
                yearRow.appendChild(yearCell);
            }

            year -= 1;

            body.appendChild(yearRow);
        }

        this.calendar.classList.add('svbCalendar--year');
        this.calendar.innerHTML = '';
        this.calendar.appendChild(body);
        this.calendar.scrollTo(0, (selectedYear.offsetTop - (selectedYear.offsetHeight * 2)));
    }

    renderTimepicker () {
        const title = SvbElement.create('span', null, 'svbTimepicker__title', 'Время');
        const timeRepresent = SvbElement.create('div', null, 'svbTimepicker__represent',
            `${String(this.state.selected.hour || '0').padStart(2, '0')} : ${
                String(this.state.selected.minute || '0').padStart(2, '0')}`);
        const getTimeArray = (max) => {
            const arr = [];

            for (let index = -1; index < max; index++) {
                arr.push(index + 1);
            }

            return arr;
        };
        const picker = new WheelPicker([{
            name:     'hour',
            value:    this.state.selected.hour,
            elements: getTimeArray(this.timeInputs.hour.max)
        }, {
            name:     'minute',
            value:    this.state.selected.minute,
            elements: getTimeArray(this.timeInputs.minute.max)
        }]);

        picker.component.addEventListener('svb:change', (e) => {
            const hour = picker.wheels.find(i => i.name === 'hour').value;
            const minute = picker.wheels.find(i => i.name === 'minute').value;

            this.state.selected.hour = hour;
            this.state.selected.minute = minute;
            timeRepresent.innerHTML = `${String(hour || '0').padStart(2, '0')} : ${
                    String(minute || '0').padStart(2, '0')}`;

            this.eventChange({
                day:            String(this.state.selected.day).padStart(2, '0'),
                month:          String(this.state.selected.month + 1).padStart(2, '0'),
                year:           String(this.state.selected.year).padStart(4, '0'),
                hour:           String(this.state.selected.hour).padStart(2, '0'),
                minute:         String(this.state.selected.minute).padStart(2, '0'),
                second:         String(this.state.selected.second).padStart(2, '0'),
                hideDatepicker: false
            });
        });

        timeRepresent.addEventListener('click', () => {
            picker.show();
            const hideHandler = (e) => {
                if (e.target === timeRepresent) return;

                picker.hide();

                document.body.removeEventListener('click', hideHandler);
            };

            document.body.addEventListener('click', hideHandler);
        });

        this.clearComponent(this.timepicker);
        this.timepicker.appendChild(title);
        this.timepicker.appendChild(timeRepresent);
        this.timepicker.appendChild(picker.component);
    }

    renderCalendar () {
        this.createDateCalendar();

        this.renderPres();
        this.renderControll();
        this.clearCalendar();
        this.renderDateGrid();
        this.renderTimepicker();
    }

    render () {
        this.wrapper.appendChild(this.options);
        this.wrapper.appendChild(this.calendar);

        if (this.state.showTimepicker) this.wrapper.appendChild(this.timepicker);

        this.component.appendChild(this.wrapper);
        this.renderModal();

        return this.component;
    }

    static getPrevMonth (month) { return (month - 1) < 0 ? 11 : month - 1; }

    static getNextMonth (month) { return (month + 1) > 11 ? 0 : month + 1; }
}

export default SvbDatepicker;
