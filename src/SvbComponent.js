'use strict';

import '../scss/main.scss';
import SvbElement from './components/SvbElement';
import SvbInput from './components/inputs/SvbInput';
import SvbAttributesForm from './components/SvbAttributesForm';

class SvbComponent {
    constructor () {
        return '';
    }

    static customComponent (tag, descriptor, id) {
        const component = SvbElement.create(tag, null, 'svbCustom__component');

        component.addAttributes({ 'view-id': id, descriptor });
        component.setContent = (content) => {
            if (content) {
                component.innerHTML = '';

                if (content instanceof HTMLElement) {
                    component.appendChild(content);
                } else {
                    component.innerHTML = content;
                }
            }
        };

        return component;
    }

    static baseInput (settings) {
        return new SvbInput(settings);
    }

    static attributesForm(attributes) {
        return new SvbAttributesForm(attributes);
    }
}

export default SvbComponent;
