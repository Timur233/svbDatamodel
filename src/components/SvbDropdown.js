import SvbElement from "./SvbElement";

class SvbDropdown extends SvbElement {
    /**
     * 
     * @param {Object} options 
     * @param {Array<object>} options.list
     * @param {String} options.class
     * @param {String} options.position
     * @returns 
     */
    constructor(options) {
        super();

        this.state = {
            list:            options.list || [], // {title: '', value: ''}
            position:        options.position || 'bottom',
            classList:       options.class || '',
            activeItemIndex: -1,
            activeItem:      null,
        };

        this.init();

        return this.render();
    }

    init() {
        this.component = SvbElement.create('div', null, `svb-dropdown ${this.state.classList}`);
        this.list = SvbElement.create('div', null, 'svb-dropdown__list');

        this.eventClick = () => {};
        this.eventActive = () => {};
        this.eventShow = () => {};
        this.eventHide = () => {};
        this.eventLoad = () => {};

        this.component.utilityObject = this;
        this.defaultEvents();
    }

    defaultEvents() {
        this.event('click', this.list, (event) => {
            if (event.target.classList.contains('svb-dropdown__item')) {
                this.eventClick(event);

                this.hideDropdown();
            }
        });

        document.body.addEventListener('click', (event) => { // вот есть small проблем
            const path = event.path || (event.composedPath && event.composedPath());

            if (path && !path.includes(this.component.parentNode) && this.component.parentNode) {
                this.hideDropdown();
            }
        });
    }

    loadList(list = []) {
        this.state.list = list;

        this.eventLoad();
        this.clearActive();
        this.renderList();
    }

    showDropdown() {
        this.component.classList.add('svb-dropdown--open');
    }

    hideDropdown() {
        this.component.classList.remove('svb-dropdown--open');

        this.clearActive();
    }

    clearActive() {
        if (this.state.activeItem) this.state.activeItem.classList.add('svb-dropdown__item--active');

        this.state.activeItemIndex = -1;
        this.state.activeItem = null;
    }

    activateItem() {
        if (this.state.activeItem) this.state.activeItem.classList.remove('svb-dropdown__item--active');

        this.state.activeItem = Array.from(this.list.childNodes)[this.state.activeItemIndex];
        this.state.activeItem.classList.add('svb-dropdown__item--active');

        this.eventActive(this.state.activeItem);
    }

    prevItem() {
        if (this.state.activeItemIndex > 0) {
            this.state.activeItemIndex -= 1;

            this.activateItem();
        }
    }

    nextItem() {
        if (this.state.activeItemIndex < this.state.list.length - 1) {
            this.state.activeItemIndex += 1;

            this.activateItem();
        }
    }

    renderList() {
        this.clearComponent(this.list);

        this.state.list.forEach((item) => {
            const listItem = SvbElement.create('div', null, 'svb-dropdown__item');

            listItem.textContent = item.r;
            listItem.additionalInfo = item.additionalInfo;
            listItem.addAttributes({
                represent: item.r,
                value:     item.v,
            });

            this.list.appendChild(listItem);
        });
    }

    render() {
        this.component.appendChild(this.list);

        return this.component;
    }
}

export default SvbDropdown;