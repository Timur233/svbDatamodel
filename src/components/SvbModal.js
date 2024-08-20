import SvbElement from './SvbElement.js';

class SvbModal extends SvbElement {
    /**
     *
     * @param {string} title
     * @param {string | undefined} type
     * @param {HTMLElement | string | undefined} content
     * @param {HTMLElement | undefined} workspace
     */
    constructor (
        title,
        type = 'normal',
        content = null,
        workspace = document.querySelector('#content-block')
    ) {
        super();

        this.workspace = workspace || document.body;
        this.content = content;
        this.settings = {
            title:     title || '',
            type,
            isShow:    false,
            isMounted: false
        };

        this.init();
    }

    init () {
        this.component = SvbElement.create('div', null, `svb-modal svb-modal--type-${this.settings.type}`);
        this.wrapper = SvbElement.create('div', null,
            `svb-modal__wrapper svb-modal__wrapper--type-${this.settings.type}`);
        this.header = SvbElement.create('div', null, 'svb-modal__header');
        this.body = SvbElement.create('div', null, 'svb-modal__body');
        this.footer = SvbElement.create('div', null, 'svb-modal__footer');

        this.publicMethods();
        this.defaultEvents();
        this.render();
    }

    publicMethods () {
        this.component.getInstance = this.getInstance.bind(this);
        this.component.show = this.show.bind(this);
        this.component.hide = this.hide.bind(this);
        this.component.setTitle = this.setTitle.bind(this);
        this.component.setContent = this.setContent.bind(this);
        this.component.setFooter = this.setFooter.bind(this);
    }

    defaultEvents () {
        this.event('click', this.component, (event) => {
            if (event.target === this.component) this.hide();
        });
    }

    /**
     *
     * @param {string} title
     */
    setTitle (title) {
        this.settings.title = title;

        this.renderHeader();
    }

    /**
     *
     * @param {HTMLElement | string} content
     * @returns
     */
    setContent (content) {
        if (content instanceof HTMLElement) {
            this.body.appendChild(content);

            return;
        }

        if (typeof content === 'string') {
            const contentWrapper = SvbElement.create('div');

            contentWrapper.innerHTML = content;
            this.body.appendChild(contentWrapper);
        }
    }

    /**
     *
     * @param {HTMLElement | string} element
     * @returns
     */
    setFooter (element) {
        if (element instanceof HTMLElement) {
            this.footer.appendChild(element);
            this.footer.addStyles({ display: '' });

            return;
        }

        if (typeof element === 'string') {
            const contentWrapper = SvbElement.create('div');

            contentWrapper.innerHTML = element;
            this.footer.appendChild(contentWrapper);
            this.footer.addStyles({ display: '' });
        }
    }

    show () {
        if (!this.settings.isMounted) {
            this.workspace.appendChild(this.component);
            this.settings.isMounted = true;
        }

        setTimeout(() => {
            document.body.style.overflow = 'hidden';
            this.component.classList.add('svb-modal--show');
        }, 200);
    }

    hide () {
        document.body.style.overflow = '';
        this.component.classList.remove('svb-modal--show');

        setTimeout(() => {
            this.component.remove();
            this.settings.isMounted = false;
        }, 200);
    }

    renderHeader () {
        const title = SvbElement.create('span', null, 'svb-modal__title', this.settings.title);
        const closeButtton = SvbElement.create('button', null, 'svb-modal__close-btn', `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 5L12 12M12 12L19 19M12 12L19 5M12 12L5 19" 
                stroke="#9CA3AF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
        `);

        closeButtton.addEventListener('click', () => {
            this.component.hide();
        });

        this.clearComponent(this.header);
        this.header.appendChild(title);
        this.header.appendChild(closeButtton);
    }

    renderBody () {
        this.setContent(this.content);
    }

    renderFooter () {
        this.footer.addStyles({ display: 'none' });
    }

    render () {
        this.renderHeader();
        this.renderBody();
        this.renderFooter();

        this.wrapper.appendChild(this.header);
        this.wrapper.appendChild(this.body);
        this.wrapper.appendChild(this.footer);
        this.component.appendChild(this.wrapper);
    }
}

export default SvbModal;
