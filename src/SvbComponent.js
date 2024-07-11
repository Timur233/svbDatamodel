'use strict';

import '../scss/main.scss';
import SvbElement from './components/SvbElement';
import SvbInput from './components/inputs/SvbInput';
import SvbAttributesForm from './components/SvbAttributesForm';
import FileUploader from './components/FileUploader';
import PageAlert from './components/PageAlert';

class SvbComponent {
    constructor () {
        
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

    static fileUploader(title) {
        return new FileUploader(title);
    }

    static pagePreloader(title, desc, buttons = []) {
        const pageAlert = new PageAlert();
        
        pageAlert.showLoader(title, desc, buttons);

        return pageAlert.component;
    }

    static pageSuccess(title, desc, buttons = [], icon = null) {
        const pageAlert = new PageAlert();
        
        pageAlert.showMessage(icon, title, desc, buttons);

        return pageAlert.component;
    }

    static pageError(title, desc, buttons = [], icon = null) {
        const pageAlert = new PageAlert();
        
        pageAlert.showError(icon, title, desc, buttons);

        return pageAlert.component;
    }
}

export default SvbComponent;
