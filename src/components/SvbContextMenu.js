import SvbElement from './SvbElement';

class SvbContextMenu {
    constructor (workspace) {
        this.state = {
            workspace: workspace || document.querySelector('.svbWorkspace'),
            list:      []
        };

        this.init();
        this.publicMethods();

        return this.render();
    }

    init () {
        this.component = SvbElement.create('div', null, 'svbContext-menu');
        this.list = SvbElement.create('ul', null, 'svbContext-menu__list');

        this.component.getUtility = () => this;
    }

    publicMethods () {
        this.component.appendItem = this.appendItem.bind(this);
        this.component.appendItems = this.appendItems.bind(this);
        this.component.hide = this.hide.bind(this);
        this.component.show = this.show.bind(this);
        this.component.render = this.render.bind(this);
    }

    appendItem (item) {
        const findItem = this.state.list.find(mnItem => mnItem.id === item);

        if (findItem) {
            findItem.icon = item.icon;
            findItem.title = item.title;
            findItem.callback = item.callback;
            findItem.node = undefined;

            return;
        }

        this.state.list.push(item);
    }

    appendItems (items) {
        items?.forEach((item) => {
            this.appendItem(item);
        });

        this.renderList();
    }

    hideMethod () {
        this.hide();
    }

    hide () {
        this.component.style.left = '';
        this.component.style.top = '';

        this.component.classList.remove('svbContext-menu--show');

        document.removeEventListener('click', this.hideMethod.bind(this));
    }

    show (coords) {
        this.component.style.left = `${Math.round(coords.x)}px`;
        this.component.style.top = `${Math.round(coords.y)}px`;

        this.component.classList.add('svbContext-menu--show');

        document.addEventListener('click', this.hideMethod.bind(this));
    }

    renderItem (item) {
        const icon = SvbElement.create('span', null, 'svbContext-item__icon', item?.icon);
        const title = SvbElement.create('span', null, 'svbContext-item__text', item?.title);

        item.node = SvbElement.create('li', item?.id, 'svbContext-menu__item');

        if (item.icon) item.node.appendChild(icon);

        item.node.appendChild(title);
        item.node.addEventListener('click', () => {
            item.callback();
            this.hide();
        });

        return this.state.list;
    }

    renderList () {
        this.clearComponent(this.list);

        this.state.list.forEach((item) => {
            if (!item.node) this.renderItem(item);

            this.list.appendChild(item.node);
        });
    }

    render () {
        this.renderList();
        this.component.appendChild(this.list);
        this.state.workspace.appendChild(this.component);

        return this.component;
    }
}

export default SvbContextMenu;
