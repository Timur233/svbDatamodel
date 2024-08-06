import BaseInput from './BaseInput';
import SvbElement from '../SvbElement';

class SvbInputNumeric extends BaseInput {
    constructor (viewSetting, classList) {
        super(viewSetting, classList);

        this.init();
    }

    init () {
        this.component.classList.add('svb-input--numeric');
        this.loader = null;

        this.component.setFilters = this.setFilters.bind(this);
        this.searchHandling = () => {};
        this.eventChange = (event) => {
            const customEvent = new CustomEvent('svb:change', {
                bubbles:    true,
                cancelable: true,
                event
            });

            return this.component.dispatchEvent(customEvent);
        };

        this.render();
        this.inputEvents();
    }

    inputEvents () {
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
            const customEvent = new CustomEvent('svb:click', {
                bubbles:    true,
                cancelable: true,
                event
            });

            this.inputMethod(event);
            this.state.tempValue = '';
            this.component.dispatchEvent(customEvent);

            return false;
        });

        this.event('input', this.input, (event) => {
            const customEvent = new CustomEvent('svb:input', {
                bubbles:    true,
                cancelable: true,
                event
            });

            this.state.tempValue = this.input.value;
            this.inputMethod(event);
            this.component.dispatchEvent(customEvent);

            return false;
        });

        this.input.addEventListener('blur', (event) => {
            this.input.value = this.state?.represent || '';
        });
    }

    inputMethod (event) {
        event.preventDefault();

        if (this.loader) this.loader.addStyles({ display: 'block' });

        this.showLoader();

        SvbElement.debounce(this.searchHandling, 500, (res) => {
            this.fragment.utilityObject.loadList(res.map(item => ({
                r:              item.represent,
                v:              item.uuid,
                additionalInfo: item
            })));
            this.hideLoader();
            this.fragment.utilityObject.showDropdown();
        })(this._typeObjectName, this._typeObject, this.state.tempValue, this.state.filters);

        this.eventInput(event, this.component);
        this.hideError();
    }

    renderInput () {
        this.input.type = 'text';
        this.input.value = this.state.represent;
        this.input.placeholder = this.state.placeholder || 'Начните вводить текст';
        this.input.classList.add('svb-input__catalog');

        this.component.setAttribute('title', this.state.represent);

        this.renderDropdown();

        this.input.addStyles({
            textAlign: this.settings.textAlign
        });
    }
}

export default SvbInputNumeric;
