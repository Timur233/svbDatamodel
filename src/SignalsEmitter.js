'use strict';

import { emit, getObjectType } from './utilities';

class SignalsEmitter {
    /**
     *
     * @param {Object} target
     * @returns {Proxy}
     */
    constructor (target, name = 'data', id = '') {
        const dataType = getObjectType(target);

        target = ['array', 'object'].includes(dataType)
            ? target
            : { value: target };

        return new Proxy(target, SignalsEmitter.handler(name, target, id ? `${name}.${id}` : name));
    }

    static handler (name, data, descriptor = '') {
        const type = 'model' + (name ? `-${name}` : '');

        return {
            get (object, property) {
                const dataType = getObjectType(object[property]);

                if (property === '_isSignal') return true;

                // eslint-disable-next-line no-underscore-dangle
                if (['object', 'array'].includes(dataType) && !object[property]._isSignal) {
                    object[property] = new Proxy(
                        object[property],
                        SignalsEmitter.handler(name, data, descriptor + '.' + property)
                    );
                }

                return object[property];
            },
            set (object, property, value) {
                if (object[property] === value) return true;

                object[property] = value;
                emit(type, {
                    action:     'set',
                    descriptor: descriptor + '.' + property,
                    property,
                    value
                });

                return true;
            },
            deleteProperty (object, property) {
                delete object[property];
                emit(type, { property, value: object[property], action: 'delete' });

                return true;
            }
        };
    }

    getParentProxy (descriptor) {
        const props = descriptor.split('.');
        const parentDescriptor = props.slice(0, -1);

        return {
            proxy:    parentDescriptor.reduce((acc, curr) => this.proxy[curr], null),
            propName: props.pop()
        };
    }
}

export default SignalsEmitter;
