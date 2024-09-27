import SvbModel from '../../../src/SvbModel.js';
import '../../../scss/main.scss';
import SvbElement from '../../../src/components/SvbElement.js';
import SvbComponent from '../../../src/SvbComponent.js';
import SvbFormatter from '../../../src/utils/SvbFormatter.js';
import {SvbAPI} from "../../../src/services/SvbAPI";
import {FlutterMessages} from '../../../src/utils/FlutterMessages.js';
import {FilesActions} from '../../../src/utils/FilesActions.js';
import {getCookie, checkSession, getInstanceUuid} from '../../../src/utilities';

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
    const fileUploader = DM.vm.fileUploader('Фото зеленки');
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
                update: function (value) {
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
                label:      'Фактический объем',
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
                label:      'Остаток',
                descriptor: 'remains',
                settings:   {
                    required:    false,
                    type:        'number',
                    placeholder: 'Объем',
                    slots:       [{
                        content: 'М<sup>3</sup>'
                    }]
                }
            },
            {
                label:      'Оси',
                descriptor: 'axes',
                settings:   {
                    required:    true,
                    type:        'text',
                    placeholder: ''
                }
            },
            {
                label:      'Поставщик',
                descriptor: 'supplier',
                settings:   {
                    required:       true,
                    type:           'catalog',
                    typeObjectName: 'organizations',
                    placeholder:    'Начните вводить',
                    filters:        {
                        static: [
                            {
                                preoperator:  'AND',
                                attribute:    'type',
                                filteralias:  'Тип',
                                predicate:    '=',
                                value:        '048cffb9-d412-4641-8c54-8095a8a185d9',
                                postoperator: '',
                                represent:    'Поставщик бетона'
                            }
                        ]
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
        DM.model.greenscan = fileUploader.getValue();

        if (svbForm.validate() && DM.model.greenscan.length > 0) {
            await saveCallback();
        } else {
            if (DM.model.greenscan.length === 0) {
                SvbComponent.pageError('Внимание', 'Нужно прикрепить фото зеленки', [{
                    title:    'Закрыть',
                    callback: function () { this.close(); }
                }]);

                return;
            }

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
                .then((data) => {
                    const instance = data.instance;
                    const ourFirm = {
                        r: instance.ourfirm.r,
                        v: instance.ourfirm.v
                    };

                    DM.model.ourfirm = ourFirm;
                    DM.model.storage = storage;
                });
        }
    });

    function setConcreteNomenclature (codeA, codeB) {
        if (codeA && codeB !== null) {
            getConcrete(`${codeA}${codeB !== '' ? '_' + codeB : ''}`, DM)
                .then((rows) => {
                    if (rows.length > 0) {
                        const concrete = rows[0];

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

    fileUploader.getInstance()
        .loadMethod = FilesActions.upload.bind(fileUploader.getInstance());

    fileUploader.getInstance()
        .removeMethod = FilesActions.remove.bind(fileUploader.getInstance());

    fileUploader.getInstance().cameraButtonClick = () => {
        FlutterMessages.openCamera();
    };

    contentBlock.appendChild(title);
    contentBlock.appendChild(fileUploader);
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
        pageTitle:      'Прием бетона без заявки',
        ourfirm:        null,
        mainproject:    null,
        project:        null,
        floor:          null,
        constructives:  null,
        quantity:       null,
        concrete:       null,
        concrete_mark:  null,
        concrete_param: '',
        measure:        null,
        concretepump:   null,
        docdate:        null,
        createDate:     new Date(),
        supplier:       null,
        greenscan:      null,
        axes:           null,
        remains:        null,
        comment:        null,
        author:         { r: userData.represent, v: userData.uuid },
        staffer:        { r: userData.userSettings.employee.r, v: userData.userSettings.employee.v }
    }, 'doc', 'goodsreceipts_widthout_requisitions');

    window.session = session;
    window.preloader = SvbComponent.pagePreloader('Загрузка', '');

    if (docUuid === 'new') {
        await renderForm(DM, contentBlock, async () => {
            return await api.insert('document', 'concreterequisitions', null, {
                floor:        DM.model.floor,
                docdate:      SvbFormatter.sqlDate(DM.model.createDate),
                purchasedate: SvbFormatter.sqlTimestamp(DM.model.createDate),
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

                supplier:         DM.model.supplier.v,
                acceptor:         DM.model.staffer.v,
                acceptanceonly:   true,
                accepted:         true,
                acceptancedate:   SvbFormatter.sqlTimestamp(DM.model.createDate),
                greenscan:        DM.model.greenscan,
                acceptedquantity: DM.model.quantity,
                axes:             DM.model.axes,
                remains:          DM.model.remains,

                writeoffitem: '132538d4-96dc-4b91-b3f7-d61b58d0226e',
                draft:        false
            }).then((res) => {
                SvbComponent.pageSuccess('Сохранено', 'Прием бетона сохранен');
                FlutterMessages.success({
                    code: res.status,
                    uuid: res?.result?.uuid
                });
            })
                .catch((e) => {
                    FlutterMessages.error({ message: e });
                });
        });

        window.preloader.remove();
    }
}

async function getConcrete (code, DM) {
    const api = new SvbAPI('https://cab.qazaqstroy.kz/', DM.model.session);
    return await api.list('catalog', 'nomenclature', null, {
        filters:  {
            static: [
                {
                    preoperator:  'AND',
                    attribute:    'code',
                    filteralias:  'Код',
                    predicate:    '=',
                    value:        code,
                    postoperator: '',
                    represent:    code
                }
            ],
            user: []
        },
    })
        .then((res) => {
            return res.rows;
        })
        .catch(e => e);
}
