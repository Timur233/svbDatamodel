import SvbModel from '../../../src/SvbModel.js';
import '../../../scss/main.scss';
import SvbElement from '../../../src/components/SvbElement.js';
import SvbComponent from '../../../src/SvbComponent.js';
import SvbFormatter from '../../../src/utils/SvbFormatter.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initPage();
});

async function renderForm (DM, contentBlock, saveCallback) {
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
            getStorageData(storage.v)
                .then((data) => {
                    const { instance } = data.result.catalog.storages;
                    const ourFirm = {
                        r: instance.attr.ourfirm.r,
                        v: instance.attr.ourfirm.v
                    };

                    DM.model.ourfirm = ourFirm;
                    DM.model.storage = storage;
                });
        }
    });

    function setConcreteNomenclature (codeA, codeB) {
        if (codeA && codeB !== null) {
            getConcrete(`${codeA}${codeB !== '' ? '_' + codeB : ''}`)
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
            inputInstance.searchHandling = catalogHelper;
        }
    });

    fileUploader.getInstance()
        .loadMethod = filesActions().upload.bind(fileUploader.getInstance());

    fileUploader.getInstance()
        .removeMethod = filesActions().remove.bind(fileUploader.getInstance());

    fileUploader.getInstance().cameraButtonClick = () => {
        flutterMessages().openCamera();
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
    const DM           = new SvbModel({
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
            return await insertAction({
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
    }
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

async function catalogHelper (typeObjectName, typeObject, search = '', filters = { static: [], user: [] }) {
    const req = await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session:    window.session,
            type:       typeObject,
            action:     'select',
            reqoptions: {
                name:     typeObjectName,
                datatype: 'list',
                lang:     'ru',
                filters,
                sort:     [],
                limit:    10,
                page:     1,
                search
            },
            resoptions: {
                metadata: false,
                view:     false,
                data:     true,
                filters:  false,
                sort:     true
            }
        })
    }).then((res) => {
        return res.json();
    });

    if (req.status === 200) {
        const { columns, rows } = req.result[typeObject][typeObjectName].list;

        return rows.map((row) => {
            return columns.reduce((acc, curr, index) => {
                acc[curr] = row[index];

                return acc;
            }, {});
        });
    }

    return [];
}

async function getStorageData (uuid) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session:    window.session,
            type:       'catalog',
            action:     'select',
            reqoptions: {
                name:     'storages',
                datatype: 'instance',
                instance: uuid,
                lang:     'ru',
                view:     null
            },
            resoptions: {
                metadata:   true,
                view:       true,
                data:       true,
                filters:    true,
                sort:       true,
                dataparams: {
                    header: true
                }
            }
        })
    })
        .then(res => res.json())
        .catch(e => e);
}

async function getConcrete (code) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session:    window.session,
            type:       'catalog',
            action:     'select',
            reqoptions: {
                name:     'nomenclature',
                datatype: 'list',
                lang:     'ru',
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
                sort:             [],
                limit:            25,
                page:             1,
                search:           '',
                view:             null,
                selectedInstance: null
            },
            resoptions: {
                metadata: true,
                view:     true,
                data:     true,
                filters:  true,
                sort:     true,
                tree:     false
            }
        })
    })
        .then(res => res.json())
        .then((res) => {
            const columns = res?.result?.catalog?.nomenclature?.list?.columns || {};
            const rows = res?.result?.catalog?.nomenclature?.list?.rows || [];

            return rows.map((row) => {
                return columns.reduce((acc, key, index) => {
                    acc[key] = row[index];

                    return acc;
                }, {});
            });
        })
        .catch(e => e);
}

async function insertAction (data) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session:    window.session,
            type:       'document',
            action:     'insert',
            reqoptions: {
                datatype: 'instance',
                instance: '',
                name:     'concreterequisitions',
                data:     {
                    instance: data,
                    tables:   {}
                },
                lang: 'ru'
            },
            resoptions: {
                metadata:   false,
                view:       false,
                data:       true,
                dataparams: {
                    header: true
                }
            }
        })
    })
        .then(res => res.json())
        .catch(e => e);
}

function filesActions () {
    return {
        upload: async function (file) {
            const formData = new FormData();

            formData.append('file', file);

            return fetch('https://cab.qazaqstroy.kz/files/upload', {
                method: 'POST',
                body:   formData
            })
                .then(res => res.json())
                .then(res => ({
                    name:  res.name,
                    url:   res.url,
                    value: res.url
                }));
        },
        preview: async function (uuid) {
            const response = await fetch('https://cab.qazaqstroy.kz/files/download', {
                method: 'POST',
                body:   JSON.stringify({ url: uuid })
            });
            const blob = await response.blob();
            const reader = new FileReader();
            const base64data = await new Promise((resolve, reject) => {
                reader.onloadend = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsDataURL(blob);
            });

            return base64data;
        },
        remove: async () => {}
    };
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
