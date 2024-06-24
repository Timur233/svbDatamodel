/* global SvbInput, SvbTable, createSVBEL  */
import Model from './Model';

class DataModel {
    constructor (object) {
        const { computed, data, watch, methods } = object;

        this.components = [];
        this.listeners = [];

        this.component = new SvbInput({ md: { type: 'text' }, vset: { readOnly: false } });
        this.component.utilityObject.eventChange = () => {
            this.proxy.param = this.component.getInputValue();
        };

        this.model = new Model(data());
        this.model.eventSet = this.setHandler.bind(this);

        this.proxy = this.model.proxy;

        if (methods) {
            Object.keys(methods).forEach((key) => {
                this.proxy[key] = methods[key];
            });
        }
    }

    setHandler (descriptor, value) {
        console.log(1);
        this.listeners.forEach(fn => fn(descriptor, value));
    }

    getParentProxy (descriptor) {
        const props = descriptor.match(/[^.\[\]]+/g);
        const parentDescriptor = props.slice(0, -1);

        console.log('input proxy', descriptor, {
            proxy:    parentDescriptor.reduce((acc, curr) => this.proxy[curr], null) || this.proxy,
            propName: props.pop()
        });

        return {
            proxy:    parentDescriptor.reduce((acc, curr) => this.proxy[curr], null) || this.proxy,
            propName: props.pop()
        };
    }

    createComponent (element) {
        this.components.push({
            descriptor: '',
            element:    '',
            value:      ''
        });
    }

    input (descriptor) {
        const { proxy, propName } = this.getParentProxy(descriptor);
        const element = new SvbInput({ md: { type: 'text' }, vset: { readOnly: false } });

        element.setValue(proxy[propName]);
        element.utilityObject.eventChange = () => {
            console.log(proxy, propName, proxy[propName ]);
            proxy[propName] = element.getInputValue();
        };

        this.listeners.push((prop, value) => {
            if (prop === propName) {
                element.setValue(value);
            }
        });

        return element;
    }

    table (propName) {
        const element = new SvbTable();

        element.loadRows({
            // eslint-disable-next-line max-len
            headers: this.proxy.attributes,
            rows:    this.proxy[propName]
        });

        element.utilityObject.eventChange = (row, param, value) => {

        };

        element.addStyles({ height: '400px' });

        return element;
    }

    html (descriptor, render) {
        const { proxy, propName } = this.getParentProxy(descriptor);
        const element = createSVBEL('div');

        element.innerHTML = render.apply(this.proxy);

        element.setValue = () => {
            element.innerHTML = render.apply(this.proxy);
        };

        this.listeners.push((prop, value) => {
            if (prop === propName) {
                element.setValue(value);
            }
        });

        return element;
    }

    custom (descriptor, render) {
        const { proxy, propName } = this.getParentProxy(descriptor);
        const element = render.apply(this.proxy);

        element.eventChange = () => {
            proxy[propName] = element.getInputValue();
        };

        this.listeners.push((prop, value) => {
            if (prop === propName) {
                element.setValue(value);
            }
        });

        return element;
    }

    render (value) {
        //         const svbWindow = document.body.querySelector('.svbWindow');

        //         if (!svbWindow) return;

        //         svbWindow.innerHTML = `

        //         <div id="" class="svbWindow__head">
        //             <div id="" class="svbTitle">
        //                 <span id="" class="svbTitle__content">Proxy playground</span>
        //             </div>
        //         </div>
        //         <div id="" class="svbWindow__body">
        //             <div id="" class="svbPanel svbPanel__wrapper">
        //                 <div id="" class="svbPanel__body">
        // <pre>
        // ${JSON.stringify(this.proxy, null, 2)}
        // </pre>
        //                 </div>
        //             </div>
        //         </div>

        // `;

        //         console.log('render', this.target);
        //         this.component.setValue(value);
    }
}

class InstanceDM extends DataModel {
    constructor () {
        super({});
    }
}

export { DataModel, InstanceDM };
