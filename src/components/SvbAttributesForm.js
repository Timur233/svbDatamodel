import SvbElement from "./SvbElement";

class SvbAttributesForm extends SvbElement {
    constructor (attributes) {
        super();

        this.state = {
            attributes
        }

        this.init();
    }

    init() {
        this.component = SvbElement.create('div', null, 'svb-form svb-attributes-form');

        this.render();
        this.publicMethods();
    }

    publicMethods() {
        this.component.getInstance = this.getInstance.bind(this);
        this.component.getAttribute = this.getAttribute.bind(this);
    }

    getAttribute(name) {
        return this.state.attributes.find(i => i.descriptor === name)?.input;
    }

    renderFields() {
        this.state .attributes.forEach(attribute => {
            const wrapper = SvbElement.create('div', null, 'svb-form__filed svb-field');
            const label   = SvbElement.create('label', null, 'svb-field__label', attribute?.label);

            if (attribute?.label !== undefined)
                wrapper.appendChild(label);

            wrapper.appendChild(attribute.input);

            attribute.wrapper = wrapper;
            this.component.appendChild(wrapper);
        });
    }

    render() {
        this.renderFields();

        return this.component;
    }
}

export default SvbAttributesForm;