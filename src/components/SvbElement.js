import SvbContextMenu from './SvbContextMenu';

class SvbElement {
    constructor () {
        this.showContext = true;
        this.contextComponent = null;
    }

    event (eventName = '', element = null, fn = null) {
        if (element && fn && eventName) {
            this.component.addEventListener(eventName, (event) => {
                const path = event.path || (event.composedPath && event.composedPath());

                if (path && path.includes(element)) {
                    fn(event);
                }
            });
        }
    }

    addEvent (eventName, element, fn) {
        this.event(eventName, element, fn);
    }

    setContextMenu (workspace, menuItems, createEvent = false) {
        this.contextComponent = new SvbContextMenu(workspace);
        this.contextComponent.appendItems(menuItems);

        if (createEvent) {
            this.event('contextmenu', this.component, (event) => {
                event.preventDefault();

                this.contextComponent.show({ x: event.clientX, y: event.clientY });
            });
        }

        return this.contextComponent;
    }

    clearComponent (component = this.component) {
        while (component.firstChild) {
            component.removeChild(component.firstChild);
        }
    }

    showLoader () {
        if (this.mainPreloader) return;

        this.mainPreloader = SvbElement.create(
            'div',
            null,
            'preloader',
            '<div class="preloader__img"><img src="img/preloader.png"></div>'
        );

        this.component.append(this.mainPreloader);
    }

    hideLoader () {
        this.mainPreloader.remove();
        this.mainPreloader = null;
    }

    getInstance () {
        return this;
    }

    static deepCopy (object) {
        if (typeof object === 'object' && object !== null) {
            const copy = Array.isArray(object) ? [] : {};

            Object.keys(object).forEach((key) => {
                copy[key] = SvbElement.deepCopy(object[key]);
            });

            return copy;
        }

        return object;
    }

    static create (tagName, id, classList, html) {
        const el = document.createElement(tagName);

        el.id = id || '';
        el.classList = classList || '';
        el.innerHTML = html || '';

        el.addStyles = SvbElement.addStyles;
        el.addAttributes = SvbElement.addAttributes;
        el.addEvent = SvbElement.addEvent;

        return el;
    }

    static addStyles (stylesObj = {}) {
        if (!stylesObj && !(typeof user === 'object')) return;

        Object.keys(stylesObj).forEach((key) => {
            this.style[key] = stylesObj[key];
        });
    }

    static addAttributes (object = {}) {
        if (!object && !(typeof user === 'object')) return;

        Object.keys(object).forEach((key) => {
            this.setAttribute(`data-${[key]}`, object[key]);
        });
    }

    static addEvent (eventName, fn = () => {}) {
        if (!eventName || !(this instanceof HTMLElement)) return;

        this.utilityObject.addEvent(eventName, this, fn);
    }

    // разобраться с айди в контексте
    static debounce (fn, wait = 250, thenFn = () => {}) {
        return (...args) => {
            clearTimeout(this.t);
            this.t = setTimeout(() => fn.apply(this, args)?.then(thenFn), wait);
        };
    }
}

export default SvbElement;
