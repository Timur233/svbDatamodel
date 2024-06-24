/* global: SvbToolBar */
'use strict';

import SVMessages from './svm.js';

class SVP {
    /**
     *
     * @param {Object} options
     * @param {String} option.descriptor
     * @param {String} option.uuid
     * @param {String} option.apiURL
     *
     * @param {Object} user
     * @param {String} user.represent
     * @param {String} user.uuid
     *
     * @param {Object} user.position
     * @param {String} user.position.uuid
     * @param {String} user.position.represent
     * @param {String} user.position.code
     */
    constructor (options, user) {
        this.stopInit = false;
        this.settings = {
            apiURL:          options?.apiURL || 'https://raafgroup.kz/kz/svp',
            messengerApiURL: options?.messengerAPI || 'https://raafgroup.kz/kz/svm',
            descriptor:      options?.descriptor || null,
            uuid:            options?.uuid || null,
            btnClass:        options?.buttonsClass || 'svbButton'
        };

        this.user = {
            session:   user?.session || null,
            uuid:      user?.uuid || null,
            represent: user?.represent || null,
            position:  {
                represent: user?.represent?.represent || null,
                uuid:      user?.position?.uuid || null,
                code:      user?.position?.code || null
            }
        };

        this.hasProcess = false;
        this.processes = [];
        this.actions = [];

        this.lifeCircleEvents();
    }

    get buttons () {
        return this.actions.map(item => item.button);
    }

    lifeCircleEvents () {
        this.beforeInitModule = () => {};
        this.beforeLoad = () => {};
        this.afterLoad = () => {};
        this.afterInitModule = () => {};
    }

    async initModule () {
        let checkProcess = null;

        await this.beforeInitModule.apply(this);
        await this.beforeLoad.apply(this);

        checkProcess = await this.checkProcess()
            .catch((error) => {
                this.stopInit = true;

                console.log(error);
            });

        if (this.hasProcess) {
            console.log('it is hasnt process');
        } else {
            this.runInitProcess(checkProcess.initActions);
        }

        if (this.stopInit) return;

        // await this.initSvpMessenger();

        await this.afterLoad.apply(this);
        await this.afterInitModule.apply(this);
    }

    async initSvpMessenger () {
        this.svpMessenger = await new SVMessages({
            descriptor: this.settings.descriptor,
            objectUuid: this.settings.uuid,
            userUuid:   this.user.uuid,
            apiURL:     this.messengerApiURL
        });
    }

    renderButton (code, title) {
        const button = document.createElement('button');

        button.id = `svp_${code}`;
        button.classList = this.settings.btnClass;
        button.textContent = title;

        button.disable = () => {
            button.disabled = 'disabled';
            button.classList.add('disable');
        };

        button.enable = () => {
            button.disabled = '';
            button.classList.remove('disable');
        };

        return button;
    }

    appendAction (action) {
        this.actions.push({
            ...action,
            button: this.renderButton(action.code, action.represent)

        });
    }

    runInitProcess (initActions) {
        const { templates } = initActions;
        const { roles } = templates[0];
        const { tasks } = roles[0];
        const { actions } = tasks[0];

        actions.forEach((action) => { this.appendAction(action); });
    }

    checkProcess () {
        return this.actionCheckProcess()
            .then((res) => {
                if (res?.status === 200) {
                    return res.result;

                    return;
                }

                throw new Error('SVP module isnt init. Check server responce', res?.mess);
            });
    }

    actionCheckProcess () {
        return fetch(this.settings.apiURL, {
            method:  'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                type:       'process',
                action:     'checkProcess',
                session:    this.user.session,
                reqoptions: {
                    object: {
                        type: this.settings.descriptor,
                        uuid: this.settings.uuid
                    }
                }
            }
            )
        })
            .then(res => res.json());
    }
}

export default SVP;

// eslint-disable-next-line no-undef
const svbToolbar = new SvbToolbar();
const svp = new SVP(
    {
        apiURL:     'https://raafgroup.kz/kz/svp',
        descriptor: 'document.purchaserequisitions',
        uuid:       'cd8bab32-9f70-4ec8-adaa-9f2654a0fa26'
    },
    {
        represent: 'Искандаров Тимур',
        uuid:      'c9ad3aea-8e94-4c67-bee9-0e18d5b1fcc2',
        session:   '3b8567c6-3fc0-402b-97dd-2dd43efe190b',
        position:  {
            uuid:      'c9ad3aea-8e94-4c67-bee9-0e18d5b1fcc2',
            represent: 'Заведующий складом',
            code:      'storekeeper'
        }
    }
);

svp.beforeInitModule = () => { console.log('before init module'); };
svp.afterInitModule = () => {
    svp.buttons.forEach((button) => {
        svbToolbar.appendChild(button);
    });
};

svp.initModule();

document.body.appendChild(svbToolbar);
