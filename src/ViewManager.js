'use strict';

import SvbComponent from './SvbComponent';

class ViewManager {
    constructor (dataModel) {
        this._dataModel = dataModel;
        this._components = [];
    }

    get dataModel () { return this._dataModel; }
    set dataModel (value) {
        throw new Error('SVB Error. The object property "dataModel" cannot be modified.');
    }

    get components () { return this._components; }
    set components (value) {
        throw new Error('SVB Error. The object property "components" cannot be modified.');
    }

    /**
     *
     * @param {Object} reactorData
     * @param {String} reactorData.id
     * @param {String} reactorData.descriptor
     * @param {Function} reactorData.emitEvent
     * @param {Function} reactorData.handleEvent
     */
    appendComponent (componentData) {
        const component = {
            id:         componentData.id,
            descriptor: componentData.descriptor,
            wrapper:    componentData.wrapper,
            methods:    componentData.methods,
            reactor:    this.dataModel.addReactor({
                descriptor: componentData.descriptor,
                emitEvent:  componentData.methods.update
            })
        };

        if (componentData.wrapper.addEventListener) {
            componentData.wrapper.addEventListener('svb:change', (event) => {
                component.reactor.set(componentData.wrapper.getValue());
            });
        }

        this.components.push(component);

        return component;
    }

    /**
     *
     * @param {String} id
     * @param {String} descriptor
     * @param {Function} renderFunction
     * @param {Function} eventHandler
     * @returns NodeELement
     */
    custom (componentData) {
        if (componentData.descriptor && componentData.render) {
            const id = componentData.id || Math.floor(Math.random() * (234234234 + 1)).toString();
            const component = componentData.render(this.dataModel.getValueByDescriptor(componentData.descriptor));
            const componentWrapper = SvbComponent.customComponent('div', componentData.descriptor, id);
            const componentObject = this.appendComponent({
                id,
                wrapper:    componentWrapper,
                descriptor: componentData.descriptor,
                methods:    {
                    render: componentData.render,
                    update: componentData.update?.bind(componentData) || function (value) {
                        if (componentWrapper) { componentWrapper.setContent(componentData.render(value)); }
                    }
                }
            });

            componentData.component = component;
            componentData.wrapper = componentWrapper;
            componentData.eventChange = componentObject.reactor.set;
            componentWrapper.getValue = component.getValue;
            componentWrapper.setContent(component);

            return componentWrapper;
        }
    }

    input (componentData) {
        const input = SvbComponent.baseInput(componentData?.settings);
        const compoenntId = componentData.id || Math.floor(Math.random() * (234234234 + 1)).toString();

        this.appendComponent({
            id:         compoenntId,
            wrapper:    input.component,
            descriptor: componentData.descriptor,
            methods:    {
                render: input.render(),
                update: (value) => { input.setValue(value); }
            }
        });

        input.setValue(this.dataModel.getValueByDescriptor(componentData.descriptor));

        return input.component;
    }

    form (componentData) {
        // const compoenntId = componentData.id || Math.floor(Math.random() * (234234234 + 1)).toString();
        const attributes = componentData.attributes.map((attr) => {
            return {
                ...attr,
                input: attr?.settings?.isCustom ? this.custom(attr) : this.input(attr)
            };
        });
        const form = SvbComponent.attributesForm(attributes);

        return form.component;
    }

    fileUploader (title) {
        return SvbComponent.fileUploader(title);
    }

    modal (title, content) {
        return SvbComponent.modal(title, content, document.querySelector('#content-block'));
    }

    bottomConfirm (title, content) {
        return SvbComponent.bottomConfirm(title, content, document.querySelector('#content-block'));
    }
}

export default ViewManager;
