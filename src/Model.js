class Model {
    /**
     *
     * @param {Object} target - data object
     * @returns {Proxy} proxy model object
     */
    constructor (target) {
        this.eventGet = (descriptor) => { console.log(descriptor); };
        this.eventSet = (descriptor, value) => { console.log(descriptor, value); };
        this.handler = {
            get: (target, prop) => {
                this.eventGet(prop);

                return target[prop];
            },
            set: (target, prop, value) => {
                target[prop] = value;

                this.eventSet(prop, value);

                return true;
            }
        };

        this.target = target;
        this.proxy = new Proxy(this.target, this.handler);

        this.deepObserve('', this.proxy);
    }

    deepObserve (descriptor, proxy, parentIsArray = false) {
        const proxyKeys = Object.keys(proxy);

        proxyKeys.forEach((key) => {
            let childDescriptor = '';

            if (parentIsArray === true) {
                childDescriptor = descriptor !== '' ? `${descriptor}[${key}]` : key;
            } else {
                childDescriptor = descriptor !== '' ? `${descriptor}.${key}` : key;
            }

            if (Array.isArray(proxy[key])) {
                proxy[key] = this.createDeepObservableArray(childDescriptor, proxy[key]);

                this.deepObserve(childDescriptor, proxy[key], true);
            } else if (proxy[key] !== null && typeof proxy[key] === 'object') {
                proxy[key] = this.createDeepObservable(childDescriptor, proxy[key]);

                this.deepObserve(childDescriptor, proxy[key]);
            }
        });
    }

    createDeepObservableArray (descriptor, arr) {
        const handler = {
            get: (target, key) => {
                this.eventGet(`${descriptor}[${key}]`);

                return target[key];
            },
            set: (target, key, value) => {
                // const previousValue = target[key];
                target[key] = value;
                this.eventSet(`${descriptor}[${key}]`, value);

                return true;
            }
        };

        return new Proxy(arr, handler);
    }

    createDeepObservable (descriptor, obj) {
        console.log('descriptor', descriptor);
        const handler = {
            get: (target, key) => {
                const value = target[key];

                this.eventGet(`${descriptor}.${key}`);

                return value;
            },
            set: (target, key, value) => {
                // const previousValue = target[key];
                target[key] = value;
                this.eventSet(`${descriptor}.${key}`, value);

                console.log('WTF', descriptor, `${descriptor}.${key}`);

                return true;
            }
        };

        return new Proxy(obj, handler);
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

window.testModel = new Model({
    test:       123,
    backend:    423,
    testobject: {
        name: 'Name',
        user: 'User'
    },
    testarray: [{
        name: 'Timur'
    }]
});

export default Model;
