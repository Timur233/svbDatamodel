/* global: SvmChat, SvmFormatter */
'use strict';

class SVMessages {
    /**
     *
     * @param {Object} options - messanger params
     * @param {String} options.descriptor - Entry descriptor
     * @param {String} options.objectUuid - Entry uuid
     * @param {String} options.userUuid - User uuid
     * @param {String} [options.apiURL] - Api url
     * @param {Array} [filters]
     */
    constructor (options, filters = []) {
        this.options = {
            apiURL:     options?.apiURL || 'https://raafgroup.kz/kz/svm',
            descriptor: options?.descriptor || null,
            entryUuid:  options?.objectUuid || null,
            userUuid:   options?.userUuid || null
        };

        this.chatId = '';
        this.filters = []; // filters ???
        this.messages = [];
        this.members = [];

        this.lifeCircleEvents();

        if (this.errorsHandler()) this.init();
    }

    get messenger () {
        return this?.chatComponent?.component || null;
    }

    errorsHandler () {
        let chatIsReadyToInit = true;

        if (this.options.descriptor === null) {
            console.warn('Не возможно инициализировать чат, не указан descriptor');

            chatIsReadyToInit = false;
        }

        if (this.options.entryUuid === null) {
            console.warn('Не возможно инициализировать чат, не указан objectUuid');

            chatIsReadyToInit = false;
        }

        if (this.options.userUuid === null) {
            console.warn('Инициализирован чат только для просмотра, так как не указан userUuid');
        }

        return chatIsReadyToInit;
    }

    lifeCircleEvents () {
        this.beforeInit = () => {};
        this.beforeLoadData = () => {};
        this.beforeRender = () => {};
        this.afterRender = () => {};
        this.afterLoadData = () => {};
        this.afterInit = () => {};
    }

    async init () {
        await this.beforeInit.apply(this);
        await this.beforeLoadData.apply(this);

        await this.getChatData();
        await this.getChatMembers();
        await this.renderChat();

        await this.afterLoadData.apply(this);
        await this.afterInit.apply(this);
    }

    async renderChat () {
        this.subscribersSelector = null;
        this.chatComponent = new SvmChat();
        this.chatComponent.loadMessages(this.messages);
        this.chatComponent.getInstance().sendMethod = (messageObject) => {
            let selectedSubscribersList = [];
            const widgetInstance = this.chatComponent.getInstance();
            const sendButtonClick = () => {
                this.sendMessage(selectedSubscribersList, messageObject.value)
                    .then(() => {
                        this.subscribersSelector.remove();
                    });
            };
            const renderList = (subscribers = []) => {
                const wrapper = SvmElement.create('div', null, 'svm-widget__list subscribers');
                const title = SvmElement.create('span', null, 'subscribers__title');
                const checkButtons = SvmElement.create('div', null, 'subscribers__check');
                const subscribersList = SvmElement.create('ul', null, 'subscribers__list');
                const sendButtons = SvmElement.create('div', null, 'subscribers__buttons');

                title.textContent = 'Отпровить уведомление';

                checkButtons.selectAll = SvmElement.create('a', null, 'select-all', 'Выделить все');
                checkButtons.selectAll.addEventListener('click', () => {
                    const items = subscribersList.querySelectorAll('label');

                    items.forEach((item) => {
                        const check = item.querySelector('input');

                        check.checked = true;
                    });
                });
                checkButtons.unselectAll = SvmElement.create('a', null, 'unselect-all', 'Снять все');
                checkButtons.unselectAll.addEventListener('click', () => {
                    const items = subscribersList.querySelectorAll('label');

                    items.forEach((item) => {
                        const check = item.querySelector('input');

                        check.checked = false;
                    });
                });

                checkButtons.appendChild(checkButtons.selectAll);
                checkButtons.appendChild(checkButtons.unselectAll);

                subscribers.forEach((subscriber) => {
                    const li = SvmElement.create('label', null, 'subscribers__list-item');
                    const input = SvmElement.create('input');
                    const span = SvmElement.create('span');
                    const note = subscriber?.note && subscriber?.note !== ''
                        ? `<span class="note">${subscriber.note}</span>`
                        : '';

                    input.id = `sub_${subscriber.uuid}`;
                    input.value = subscriber.uuid;
                    input.type = 'checkbox';
                    input.classList = 'subscribers__list-input';

                    span.classList = 'subscribers__list-user-name';
                    span.innerHTML = `<span>${subscriber.represent}</span> ${note}`;

                    li.for = `sub_${subscriber.uuid}`;
                    li.appendChild(input);
                    li.appendChild(span);

                    subscribersList.appendChild(li);
                });

                subscribersList.addEventListener('change', (e) => {
                    const element = e.target;

                    if (element && element.classList.contains('subscribers__list-input')) {
                        e.stopPropagation();

                        if (!element?.checked) {
                            selectedSubscribersList = selectedSubscribersList.filter(i => i !== element.value);
                        } else {
                            selectedSubscribersList.push(element.value);
                        }
                    }
                });

                sendButtons.send = SvmElement.create(
                    'button', null,
                    'svmButton svmButton--svm-send-btn',
                    `<svg xmlns="http://www.w3.org/2000/svg" width="10" fill="green" viewBox="0 0 448 512">
                     <path d="M438.6 105.4c12.5 12.5 12.5 32.8 0 45.3l-256 256c-12.5 
                     12.5-32.8 12.5-45.3 0l-128-128c-12.5-12.5-12.5-32.8 0-45.3s32.8-12.5 45.3 
                     0L160 338.7 393.4 105.4c12.5-12.5 32.8-12.5 45.3 0z"/></svg> Отправить`);
                sendButtons.send.onclick = sendButtonClick;
                sendButtons.appendChild(sendButtons.send);

                sendButtons.cancel = SvmElement.create(
                    'button', null,
                    'svmButton svmButton--svm-send-btn',
                    `<svg xmlns="http://www.w3.org/2000/svg" width="10" fill="red" viewBox="0 0 384 512">
                     <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 
                     86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 
                     361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 
                     12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/></svg> Отменить`);
                sendButtons.cancel.onclick = () => { wrapper.remove(); };
                sendButtons.appendChild(sendButtons.cancel);

                wrapper.appendChild(title);
                wrapper.appendChild(checkButtons);
                wrapper.appendChild(subscribersList);
                wrapper.appendChild(sendButtons);

                return wrapper;
            };

            if (this.subscribersSelector) {
                this.subscribersSelector.remove();
            }

            this.subscribersSelector = renderList(this.members);
            widgetInstance.message.appendChild(this.subscribersSelector);
        };

        if (this.options.userUuid === null) {
            this.chatComponent.message.remove();
            this.chatComponent.getInstance().sendMethod = () => {};
        }
    }

    sendMessage (subscribers, messageBody) {
        console.log(subscribers);

        return this.actionSendMessage('text', messageBody)
            .then(() => {
                this.getChatData()
                    .then(() => {
                        this.chatComponent.loadMessages(this.messages);
                        this.chatComponent.dialog.querySelector('.wgt-dialog__messages').scrollTop =
                            this.chatComponent.dialog.querySelector('.wgt-dialog__messages').scrollHeight;
                    });
            });
    }

    getChatMembers () {
        return this.actionGetMembers().then((res) => {
            if (!res?.status) return;

            const { result } = res;

            /**
             * members - массив участников чата
             * members.uuid, members.represent, members.note
             */

            this.members = result.map((item) => {
                return {
                    uuid:      item?.user?.uuid || '',
                    represent: item?.individual?.represent || '',
                    note:      item?.position?.represent || ''
                };
            });
        });
    }

    getChatData (filters = []) {
        return this.actionGetChat(filters).then((res) => {
            if (!res?.status) return;

            const { result, filters } = res;

            /**
             * chatId - uuid чата
             * filters - массив фильтров (ввиде svb фильтров)
             * messages - массив сообщений
             * messages.uuid,
             * messages.author - автор { r: '', v: '' },
             * messages.body - текст сообщения
             * messages.date - дата
             */

            this.filters = filters || [];
            this.messages = result.map((item) => {
                return {
                    uuid:            item.message?.uuid || '',
                    authorFirstname: item.sender?.individual?.firstname || '',
                    authorSurname:   item.sender?.individual?.surname || '',
                    author:          {
                        v: item.sender?.user?.uuid || '',
                        r: `${item.sender?.individual?.firstname || ''} ${item.sender?.individual?.surname || ''}`
                    },
                    type: {
                        r: item.type?.represent || '',
                        v: item.type?.uuid || '',
                        c: item.type?.code || ''
                    },
                    body: item.message?.text || '',
                    date: item.message?.sendtime || null,
                    my:   item.sender?.user?.uuid === this.options.userUuid
                };
            });
        });
    }

    actionGetChat () {
        return fetch(this.options.apiURL, {
            method:  'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                type:       'message',
                action:     'getObjectMessages',
                reqoptions: {
                    object: {
                        type: this.options.descriptor,
                        uuid: this.options.entryUuid
                    }
                }
            })
        })
            .then(response => response.json());
    }

    actionGetMembers () {
        return fetch(this.options.apiURL, {
            method:  'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                type:       'message',
                action:     'getObjectUsers',
                reqoptions: {
                    object: {
                        type: this.options.descriptor,
                        uuid: this.options.entryUuid
                    }
                }
            })
        })
            .then(response => response.json());
    }

    actionSendMessage (messageType, messageBody) {
        return fetch(this.options.apiURL, {
            method:  'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                type:       'message',
                action:     'sendMessage',
                reqoptions: {
                    sender: { user: this.options.userUuid },
                    object: {
                        type: this.options.descriptor,
                        uuid: this.options.entryUuid
                    },
                    process: {
                        code: 'ptest',
                        uuid: '00000000-0000-0000-0000-000000000000'
                    },
                    msg: {
                        type: messageType,
                        text: messageBody
                    }
                }
            })
        })
            .then(response => response.json());
    }
}

class SvmFormatter {
    static init (viewSetting, value) {
        const valueType = ((md, vset) => {
            if (md.type === 'numeric') return 'numeric';

            if (md.type === 'date') return 'date';

            if (md.type === 'timestamp') return 'timestamp';

            if (md.type === 'boolean') return 'boolean';

            if (md.type === 'catalog' ||
                md.type === 'system' ||
                md.type === 'document' ||
                md.type === 'doctable') return 'catalog';

            if (md.type === 'text' && vset.multiline) return 'textarea';

            return 'text';
        })(viewSetting.md, viewSetting.vset);

        switch (valueType) {
            case 'numeric':
                return SvmFormatter.numeric(
                    value,
                    Number(viewSetting?.vset?.precision || 2),
                    viewSetting?.vset?.nullswap || null
                );

            case 'textarea':
                return SvmFormatter.textarea(value);

            case 'date':
                return SvmFormatter.date(value);

            case 'timestamp':
                return SvmFormatter.timestamp(value);

            case 'boolean':
                return SvmFormatter.boolean(value);

            case 'catalog':
                return SvmFormatter.catalog(value);

            default:
                return SvmFormatter.text(value);
        }
    }

    static numeric (value, precision, nullswap = null) {
        if (value !== null && value !== undefined && value !== 'Infinity') {
            const response = String(value).replace(',', '.').replaceAll(' ', '');
            const splited = response.split('.');
            const prefix = String(value).indexOf('-') >= 0 ? '-' : '';
            const sides = {
                left:  splited[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ') || `${prefix}0`,
                right: splited[1] ? `${splited[1]}0000`.substring(0, precision) : '0'.repeat(precision)
            };

            if ((nullswap !== null && nullswap !== undefined) && Number(value) === 0) {
                return nullswap;
            }

            return `${sides.left}${sides.right ? `.${sides.right}` : ''}`;
        }

        return (nullswap === null || nullswap === undefined) ? '0.00' : nullswap;
    }

    static date (value) {
        if (value) {
            const date = new Date(value);
            const dateObject = {
                day:   date.getDate().toString().padStart(2, '0'),
                month: (date.getMonth() + 1).toString().padStart(2, '0'),
                year:  date.getFullYear().toString().padStart(4, '0')
            };

            return `${dateObject.day}.${dateObject.month}.${dateObject.year}`;
        }

        return value;
    }

    static timestamp (value) {
        if (value) {
            const date = new Date(value);
            const dateObject = {
                day:    date.getDate().toString().padStart(2, '0'),
                month:  (date.getMonth() + 1).toString().padStart(2, '0'),
                year:   date.getFullYear().toString().padStart(4, '0'),
                hour:   date.getHours().toString().padStart(2, '0'),
                minute: date.getMinutes().toString().padStart(2, '0'),
                second: date.getSeconds().toString().padStart(2, '0')
            };

            return `${dateObject.day}.${dateObject.month}.${dateObject.year} ${
                dateObject.hour}:${dateObject.minute}:${dateObject.second}`;
        }

        return value;
    }

    static boolean (value) {
        if (value !== null && value !== undefined) {
            if (value === true) {
                return '<i class="fa-solid fa-check"></i>';
            }

            return '<i class="fa-solid fa-xmark"></i>';
        }

        return value;
    }

    static textarea (value) {
        if (value) {
            return value.replaceAll('\n', '<br>');
        }

        return value;
    }

    static catalog (value) { return value.r; }

    static text (value) { return value; }
}

class SvmElement {
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

    clearComponent (component = this.component) {
        while (component.firstChild) {
            component.removeChild(component.firstChild);
        }
    }

    showLoader () {
        if (this.mainPreloader) return;

        this.mainPreloader = SvmElement.create(
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

    static create (tagName, id, classList, html) {
        const el = document.createElement(tagName);

        el.id = id || '';
        el.classList = classList || '';
        el.innerHTML = html || '';

        el.addStyles = SvmElement.addStyles;
        el.addAttributes = SvmElement.addAttributes;
        el.addEvent = SvmElement.addEvent;

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
}

class SvmToolbar extends SvmElement {
    /**
     *
     * @param {Object} options - component settings
     * @param {String} options.classList - component classes
     * @returns {HTMLElement}
     */
    constructor (options) {
        super();

        this.state = {
            classList: options?.classList || false,
            buttons:   [],
            tools:     []
        };

        this.init();
        this.publicMethods();
        this.render();
    }

    init () {
        this.component = SvmElement.create('div', null, `svm-toolbar ${this.state.classList}`);
    }

    publicMethods () {
        this.component.addButtons = this.addButtons.bind(this);
        this.component.addButton = this.addButton.bind(this);
        this.component.removeButton = this.removeButton.bind(this);
        this.component.getButton = this.checkButton.bind(this);
        this.component.addTool = this.addTool.bind(this);
    }

    clear () {
        this.clearComponent(this.component);
    }

    /**
     *
     * @param {any} id - Button id
     * @returns {Object} - Button data
     */
    checkButton (id) {
        return this.state.buttons.find(btn => btn.id === id);
    }

    /**
     *
     * @param {Object} options - button params
     * @param {string} options.id - button id
     * @param {string} options.classList - button classList
     * @param {string} options.text - button caption
     * @param {string} options.hint - button hint
     * @param {Function} options.event - button callback
     * @returns {Object} Button options and node
     */
    addButton (options) {
        if (options.id &&
            this.checkButton(options.id)) return this.checkButton(options.id);

        const buttonId       = options.id || null;
        const buttonClass    = options.classList || 'svmButton';
        const buttonTitle    = options.text || '';
        const buttonCallback = options?.event || (() => {});
        const buttonHint     = options?.hint || '';
        const buttonNode     = SvmElement.create(
            'button', buttonId, buttonClass, buttonTitle);
        const countButtons   = this.state.buttons.length;

        buttonNode.addEventListener('click', buttonCallback);
        buttonNode.title = buttonHint;

        if (countButtons > 0) {
            const lastButton = this.state.buttons[countButtons - 1].node;

            lastButton.after(buttonNode);
        } else {
            this.component.appendChild(buttonNode);
        }

        this.state.buttons.push({ ...options, node: buttonNode });

        return { ...options, node: buttonNode };
    }

    /**
     *
     * @param {any} buttonId - Button id
     */
    removeButton (buttonId) {
        if (buttonId) {
            const button = this.state.buttons.find(btnItem => btnItem.id === buttonId);

            if (button) {
                button.node.remove();

                this.state.buttons = this.state.buttons.filter(btnItem => btnItem.id !== buttonId);
            }
        }
    }

    /**
     *
     * @param {Array} buttons
     * @param {Object} buttons[] - button params
     * @param {string} buttons[].id - button id
     * @param {string} buttons[].classList - button classList
     * @param {string} buttons[].text - button caption
     * @param {string} buttons[].hint - button hint
     * @param {Function} buttons[].event - button callback
     * @returns {Object} Button options and node
     */
    addButtons (buttons) {
        Array.from(buttons).forEach((btn) => { this.addButton(btn); });
    }

    /**
     *
     * @param {HTMLElement} node - Node Element
     * @returns {HTMLElement} node
     */
    addTool (node) {
        const toolWrapper = SvmElement.create('div', null, 'svm-toolbar__tool', null);

        try {
            toolWrapper.appendChild(node);
        } catch {
            toolWrapper.innerHTML = node;
        }

        this.state.tools.push(toolWrapper);
        this.component.appendChild(toolWrapper);

        return toolWrapper;
    }

    render () {
        return this.component;
    }
}

class SvmChat extends SvmElement {
    constructor (options) {
        super();

        this.state = {
            title:     options?.title || '',
            showFiles: options?.showFiles || false,
            messages:  [],
            value:     ''
        };

        this.init();
        this.publicMethods();
        this.render();
    }

    init () {
        this.component = SvmElement.create('div', null, 'svm-widget', null);
        this.wrapper = SvmElement.create('div', null, 'svm-widget__wrapper', null);
        this.header = SvmElement.create('div', null, 'svm-widget__header wgt-header', null);
        this.dialog = SvmElement.create('div', null, 'svm-widget__dialog wgt-dialog', null);
        this.controll = new SvmToolbar();
        this.message = SvmElement.create('div', null, 'svm-widget__mess wgt-mess', null);
        this.fileButton = SvmElement.create('button', null, 'wgt-mess__btn wgt-mess__btn--file');
        this.messageField = SvmElement.create('textarea', null, 'wgt-mess__text-field');
        this.sendButton = SvmElement.create('button', null, 'wgt-mess__btn wgt-mess__btn--send');

        this.uploadMethod = () => {};
        this.sendMethod = () => {};
        this.sendEvent = () => {};
        this.loadMethod = (payload = []) => payload.map((item) => {
            return {
                uuid:       item?.uuid || '',
                authorName: item?.author?.r || '',
                authorUuid: item?.author?.v || '',
                body:       item?.body || '',
                isMy:       item?.my || false,
                date:       item?.date ? SvmFormatter.timestamp(item.date) : ''
            };
        });

        this.messageThemplate = {
            name: 'Автор',
            body: 'Сообщение',
            date: '03.02.2021 14:54:10',
            isMy: 'false или true'
        };

        this.defaultEvents();
    }

    publicMethods () {
        this.component.addButton = this.addButton.bind(this);
        this.component.addButtons = this.addButtons.bind(this);
        this.component.removeButton = this.removeButton.bind(this);
        this.component.addTool = this.addTool.bind(this);

        this.component.loadMessages = this.loadMessages.bind(this);
        this.component.sendMessage = this.sendMessage.bind(this);
        this.component.render = this.render.bind(this);
    }

    defaultEvents () {
        this.event('input', this.messageField, () => {
            const textarea = this.message.querySelector('textarea');
            const lineHeight = parseInt(window.getComputedStyle(textarea).lineHeight, 10);
            const paddingTop = parseInt(window.getComputedStyle(textarea).paddingTop, 10);
            const paddingBottom = parseInt(window.getComputedStyle(textarea).paddingBottom, 10);

            const contentHeight = textarea.scrollHeight - paddingTop - paddingBottom;
            const lines = Math.floor(contentHeight / lineHeight);

            this.state.value = textarea.value;

            if (lines > 2) {
                textarea.addStyles({ height: '56px' });

                return;
            }

            textarea.addStyles({ height: '' });
        });

        this.event('keydown', this.messageField, (event) => {
            if (event.keyCode === 13 && event.shiftKey) {
                event.stopPropagation();
                event.preventDefault();

                this.sendMessage();
            }
        });

        this.event('click', this.sendButton, () => {
            if (this.state.value !== '') this.sendMessage();
        });
    }

    sendMessage () {
        const res = this.sendMethod({ value: this.state.value, file: {} });

        if (Promise.resolve(res) === res) {
            res.then((data) => {
                this.messageField.value = '';
                this.sendEvent();
            });

            return;
        }

        this.messageField.value = '';
        this.sendEvent();
    }

    addButton (options) {
        const button = {
            ...options,
            classList: options?.classList
                ? `${options.classList} wgt-controll__btn`
                : 'wgt-controll__btn'
        };

        this.controll.utilityObject.addButton(button);
        this.renderControll();
    }

    addButtons (options) {
        const buttons = options.map(item => ({
            ...item,
            classList: item?.classList
                ? `${item.classList} wgt-controll__btn`
                : 'wgt-controll__btn'
        }));

        this.controll.utilityObject.addButtons(buttons);
        this.renderControll();
    }

    addTool (options) {
        const tool = this.controll.utilityObject.addTool(options);

        tool.addStyles({ flex: '0 0 auto' });

        this.renderControll();
    }

    removeButton (id) {
        this.controll.utilityObject.removeButton(id);

        this.renderControll();
    }

    loadMessages (messages) {
        this.state.messages = this.loadMethod(messages);

        this.renderDialog();
    }

    renderHeader () {
        this.clearComponent(this.header);
        this.header.appendChild(this?.controll.component);
    }

    renderDialog () {
        const dialogWrapper = SvmElement.create('div', null, 'wgt-dialog__messages');
        const scrollButton = SvmElement.create('button', null, 'wgt-dialog__messages', `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                <path d="
                    M374.6 310.6l-160 160C208.4 476.9 200.2 480 192 
                    480s-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 
                    0-45.25s32.75-12.5 45.25 0L160 370.8V64c0-17.69 14.33-31.1 
                    31.1-31.1S224 46.31 224 64v306.8l105.4-105.4c12.5-12.5 32.75-12.5 
                    45.25 0S387.1 298.1 374.6 310.6z
                "></path>
            </svg>
        `);

        this.clearComponent(this.dialog);

        this.state.messages.forEach((item) => {
            const side = item.isMy ? 'right' : 'left';
            const message = SvmElement.create(
                'div',
                null,
                `wgt-dialog__chat-item wgt-chat-item wgt-chat-item--${side}`,
                `
                    <span class="wgt-chat-item__name" data-author-uuid="${item?.authorUuid || ''}">
                        ${item.authorName}
                    </span>
                    <div class="wgt-chat-item__body">
                        ${item.body}
                    </div>
                    <span class="wgt-chat-item__date">
                        ${item.date}
                    </span>
                `
            );

            message.addAttributes({ uuid: item?.uuid || '' });

            dialogWrapper.appendChild(message);
        });

        scrollButton.addStyles({ display: 'none' });

        this.dialog.appendChild(dialogWrapper);
        this.dialog.appendChild(scrollButton);
    }

    renderControll () {
        const controll = this.controll.getInstance();

        if (controll.state.buttons.length === 0 && controll.state.tools.length === 0) {
            this.controll.component.addStyles({ display: 'none' });
            this.header.addStyles({ display: 'none' });

            return;
        }

        this.controll.component.addStyles({
            display: ''
        });
    }

    renderMessage () {
        this.fileButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
                <path d="
                    M380.7 67.31C351.6 38.22 304.4 38.22 275.3 67.31L83.31 
                    259.3C36.54 306.1 36.54 381.9 83.31 428.7C130.1 475.5 205.9 
                    475.5 252.7 428.7L404.7 276.7C410.9 270.4 421.1 270.4 427.3 
                    276.7C433.6 282.9 433.6 293.1 427.3 299.3L275.3 451.3C216 
                    510.6 119.1 510.6 60.69 451.3C1.417 392 1.418 295.1 60.69 
                    236.7L252.7 44.69C294.3 3.092 361.7 3.092 403.3 44.69C444.9 
                    86.28 444.9 153.7 403.3 195.3L219.5 379.1C191.3 407.3 144.9 
                    404.7 119.1 373.6C98.67 346.1 100.8 308.6 124.9 284.5L276.7 
                    132.7C282.9 126.4 293.1 126.4 299.3 132.7C305.6 138.9 305.6 
                    149.1 299.3 155.3L147.5 307.1C134.1 319.7 133.8 339.7 144.1 
                    353.6C157.1 369.8 182.2 371.2 196.9 356.5L380.7 172.7C409.8 
                    143.6 409.8 96.41 380.7 67.31L380.7 67.31z"></path>
            </svg>
        `;
        this.fileButton.addStyles({
            display: this.state.showFiles ? 'block' : 'none'
        });

        this.messageField.setAttribute('placeholder', 'Введите сообщение...');
        this.messageField.setAttribute('rows', '1');

        this.sendButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
            <path d="
                M511.1 255.1c0 12.8-7.625 24.38-19.41 29.41L44.6 477.4c-4.062 1.75-8.344 2.594-12.59 
                2.594c-8.625 0-17.09-3.5-23.28-10.05c-9.219-9.766-11.34-24.25-5.344-36.27l73.66-147.3l242.1-30.37L77.03 
                225.6l-73.66-147.3C-2.623 66.3-.4982 51.81 8.72 42.05c9.25-9.766 23.56-12.75 35.87-7.453L492.6 
                226.6C504.4 231.6 511.1 243.2 511.1 255.1z"></path>
            </svg>
        `;
        this.sendButton.title = 'Нажмите shift + enter, что бы отправить сообщение';

        this.message.appendChild(this.fileButton);
        this.message.appendChild(this.messageField);
        this.message.appendChild(this.sendButton);
    }

    render () {
        this.clearComponent(this.wrapper);
        this.renderHeader();
        this.renderDialog();
        this.renderControll();
        this.renderMessage();

        if (this.header.children[0]) this.wrapper.appendChild(this.header);

        this.wrapper.appendChild(this.dialog);
        this.wrapper.appendChild(this.message);

        this.component.appendChild(this.wrapper);

        return this.component;
    }
}

export default SVMessages;
