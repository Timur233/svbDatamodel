'use strict';

import SignalsEmitter from './SignalsEmitter';
import ViewManager from './ViewManager';
import { parseDescriptor, compareDescriptors } from './utilities';

class SvbModel {
    /**
     * @param {Any} data
     * @param {String} name
     * @param {String} id
     */
    constructor (data, name = 'model', id = '') {
        this._name = name;
        this._id = id;
        this._reactors = [];
        this._model = new SignalsEmitter(data, name, id);
        this.vm = new ViewManager(this);

        this.eventListener();
    }

    get model () { return this._model; }
    set model (value) {
        if (value instanceof SignalsEmitter) {
            this._model = value;
        } else {
            throw new Error('SVB Error. The model property must be an instance of the Model class.');
        }
    }

    get reactors () { return this._reactors; }
    set reactors (value) {
        throw new Error('SVB Error. The object property "components" cannot be modified.');
    }

    get name () { return this._name; }
    set name (value) {}

    get id () { return this._id; }
    set id (value) {}

    /**
     *
     * @param {Array} descriptorArray
     */
    getValueByDescriptor (descriptorArray) {
        let requestedValue = null;

        for (let i = 0; i < descriptorArray.length; i++) {
            const descriptorItem = descriptorArray[i];

            if (i === 0 && descriptorItem === this.name) { continue; }

            if (i === 1 && descriptorItem === this.id) { continue; }

            requestedValue = this.model[descriptorItem];
        }

        return requestedValue;
    }

    /**
     *
     * @param {Array} descriptorArray
     */
    setValueByDescriptor (descriptorArray, value) {
        let requestedObject = this.model;
        const targetParam = descriptorArray[descriptorArray.length - 1];

        for (let i = 0; i < descriptorArray.length - 1; i++) {
            const descriptorItem = descriptorArray[i];

            if (i === 0 && descriptorItem === this.name) { continue; }

            if (i === 1 && descriptorItem === this.id) { continue; }

            requestedObject = requestedObject[descriptorItem];
        }

        if (requestedObject) {
            requestedObject[targetParam] = value;

            return true;
        }

        return false;
    }

    /**
     * Listen proxy events
     */
    eventListener () {
        document.addEventListener(
            'model:' + 'model' + (this.name ? `-${this.name}` : ''),
            (event) => {
                this.eventHandler(event.detail);
            }
        );
    }

    /**
     * Parse descriptor and start render
     * @param {String} ditails event ditails
     */
    eventHandler (ditails) {
        const eventDescriptor = parseDescriptor(ditails.descriptor);

        this.reactors.forEach((reactor) => {
            const reactorDescriptor = parseDescriptor(reactor.descriptor);

            if (compareDescriptors(eventDescriptor, reactorDescriptor)) {
                reactor.dispatch(this.getValueByDescriptor(reactorDescriptor));
            }
        });
    }

    /**
     *
     * @param {Object} reactorData
     * @param {String} reactorData.id
     * @param {String} reactorData.descriptor
     * @param {Function} reactorData.emitEvent
     * @param {Function} reactorData.handleEvent
     */
    addReactor (reactorData) {
        const reactorDescriptor = parseDescriptor(reactorData.descriptor);

        if (reactorData.descriptor) {
            const reactorId = reactorData.id || Math.floor(Math.random() * (234234234 + 1)).toString();
            const findReactor = this.reactors.find(i => i.id === reactorId);

            if (findReactor) return findReactor;

            this.reactors.push({
                id:         reactorId,
                descriptor: reactorData.descriptor,
                dispatch:   reactorData.emitEvent,
                set:        (value) => {
                    this.setValueByDescriptor(reactorDescriptor, value);
                }
            });

            return this.reactors.find(i => i.id === reactorId);
        }

        return false;
    }

    /**
     *
     * @param {String} reactorId
     */
    removeReactor (reactorId) {
        if (reactorId && reactorId !== '') {
            this.reactors = this.reactors.filter(i => i.id !== reactorId);
        }
    }

    /**
     *
     * @param {String} descriptor
     * @param {Function} callback
     */
    watch (descriptor, callback) {
        this.addReactor({
            descriptor,
            emitEvent: callback.bind(this.model)
        });
    }

    computed (fieldDescriptor, listeningDescriptors, callback) {
        listeningDescriptors.forEach((descriptor) => {
            this.addReactor({
                descriptor,
                emitEvent: () => {
                    const computedDescriptor = parseDescriptor(fieldDescriptor);
                    const computedValue = callback.apply(this, listeningDescriptors.map((i) => {
                        return this.getValueByDescriptor(parseDescriptor(i));
                    }));

                    this.setValueByDescriptor(computedDescriptor, computedValue);
                }
            });
        });
    }

    setFilters (descriptor, filters = []) {
        const component = this.vm.components.find(i => i.descriptor === descriptor);

        component.filters = filters;
    }
}

export default SvbModel;
