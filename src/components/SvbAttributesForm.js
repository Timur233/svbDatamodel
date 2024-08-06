import SvbElement from './SvbElement';

class SvbAttributesForm extends SvbElement {
    constructor (attributes) {
        super();

        this.state = {
            attributes
        };

        this.init();
    }

    init () {
        this.component = SvbElement.create('div', null, 'svb-form svb-attributes-form');

        this.render();
        this.publicMethods();
    }

    publicMethods () {
        this.component.getInstance = this.getInstance.bind(this);
        this.component.getAttribute = this.getAttribute.bind(this);
        this.component.validate = this.validate.bind(this);
        this.component.disable = this.disable.bind(this);
        this.component.enable = this.enable.bind(this);
    }

    getAttribute (name) {
        return this.state.attributes.find(i => i.descriptor === name)?.input;
    }

    validate () {
        let hasError = false;

        this.state.attributes.forEach((attr) => {
            const attrSettings = attr.settings;
            const attrValue = attr.input.getValue();
            const inputValidate = attr.input.validate();

            if (attrSettings.required) {
                let valueInBool = true;

                switch (attrSettings.type) {
                    case 'catalog':
                        valueInBool = !!attrValue?.v && inputValidate;

                        break;

                    default:
                        valueInBool = !!attrValue && inputValidate;

                        break;
                }

                if (valueInBool === false) {
                    hasError = true;
                    attr.input.emitError();
                }
            }
        });

        return !hasError;
    }

    disable (descriptor = null) {
        this.state.attributes.forEach((attr) => {
            if (descriptor === null || attr.descriptor === descriptor) { attr.input.disable(); }
        });
    }

    enable (descriptor = null) {
        this.state.attributes.forEach((attr) => {
            if (descriptor === null || attr.descriptor === descriptor) { attr.input.enable(); }
        });
    }

    renderFields () {
        this.state.attributes.forEach((attribute) => {
            const wrapper = SvbElement.create('div', null, 'svb-form__filed svb-field');
            const label   = SvbElement.create(
                'label',
                null,
                `svb-field__label ${attribute?.settings?.required ? 'svb-field__label--requared' : ''}`,
                attribute?.label
            );

            if (attribute?.label !== undefined) { wrapper.appendChild(label); }

            wrapper.appendChild(attribute.input);

            attribute.wrapper = wrapper;
            this.component.appendChild(wrapper);
        });
    }

    render () {
        this.renderFields();

        return this.component;
    }
}

export default SvbAttributesForm;
