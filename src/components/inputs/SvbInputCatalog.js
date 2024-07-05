import BaseInput from "./BaseInput";
import SvbDropdown from "../SvbDropdown";
import SvbElement from "../SvbElement";

class SvbInputCatalog extends BaseInput {
    constructor(viewSetting, classList) {
        super(viewSetting, classList);

        this.state.tempValue = '';
        this.state.filters = viewSetting?.filters || null,

        this.init();
    }

    init() {
        this.component.classList.add('svb-input--catalog');
        this.loader = null;

        this.component.setFilters = this.setFilters.bind(this);
        this.searchHandling = () => {};
        this.eventChange = (event) => {
            const customEvent = new CustomEvent(`svb:change`, {
                bubbles:    true,
                cancelable: true,
                event
            });
        
            return this.component.dispatchEvent(customEvent);
        }
        
        this.render();
        this.inputEvents();
    }

    inputEvents() {
        this.event('keydown', this.input, (event) => {
            if (event.key === 'ArrowUp' || event.keyCode === 38 || event.which === 38) {
                event.preventDefault();
                event.stopPropagation();

                this.fragment.utilityObject.prevItem();

                return false;
            }

            if (event.key === 'ArrowDown' || event.keyCode === 40 || event.which === 40) {
                event.preventDefault();

                if (this.fragment.classList.contains('svbDropdown--open')) {
                    event.stopPropagation();
                }

                this.fragment.utilityObject.nextItem();

                return false;
            }

            if (event.key === 'Enter' || event.keyCode === 13 || event.which === 13) {
                event.preventDefault();
                event.stopPropagation();

                if (this.fragment) this.fragment.utilityObject.hideDropdown();

                return false;
            }

            return false;
        });

        this.event('click', this.input, (event) => {
            const customEvent = new CustomEvent(`svb:click`, {
                bubbles:    true,
                cancelable: true,
                event
            });

            this.inputMethod(event);
            this.state.tempValue = '';
            this.fragment.utilityObject.showDropdown();
            this.component.dispatchEvent(customEvent);

            return false;
        });

        this.event('input', this.input, (event) => {
            const customEvent = new CustomEvent(`svb:input`, {
                bubbles:    true,
                cancelable: true,
                event
            });
            
            this.state.tempValue = this.input.value;
            this.inputMethod(event);
            this.component.dispatchEvent(customEvent);

            return false;
        });
    }

    inputMethod(event) {
        event.preventDefault();

        if (this.loader) this.loader.addStyles({ display: 'block' });

        SvbElement.debounce(this.searchHandling, 500, (res) => {
            this.fragment.utilityObject.loadList(res.map(item => ({
                r:              item.represent,
                v:              item.uuid,
                additionalInfo: item,
            })));
        })(this._typeObjectName, this.state.tempValue, this.state.filters);

        this.eventInput(event, this.component);
        this.fragment.utilityObject.showDropdown();
    }

    getValue() {
        return {
            r: this.state.represent,
            v: this.state.value
        }
    }

    setValue(value) {
        if (value === null) {
            this.state.value = '';
            this.state.represent = '';
            this.input.value = '';
        }

        this.state.value = value?.v || '';
        this.state.represent = value?.r || '';

        if (value?.r) this.input.value = value?.r;

        if (value?.r === null) this.input.value = value?.r;

        this.eventSet();
    }

    setFilters(filters) {
        this.state.filters = filters;
    }

    renderDropdown() {
        if (!this.fragment) {
            this.fragment = new SvbDropdown({
                list:  [],
                class: 'svb-input__dropdown',
            });

            this.fragment.utilityObject.eventClick = (event) => {
                this.setValue({ v: event.target.dataset.value, r: event.target.dataset.represent });
                this.state.additionalInfo = event.target.additionalInfo;
                this.input.value = this.state.represent;

                this.eventSelectDropdown();
                this.eventChange();

                this.input.focus();
                this.fragment.utilityObject.hideDropdown();
            };

            this.fragment.utilityObject.eventActive = (item) => {
                this.setValue({ v: item.dataset.value, r: item.dataset.represent });
                this.state.additionalInfo = item.additionalInfo;
                this.input.value = this.state.represent;

                this.eventSelectDropdown();
                this.eventChange();

                this.input.focus();
                this.fragment.utilityObject.hideDropdown();
            };

            this.fragment.utilityObject.eventLoad = () => {
                if (this.loader) this.loader.addStyles({ display: '' });
            };
            this.component.appendChild(this.fragment);
        } else {
            // this.fragment.utilityObject.showDropdown();
        }
    }

    renderInput() {
        this.input.type = 'text';
        this.input.value = this.state.represent;
        this.input.placeholder = this.state.placeholder || 'Начните вводить текст';
        this.input.classList.add('svb-input__catalog');

        this.component.setAttribute('title', this.state.represent);

        this.renderDropdown();

        this.input.addStyles({
            textAlign: this.settings.textAlign,
        });
    }
}

export default SvbInputCatalog;