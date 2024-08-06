import SvbElement from '../SvbElement';

class BaseInput extends SvbElement {
    constructor (settings, classList, value) {
        super();

        this._type = settings?.type || 'text';
        this._typeObjectName = settings?.typeObjectName;
        this._typeObject = settings?.typeObject || 'catalog';
        this.component = null;

        this.settings = {
            readOnly:    settings?.readOnly || false,
            editOnly:    settings?.editOnly || false,
            placeholder: settings?.placeholder || 'Введите значение',
            textAlign:   settings?.textAlign || 'left',
            multiline:   settings?.multiline || false,
            height:      settings?.height || false,
            style:       {
                classList
            }
        };

        if (settings.validate !== undefined) {
            this.validate = () => settings.validate(this.getValue());
        }

        this.state = {
            value:     null,
            represent: null,
            controlls: [],
            slots:     []
        };

        this.baseInit();
        this.setSlots(settings?.slots || []);

        if (value) { this.setValue(value); }
    }

    get type () { return this._type; }
    set type (value) {}

    baseInit () {
        this.component = SvbElement.create('div', null, `svb-input ${this.settings.style.classList}`);
        this.input = SvbElement.create(this.settings.multiline ? 'textarea' : 'input', null, null);
        this.controll = SvbElement.create('div', null, 'svb-input__controll');
        this.slots = SvbElement.create('div', null, 'svb-input__slots');
        this.fragment = null;

        /** vot tut mnogo voprosov */
        this.eventInput = () => {};
        this.eventChange = () => {};
        this.eventShowModal = () => {};
        this.eventSet = () => {};
        this.eventClick = () => {};
        this.eventBlur = () => {};
        this.eventSelectDropdown = () => {};
        this.eventEndEdit = () => {};
        this.formatter = v => v;

        this.render();
        this.defaultEvents();
        this.publicMethods();
    }

    defaultEvents () {
        this.event('input', this.input, (event) => {
            const customEvent = new CustomEvent('svb:input', {
                bubbles:    true,
                cancelable: true,
                event
            });

            if (this.type !== 'number') {
                this.setValue(this.input.value);
            }

            return this.component.dispatchEvent(customEvent);
        });

        this.event('change', this.input, (event) => {
            const customEvent = new CustomEvent('svb:change', {
                bubbles:    true,
                cancelable: true,
                event
            });

            this.setValue(this.input.value);
            this.hideError();

            return this.component.dispatchEvent(customEvent);
        });

        this.input.addEventListener('focus', (event) => {
            const customEvent = new CustomEvent('svb:focus', {
                bubbles:    true,
                cancelable: true,
                event
            });

            return this.component.dispatchEvent(customEvent);
        });

        this.input.addEventListener('blur', (event) => {
            const customEvent = new CustomEvent('svb:blur', {
                bubbles:    true,
                cancelable: true,
                event
            });

            return this.component.dispatchEvent(customEvent);
        });

        this.input.addEventListener('blur', (event) => {
            const customEvent = new CustomEvent('svb:blur', {
                bubbles:    true,
                cancelable: true,
                event
            });

            return this.component.dispatchEvent(customEvent);
        });
    }

    publicMethods () {
        this.component.getInstance = this.getInstance.bind(this);
        this.component.setValue = this.setValue.bind(this);
        this.component.getValue = this.getValue.bind(this);
        this.component.setSlot = this.setSlot.bind(this);
        this.component.validate = this.validate.bind(this);
        this.component.emitError = this.emitError.bind(this);
        this.component.hideError = this.hideError.bind(this);
        this.component.disable = this.disable.bind(this);
        this.component.enable = this.enable.bind(this);
    }

    setValue (value) {
        if (this.type !== 'number') {
            this.state.value = String(value || '');
            this.state.represent = this.state.value.split('\n').join('<br>');

            if (this.settings.multiline) {
                this.input.value = this.state.value;
            }

            this.input.value = this.state.value;
        } else {
            this.state.value = value;
            this.state.represent = String(value || '');

            this.input.value = this.state.value;
        }
    }

    getValue () {
        return this.state.value;
    }

    validate () {
        return true;
    }

    emitError () {
        this.component.classList.add('svb-input--error');
    }

    hideError () {
        this.component.classList.remove('svb-input--error');
    }

    disable () {
        this.settings.disabled = true;

        this.component.classList.add('svb-input--disabled');
        this.input.setAttribute('disabled', 'disabled');
    }

    enable () {
        this.settings.disabled = false;

        this.component.classList.remove('svb-input--disabled');
        this.input.removeAttribute('disabled');
    }

    setSlots (slots = []) {
        slots.forEach(slot => this.setSlot(slot));
    }

    /**
     *
     * @param {Object} slot
     * @param {String} slot.title
     * @param {String} slot.position
     * @param {Any} slot.content
     */
    setSlot (slot) {
        if (slot.content) {
            this.state.slots.push({
                id:       Math.floor(Math.random() * (234234234 + 1)).toString(),
                title:    slot?.title || '',
                position: slot?.position || 'end',
                content:  slot.content
            });

            this.renderSlots();
        }
    }

    renderWrapper () {
        if (this.settings.readOnly === true) {
            this.component.classList.add('svb-input--readonly');
        } else {
            this.component.classList.remove('svb-input--readonly');
        }

        this.component.addStyles({
            height: this.settings.style.height ? `${this.settings.style.height}px` : 'auto'
        });
    }

    renderInput () {
        this.input.value = this.state.value;
        this.input.classList.add('svb-input__text');
        this.input.placeholder = this.settings.placeholder || 'Введите текст';

        if (!this.settings.multiline) {
            this.input.type = this.type;
        }

        this.component.setAttribute('title', this.state.represent);

        this.input.addStyles({
            textAlign: this.settings.textAlign,
            height:    this.settings.height ? `${this.settings.height}px` : 'auto'
        });

        if (this.settings.length) {
            this.input.setAttribute('maxlength', this.settings.length);
        }
    }

    renderSlots () {
        const slots = this.state.slots.filter(i => i.position === 'end');

        this.clearComponent(this.slots);
        slots.forEach((slot) => {
            const slotElement = SvbElement.create('div', slot.id, 'svb-input__slot');

            if (slot.content instanceof HTMLElement) {
                slotElement.appendChild(slot.content);
            } else {
                slotElement.innerHTML = slot.content;
            }

            slotElement.title = slot?.title;
            this.slots.appendChild(slotElement);
        });

        this.component.appendChild(this.slots);
    }

    render () {
        this.clearComponent(this.component);

        this.renderWrapper();
        this.renderInput();
        this.component.appendChild(this.input);
        this.renderSlots();

        if (this.fragment) {
            this.component.appendChild(this.fragment);
        }

        return this.component;
    }
}

export default BaseInput;
