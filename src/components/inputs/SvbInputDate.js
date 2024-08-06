import BaseInput from './BaseInput';
import SvbDatepicker from '../SvbDatepicker';
import SvbFormatter from '../../utils/SvbFormatter';

class SvbInputDate extends BaseInput {
    constructor (viewSetting, classList) {
        super(viewSetting, classList);

        this.state.formattedData = SvbFormatter.date('2024-12-12');
        this.state.type = 'timestamp';

        this.init();
        this.render();
    }

    init () {
        this.component.classList.add('svb-input--date');
        this.input.classList.add('svb-input__text');

        SvbInputDate.validateDate(this.input, this.state.type === 'timestamp');
        this.renderDatePicker();

        if (!this.settings.readOnly) this.inputEvents();
    }

    inputEvents () {
        this.event('click', this.input, (e) => {
            e.preventDefault();
            e.stopPropagation();

            this.renderDatePicker();
        });
    }

    inputMethod (event) {
        event.stopPropagation();
        event.preventDefault();

        this.eventInput(event, this.component);
    }

    setValue (value) {
        const dateObject = value
            ? new Date(value)
            : new Date();
        const dateStr = {
            day:    dateObject.getDate().toString().padStart(2, '0'),
            month:  (dateObject.getMonth() + 1).toString().padStart(2, '0'),
            year:   dateObject.getFullYear(),
            hour:   dateObject.getHours().toString().padStart(2, '0'),
            minute: dateObject.getMinutes().toString().padStart(2, '0'),
            second: '0'.padStart(2, '0')
        };

        if (value) {
            this.state.value = `${dateStr.day}.${dateStr.month}.${dateStr.year}${
                this.state.type === 'timestamp' ? ` ${dateStr.hour}:${dateStr.minute}:${dateStr.second}` : ''}`;
            this.state.represent = `${dateStr.day}.${dateStr.month}.${dateStr.year}${
                this.state.type === 'timestamp' ? ` ${dateStr.hour}:${dateStr.minute}:${dateStr.second}` : ''}`;
        } else {
            this.state.value = '';
            this.state.represent = '';
        }

        this.state.date = `${dateStr.year}-${dateStr.month}-${dateStr.day}${
            this.state.type === 'timestamp' ? ` ${dateStr.hour}:${dateStr.minute}:${dateStr.second}` : ''}`;

        if (this.fragment) this.fragment.utilityObject.setDate(this.state.date);

        this.input.value = this.state.represent;
    }

    getValue () {
        return this.state.date;
    }

    activate (isFocus = true) {
        if (this.state.settings.readOnly === true) return;

        if (!this.component.classList.toggle('svb-input--represent')) {
            this.clear();

            this.component.appendChild(this.input);

            if (isFocus) this.input.focus();

            this.renderInput();
            this.renderDatePicker();
        }
    }

    renderDatePicker () {
        if (this.settings.readOnly) return;

        if (this.fragment === null) {
            this.fragment = new SvbDatepicker({
                date:       this.state.date,
                classList:  'svb-input__datepicker',
                timepicker: this.state.type === 'timestamp'
            });

            this.fragment.utilityObject.eventChange = (selected) => {
                this.state.date = `${selected.year}-${selected.month}-${selected.day}${
                    this.state.type === 'timestamp' ? ` ${selected.hour}:${selected.minute}:${selected.second}` : ''}`;

                this.setValue(`${selected.year}-${selected.month}-${selected.day}${
                    this.state.type === 'timestamp' ? ` ${selected.hour}:${selected.minute}:${selected.second}` : ''}`);

                this.renderInput();

                if (selected.hideDatepicker) {
                    this.fragment.utilityObject.hideDatePicker();
                }

                return this.component.dispatchEvent(new CustomEvent('svb:change', {
                    bubbles:    true,
                    cancelable: true,
                    event
                }));
            };

            this.fragment.utilityObject.eventTab = (event) => {
                if (event.shiftKey === true) {
                    this.bypassFields(-1);

                    return;
                }

                this.bypassFields(1);
            };

            this.component.appendChild(this.fragment);

            return;
        }

        this.fragment.utilityObject.setDate(this.state.date);
        this.fragment.utilityObject.renderCalendar();
        this.fragment.utilityObject.showDatePicker();
    }

    renderInput () {
        this.input.type = 'text';
        this.input.value = this.state.value;
        this.input.placeholder = this.state.placeholder || 'Введите дату или выберите';
        // this.input.setAttribute('draggable', true);

        this.component.setAttribute('title', this.state.represent);

        this.clearComponent(this.controll);

        this.input.addStyles({
            textAlign: this.settings.textAlign
        });
    }

    static validateDate (input, isTimestamp = false) {
        const dayValidator = function (value) {
            this.temp += value;
            this.value = this.temp.padStart(2, '0').substr(-2, 2);

            if (Number(this.temp) > 3 && Number(this.temp) < 10) {
                this.temp = '';

                activeNext();
            }

            if (Number(this.temp) > 31) {
                this.value = '31';
                this.temp = '';

                activeNext();
            }

            if (this.temp.length === 2) {
                this.temp = '';
                this.value = this.value === '00' ? '01' : this.value;

                activeNext();
            }
        };

        const monthValidator = function (value) {
            this.temp += value;
            this.value = this.temp.padStart(2, '0').substr(-2, 2);

            if (Number(this.temp) === 2) {
                this.temp = '';

                activeNext();
            }

            if (Number(this.temp) > 12) {
                this.value = '12';
                this.temp = '';

                activeNext();
            }

            if (this.temp.length === 2) {
                this.temp = '';
                this.value = this.value === '00' ? '01' : this.value;

                activeNext();
            }
        };

        const yearValidator = function (value) {
            this.temp += value;
            this.value = this.temp.padStart(4, '0').substr(-4, 4);

            if (Number(this.temp) > 3000) {
                this.value = '3000';
                this.temp = '';

                activeNext();
            }

            if (this.temp.length === 4) {
                this.temp = '';
                this.value = Number(this.value) < 1001 ? '1001' : this.value;

                activeNext();
            }
        };

        const hourValidate = function (value) {
            this.temp += value;
            this.value = this.temp.padStart(2, '0').substr(-2, 2);

            if (Number(this.temp) > 2 && Number(this.temp) < 10) {
                this.temp = '';

                activeNext();
            }

            if (Number(this.temp) > 23) {
                this.value = '23';
                this.temp = '';

                activeNext();
            }

            if (this.temp.length === 2) {
                this.temp = '';

                activeNext();
            }
        };

        const minuteValidate = function (value) {
            this.temp += value;
            this.value = this.temp.padStart(2, '0').substr(-2, 2);

            if (Number(this.temp) > 5 && Number(this.temp) < 10) {
                this.temp = '';

                activeNext();
            }

            if (Number(this.temp) > 59) {
                this.value = '59';
                this.temp = '';

                activeNext();
            }

            if (this.temp.length === 2) {
                this.temp = '';

                activeNext();
            }
        };

        const secondValidate = function (value) {
            this.temp += value;
            this.value = this.temp.padStart(2, '0').substr(-2, 2);

            if (Number(this.temp) > 5 && Number(this.temp) < 10) {
                this.temp = '';

                activeNext();
            }

            if (Number(this.temp) > 59) {
                this.value = '59';
                this.temp = '';

                activeNext();
            }

            if (this.temp.length === 2) {
                this.temp = '';

                activeNext();
            }
        };

        const backspace = (item) => {
            item.value = '0'.repeat(item.value.length);
        };

        const state = {
            items: [
                {
                    start:    0,
                    end:      2,
                    isActive: true,
                    value:    '00',
                    temp:     '',
                    method:   dayValidator
                },
                {
                    start:    3,
                    end:      5,
                    isActive: false,
                    value:    '00',
                    temp:     '',
                    method:   monthValidator
                },
                {
                    start:    6,
                    end:      10,
                    isActive: false,
                    value:    '0000',
                    temp:     '',
                    method:   yearValidator
                }
            ]
        };

        if (isTimestamp) {
            state.items.push({
                start:    11,
                end:      13,
                isActive: false,
                value:    '00',
                temp:     '',
                method:   hourValidate
            });
            state.items.push({
                start:    14,
                end:      16,
                isActive: false,
                value:    '00',
                temp:     '',
                method:   minuteValidate
            });
            state.items.push({
                start:    17,
                end:      19,
                isActive: false,
                value:    '00',
                temp:     '',
                method:   secondValidate
            });
        }

        const getCursor = (mod = 0) => {
            let caretPosition = 0;

            if (document.selection) {
                const selection = document.selection.createRange();

                input.focus();
                selection.moveStart('character', -input.value.length);
                caretPosition = selection.text.length;

                return caretPosition;
            }

            caretPosition = input.selectionStart + mod;

            return caretPosition;
        };

        const setCursor = (a, b) => { input.setSelectionRange(a, b); };

        const generateResult = () => `${state.items[0].value}.${state.items[1].value}.${
                    state.items[2].value}${isTimestamp
                        ? ` ${state.items[3].value}:${state.items[4].value}:${state.items[5].value}`
                        : ''}`;

        const generateSqlResult = () => `${state.items[2].value}-${state.items[1].value}-${state.items[0].value}${
                isTimestamp ? ` ${state.items[3].value}:${state.items[4].value}:${state.items[5].value}` : ''}`;

        function formatDateTime (event) {
            event.stopPropagation();
            event.preventDefault();

            const currentItem = state.items.find(item => item.isActive);

            if (event.inputType !== 'deleteContentBackward' && /[^\d]+/.test(event.data)) {
                input.value = generateResult();
                selectCurrent();

                return;
            }

            if (event.inputType === 'deleteContentBackward') {
                backspace(currentItem);
            } else {
                currentItem.method(event.data);
            }

            input.value = generateResult();
            selectCurrent();

            if (new Date(generateSqlResult()) instanceof Date && !isNaN(new Date(generateSqlResult()))) {
                // input.parentNode.utilityObject.renderDatePicker();
            }
        }

        function activeNext () {
            const activeIndex = state.items.findIndex(item => item.isActive);

            if (state.items[activeIndex + 1]) {
                state.items[activeIndex].isActive = false;
                state.items[activeIndex + 1].isActive = true;
            }
        }

        function selectCurrent () {
            const current = state.items.find(item => item.isActive);

            setCursor(current.start, current.end);
        }

        function selectSector (position) {
            state.items.forEach((item) => {
                if (position >= item.start && position <= item.end) {
                    item.isActive = true;

                    setCursor(item.start, item.end);

                    return;
                }

                item.isActive = false;
            });
        }

        input.addEventListener('input', formatDateTime);
        input.addEventListener('focus', () => {
            const instance = input.parentNode.utilityObject;
            const dateObject = instance?.state?.date
                ? new Date(instance.state.date)
                : new Date();
            const dateString = {
                day:    dateObject.getDate().toString().padStart(2, '0'),
                month:  (dateObject.getMonth() + 1).toString().padStart(2, '0'),
                year:   dateObject.getFullYear(),
                hour:   dateObject.getHours().toString().padStart(2, '0'),
                minute: dateObject.getMinutes().toString().padStart(2, '0'),
                second: dateObject.getSeconds().toString().padStart(2, '0')
            };

            state.items[0].value = dateString.day;
            state.items[0].isActive = true;
            state.items[1].value = dateString.month;
            state.items[1].isActive = false;
            state.items[2].value = dateString.year;
            state.items[2].isActive = false;

            if (isTimestamp) {
                state.items[3].value = dateString.hour;
                state.items[3].isActive = false;
                state.items[4].value = dateString.minute;
                state.items[4].isActive = false;
                state.items[5].value = dateString.second;
                state.items[5].isActive = false;
            }

            input.value = generateResult();
            selectCurrent();
        });
        input.addEventListener('click', (event) => {
            event.preventDefault();

            selectSector(getCursor());
        });
        input.addEventListener('keydown', (event) => {
            const currentIndex = state.items.findIndex(item => item.isActive);
            let index = null;

            switch (event.keyCode) {
                case 37:
                    event.preventDefault();
                    index = currentIndex - 1;
                    break;
                case 39:
                    event.preventDefault();
                    index = currentIndex + 1;
                    break;
                case 38:
                    event.preventDefault();
                    index = 0;
                    break;
                case 40:
                    event.preventDefault();
                    index = state.items.length - 1;
                    break;
                default:
                    break;
            }

            if (state.items[index]) selectSector(state.items[index].start);
        });
    }
}

export default SvbInputDate;
