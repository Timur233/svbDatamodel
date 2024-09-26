import SvbModel from '../../../src/SvbModel.js';
import '../../../scss/main.scss';
import SvbElement from '../../../src/components/SvbElement.js';
import SvbComponent from '../../../src/SvbComponent.js';
import SvbFormatter from '../../../src/utils/SvbFormatter.js';
import { SvbAPI } from '../../../src/services/SvbAPI.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initPage();
});

async function renderForm (DM, contentBlock, saveCallback) {
    const api = new SvbAPI('https://cab.qazaqstroy.kz/', DM.model.session);
    const title = DM.vm.custom({
        descriptor: 'pageTitle',
        render:     () => {
            return `
                <div class="page-title wrapper__title">
                    ${DM.model.pageTitle}
                </div>
            `;
        }
    });
    const svbForm = DM.vm.form({
        attributes: [
            {
                label:      'Объект',
                descriptor: 'mainproject',
                settings:   {
                    required:       true,
                    type:           'catalog',
                    typeObjectName: 'projects',
                    placeholder:    'Начните вводить',
                    filters:        {
                        static: [
                            {
                                preoperator:  'AND',
                                attribute:    'isfolder',
                                filteralias:  'Это блок?',
                                predicate:    '=',
                                value:        true,
                                postoperator: '',
                                represent:    true
                            }
                        ]
                    }
                }
            },
            {
                label:      'Блок',
                descriptor: 'project',
                settings:   {
                    required:       true,
                    type:           'catalog',
                    typeObjectName: 'projects',
                    placeholder:    'Начните вводить',
                    filters:        {
                        static: [
                            {
                                preoperator:  'AND',
                                attribute:    'isfolder',
                                filteralias:  'Это блок?',
                                predicate:    '=',
                                value:        true,
                                postoperator: '',
                                represent:    true
                            }
                        ]
                    }
                }
            },
            {
                label:      'Этаж',
                descriptor: 'floor',
                settings:   {
                    required:    true,
                    type:        'number',
                    placeholder: 'Укажите этаж'
                }
            },
            {
                label:      'Марка бетона',
                descriptor: 'concrete_mark',
                settings:   {
                    required:       true,
                    type:           'catalog',
                    typeObjectName: 'nomenclature',
                    placeholder:    'Начните вводить',
                    searchHandling: async (typeObjectName, inputType, value = '') => {
                        const concrete = [
                            {
                                represent: 'Бетон М100 (В7,5)',
                                uuid:      'concrete_m100_b7.5'
                            },
                            {
                                represent: 'Бетон М150 (В10)',
                                uuid:      'concrete_m150_b10'
                            },
                            {
                                represent: 'Бетон М150 (В12,5)',
                                uuid:      'concrete_m150_b12.5'
                            },
                            {
                                represent: 'Бетон М200 (В15)',
                                uuid:      'concrete_m200_b15'
                            },
                            {
                                represent: 'Бетон М250 (В20)',
                                uuid:      'concrete_m250_b20'
                            },
                            {
                                represent: 'Бетон М300 (В22,5)',
                                uuid:      'concrete_m300_b22.5'
                            },
                            {
                                represent: 'Бетон М350 (В25)',
                                uuid:      'concrete_m350_b25'
                            },
                            {
                                represent: 'Бетон М350 (В27,5)',
                                uuid:      'concrete_m350_b27.5'
                            },
                            {
                                represent: 'Бетон М400 (В30)',
                                uuid:      'concrete_m400_b30'
                            },
                            {
                                represent: 'Бетон М450 (В35)',
                                uuid:      'concrete_m450_b35'
                            }
                        ];

                        return concrete.filter(i => i.represent.includes(value));
                    }
                }
            },
            {
                descriptor: 'concrete_param',
                render:     function () {
                    const component = SvbElement.create('div', null, 'checkbox-group');
                    const checkBoxList = [];

                    this.settings.options.forEach((i) => {
                        const optionElement = SvbElement.create('label', null, 'checkbox-group__label');
                        const optionLabel = SvbElement.create('span', null, null, i.represent);
                        const optionInput =  SvbElement.create('input', null, 'checkbox-group__input');

                        if (i.value === DM.model.concrete_param) optionInput.checked = true;

                        optionInput.type = 'checkbox';
                        optionInput.value = i.value;
                        optionInput.addEventListener('change', (e) => {
                            e.preventDefault();

                            checkBoxList.forEach((i) => { i.checked = false; });
                            optionInput.checked = true;

                            component.dispatchEvent(new CustomEvent('svb:change', {
                                bubbles:    true,
                                cancelable: true,
                                e
                            }));
                        });

                        checkBoxList.push(optionInput);
                        optionElement.appendChild(optionInput);
                        optionElement.appendChild(optionLabel);

                        component.appendChild(optionElement);
                    });

                    component.checkBoxList = checkBoxList;
                    component.getValue = () => {
                        return checkBoxList.find(i => i.checked)?.value;
                    };

                    return component;
                },
                update: function (value = '') {
                    const currentInput = this.component.checkBoxList.find(i => i.value === value);

                    this.component.checkBoxList.forEach((i) => { i.checked = false; });
                    currentInput.checked = true;
                },
                settings: {
                    isCustom: true,
                    options:  [
                        {
                            represent: 'Стандарт',
                            value:     ''
                        },
                        {
                            represent: 'Сульфатостойкий',
                            value:     'sulfateresistant'
                        },
                        {
                            represent: 'Гидрофобный',
                            value:     'hydrophobic'
                        },
                        {
                            represent: 'Морозостойкий',
                            value:     'antifreeze'
                        }
                    ]
                }
            },
            {
                label:      'Конструктив',
                descriptor: 'constructives',
                settings:   {
                    required:       true,
                    type:           'catalog',
                    typeObjectName: 'constructives',
                    placeholder:    'Начните вводить',
                    filters:        {
                        static: [
                            {
                                preoperator:  'AND',
                                attribute:    'forconcrete',
                                filteralias:  'Это блок?',
                                predicate:    '=',
                                value:        true,
                                postoperator: '',
                                represent:    true
                            }
                        ]
                    }
                }
            },
            {
                label:      'Объем',
                descriptor: 'quantity',
                settings:   {
                    required:    true,
                    type:        'number',
                    placeholder: 'Объем',
                    slots:       [{
                        content: 'М<sup>3</sup>'
                    }],
                    validate: (value) => {
                        if (value && Number(value) > 0) return true;

                        return false;
                    }
                }
            },
            {
                label:      'Автобетононасос',
                descriptor: 'concretepump',
                settings:   {
                    required:       true,
                    type:           'catalog',
                    typeObjectName: 'concretepumptypes',
                    placeholder:    'Начните вводить'
                }
            },
            {
                label:      'Дата и время доставки',
                descriptor: 'docdate',
                settings:   {
                    required:    true,
                    type:        'datetime-local',
                    startDate:   new Date(),
                    placeholder: SvbFormatter.timestamp(new Date())
                }
            },
            {
                label:      'Комментарий',
                descriptor: 'comment',
                settings:   {
                    required:    false,
                    multiline:   true,
                    type:        'text',
                    height:      130,
                    placeholder: ''
                }
            }
        ]
    });
    const summary = DM.vm.custom({
        descriptor: 'summary',
        render:     () => {
            return `
                <div class="svb-form__filed svb-field">
                    <label class="svb-field__label">Дата</label>
                    <div class="svb-text">
                        <span class="svb-text__text">${SvbFormatter.timestamp(DM.model.createDate)}</span>
                    </div> 
                </div>
                <div class="svb-form__filed svb-field">
                    <label class="svb-field__label">Автор</label>
                    <div class="svb-text">
                        <span class="svb-text__text">${DM.model.author.r}</span>
                    </div> 
                </div>
            `;
        }
    });
    const buttonsGroup = SvbElement.create('div', null, 'app-form__buttons-group buttons-group buttons-group--column');
    const saveButton = SvbElement.create('button', null, 'btn btn--primary', 'Сохранить');

    saveButton.addEventListener('click', async () => {
        if (svbForm.validate()) {
            await saveCallback();
        } else {
            SvbComponent.pageError('Внимание', 'Не заполнены обязательные поля', [{
                title:    'Закрыть',
                callback: function () { this.close(); }
            }]);
        }
    });

    buttonsGroup.appendChild(saveButton);

    DM.watch('mainproject', (value) => {
        const storage = svbForm.getAttribute('mainproject').getInstance()
            .state?.additionalInfo?.storage;

        DM.model.project = null;

        svbForm.getAttribute('project').setFilters({
            static: [
                {
                    preoperator:  'AND',
                    attribute:    'folder',
                    filteralias:  'Основной проект',
                    predicate:    '=',
                    value:        value?.v,
                    postoperator: '',
                    represent:    true
                }
            ]
        });

        if (storage?.v) {
            api.instance('catalog', 'storages', storage.v)
                .then((res) => {
                    if (res.status === 200) {
                        const { instance } = res;
                        const ourFirm = {
                            r: instance.ourfirm.r,
                            v: instance.ourfirm.v
                        };

                        DM.model.ourfirm = ourFirm;
                        DM.model.storage = storage;
                    }
                });
        }
    });

    DM.watch('supplier', (value) => {
        if (value.v) {
            svbForm.disable();
        }
    });

    function setConcreteNomenclature (codeA, codeB) {
        if (codeA && codeB !== null) {
            api.list('catalog', 'nomenclature', null, {
                filters: {
                    static: [
                        {
                            preoperator:  'AND',
                            attribute:    'code',
                            filteralias:  'Код',
                            predicate:    '=',
                            value:        `${codeA}${codeB !== '' ? '_' + codeB : ''}`,
                            postoperator: '',
                            represent:    `${codeA}${codeB !== '' ? '_' + codeB : ''}`
                        }
                    ],
                    user: []
                }
            })
                .then((res) => {
                    if (res.rows.length > 0) {
                        const concrete = res.rows[0];

                        DM.model.concrete = {
                            r: concrete.represent,
                            v: concrete.uuid
                        };

                        DM.model.measure = concrete.measure;
                    }
                });
        }
    }

    DM.watch('concrete_mark', () => { setConcreteNomenclature(DM.model.concrete_mark?.v, DM.model.concrete_param); });
    DM.watch('concrete_param', () => { setConcreteNomenclature(DM.model.concrete_mark?.v, DM.model.concrete_param); });

    svbForm.getInstance().state.attributes.forEach((attr) => {
        if (attr.input?.getInstance === undefined) return;

        const inputInstance = attr.input?.getInstance();

        if (inputInstance?.type === 'catalog' && inputInstance.searchHandling === undefined) {
            inputInstance.searchHandling = api.catalogHelper;
        }
    });

    contentBlock.appendChild(title);
    contentBlock.appendChild(svbForm);
    contentBlock.appendChild(summary);
    contentBlock.appendChild(buttonsGroup);
}

async function initPage () {
    const docUuid      = getInstanceUuid();
    const session      = getCookie('session');
    const contentBlock = document.querySelector('#content-block');
    const userData     = await checkSession(session);
    const api = new SvbAPI('https://cab.qazaqstroy.kz/', session);
    const DM           = new SvbModel({
        session,
        pageTitle:      'Заявка на бетон',
        ourfirm:        null,
        mainproject:    null,
        project:        null,
        floor:          null,
        constructives:  null,
        quantity:       null,
        concrete:       null,
        concrete_mark:  null,
        concrete_param: null,
        measure:        null,
        concretepump:   null,
        docdate:        null,
        createDate:     new Date(),
        supplier:       null,
        comment:        null,
        author:         { r: userData.represent, v: userData.uuid }
    }, 'doc', 'concreterequisitions');

    window.DM = DM;
    window.session = session;
    window.preloader = SvbComponent.pagePreloader('Загрузка', '');

    if (docUuid === 'new') {
        await renderForm(DM, contentBlock, async () => {
            return await api.insert('document', 'concreterequisitions', null, {
                floor:        DM.model.floor,
                docdate:      SvbFormatter.sqlDate(DM.model.createDate),
                ourfirm:      DM.model.ourfirm.v,
                project:      DM.model.project.v,
                storage:      DM.model.storage.v,
                concrete:     DM.model.concrete.v,
                measure:      DM.model.measure.v,
                inserter:     null,
                quantity:     DM.model.quantity,
                docnumber:    null,
                mainproject:  DM.model.mainproject.v,
                concretepump: DM.model.concretepump.v,
                constructive: DM.model.constructives.v,
                comment:      DM.model.comment,
                purchasedate: SvbFormatter.sqlTimestamp(DM.model.docdate),
                writeoffitem: '132538d4-96dc-4b91-b3f7-d61b58d0226e',
                draft:        false
            })
                .then((res) => {
                    SvbComponent.pageSuccess('Сохранено', 'Прием бетона сохранен');
                    flutterMessages()
                        .success({
                            code: res.status,
                            uuid: res?.result?.uuid
                        });
                })
                .catch((e) => {
                    flutterMessages()
                        .error({ message: e });
                });
        });

        window.preloader.remove();
    } else {
        const request = await api.instance('document', 'concreterequisitions', docUuid);
        const concrete = await api.instance('catalog', 'nomenclature', request.instance.concrete.v);
        const instanceData = request.instance;
        const concreteData = concrete.instance;
        const concreteCode = codeParser(concreteData.code);

        await renderForm(DM, contentBlock, async () => {
            return await api.update('document', 'concreterequisitions', DM.model.uuid, {
                floor:        DM.model.floor,
                ourfirm:      DM.model.ourfirm.v,
                project:      DM.model.project.v,
                storage:      DM.model.storage.v,
                concrete:     DM.model.concrete.v,
                measure:      DM.model.measure.v,
                quantity:     DM.model.quantity,
                mainproject:  DM.model.mainproject.v,
                concretepump: DM.model.concretepump.v,
                constructive: DM.model.constructives.v,
                comment:      DM.model.comment,
                purchasedate: SvbFormatter.sqlTimestamp(DM.model.docdate)
            })
                .then((res) => {
                    SvbComponent.pageSuccess('Сохранено', 'Прием бетона сохранен');
                    flutterMessages()
                        .success({
                            code: res.status,
                            uuid: DM.model.uuid
                        });
                })
                .catch((e) => {
                    flutterMessages()
                        .error({ message: e });
                });
        });

        DM.model.pageTitle = `Заявка на бетон №${instanceData.docnumber} от ${
            SvbFormatter.date(instanceData.insertdate)}`;
        DM.model.uuid = instanceData.uuid;
        DM.model.ourfirm = instanceData.ourfirm;
        DM.model.storage = instanceData.storage;
        DM.model.mainproject = instanceData.mainproject;
        DM.model.project = instanceData.project;
        DM.model.floor = instanceData.floor;
        DM.model.constructives = instanceData.constructive;
        DM.model.quantity = instanceData.quantity;
        DM.model.concretepump = instanceData.concretepump;
        DM.model.measure = concreteData.measure;
        DM.model.concrete = instanceData.concrete;
        DM.model.concrete_mark = { r: concreteData.represent, v: concreteCode.mark };
        DM.model.concrete_param = concreteCode.param;
        DM.model.supplier = instanceData.supplier;
        DM.model.comment = instanceData.comment;
        DM.model.docdate = instanceData.purchasedate;
        DM.model.createDate = instanceData.insertdate;
        DM.model.author = instanceData.inserter;

        window.preloader.remove();
    }
}

function codeParser (code) {
    const concreteCodeArray = code.split('_').reverse();
    const concreteParam = concreteCodeArray[0] === 'sulfateresistant' ||
        concreteCodeArray[0] === 'hydrophobic' ||
        concreteCodeArray[0] === 'antifreeze'
        ? concreteCodeArray[0]
        : '';
    const concreteMark = code.replace('_' + concreteParam, '');

    return {
        mark:  concreteMark,
        param: concreteParam
    };
}

function getInstanceUuid () {
    return window.svbReqOptions.uuid;
}

function getCookie (name) {
    const cookies = document.cookie;
    const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));

    if (match) {
        return decodeURIComponent(match[2]);
    } else {
        return null;
    }
}

async function checkSession (session) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session,
            type:   'system',
            action: 'checksession',
            name:   'users'
        })
    })
        .then(res => res.json())
        .catch(e => e);
}

function base64ToFile (base64String, fileName) {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }

    return new File([u8arr], fileName, { type: mime });
}

function flutterMessages () {
    return {
        openCamera: () => {
            try {
                window.flutter_inappwebview.callHandler('camera', '');
            } catch (error) { console.log(error); }
        },
        uploadPhoto: (file, name) => {
            if (file) {
                window.fileUploader.getInstance().loadFile(base64ToFile(file, name));
            }
        },
        success: (message) => {
            try {
                window.flutter_inappwebview.callHandler('success', message);
            } catch (error) { console.log(error); }
        },
        error: (message) => {
            try {
                window.flutter_inappwebview.callHandler('error', message);
            } catch (error) { console.log(error); }
        }
    };
}
