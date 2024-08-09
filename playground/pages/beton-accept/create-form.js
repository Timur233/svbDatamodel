import SvbModel from '../../../src/SvbModel.js';
import '../../../scss/main.scss';
import SvbElement from '../../../src/components/SvbElement.js';
import SvbComponent from '../../../src/SvbComponent.js';
import SvbFormatter from '../../../src/utils/SvbFormatter.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initPage();
});

async function renderForm (DM, contentBlock, saveCallback) {
    const pageTitle = DM.vm.custom({
        descriptor: 'pageTitle',
        render:     () => {
            return `
                <span class="page-title">${DM.model.pagetitle}</span>
            `;
        }
    });
    const fileUploader = DM.vm.fileUploader('Фото зеленки');
    const svbForm = DM.vm.form({
        attributes: [
            {
                label:      'Заявка',
                descriptor: 'concreterequisition',
                settings:   {
                    required:       true,
                    type:           'catalog',
                    typeObject:     'document',
                    typeObjectName: 'concreterequisitions',
                    placeholder:    'Начните вводить',
                    filters:        {
                        static: []
                    }
                }
            },
            {
                label:      'Поставщик',
                descriptor: 'contractor',
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
                                filteralias:  'Это блок?',
                                predicate:    '=',
                                value:        '048cffb9-d412-4641-8c54-8095a8a185d9',
                                postoperator: '',
                                represent:    true
                            }
                        ]
                    }
                }
            },
            {
                label:      'Оси',
                descriptor: 'comment',
                settings:   {
                    required:    true,
                    type:        'text',
                    placeholder: 'Введите текст'
                }
            },
            {
                label:      'Фактический объем',
                descriptor: 'quantity',
                settings:   {
                    required:    true,
                    type:        'number',
                    placeholder: '0',
                    slots:       [{
                        title:   'В кубических метрах',
                        content: 'М<sup>3</sup>'
                    }]
                }
            },
            {
                label:      'Остаток',
                descriptor: 'remindQuantity',
                settings:   {
                    required:    true,
                    type:        'number',
                    placeholder: '0',
                    slots:       [{
                        title:   'В кубических метрах',
                        content: 'М<sup>3</sup>'
                    }]
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
                        <span class="svb-text__text">${SvbFormatter.date(DM.model.docdate)}</span>
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
        DM.model.scan = fileUploader.getValue();

        if (svbForm.validate() && DM.model.scan.length > 0) {
            await saveCallback();
        } else {
            if (DM.model.scan.length === 0) {
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

    svbForm.getInstance().state.attributes.forEach((attr) => {
        const inputInstance = attr.input.getInstance();

        inputInstance.searchHandling = catalogHelper;
    });

    fileUploader.getInstance()
        .loadMethod = filesActions().upload.bind(fileUploader.getInstance());

    fileUploader.getInstance()
        .removeMethod = filesActions().remove.bind(fileUploader.getInstance());

    window.fileUploader = fileUploader;

    contentBlock.appendChild(pageTitle);
    contentBlock.appendChild(fileUploader);
    contentBlock.appendChild(svbForm);
    contentBlock.appendChild(summary);
    contentBlock.appendChild(buttonsGroup);

    document.body.appendChild(SvbElement.create('style', null, null, `
        .page-title {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 16px;
        }
    `));

    return svbForm;
}

async function initPage () {
    const docUuid      = getInstanceUuid();
    const session      = getCookie('session');
    const contentBlock = document.querySelector('#content-block');
    const userData     = await checkSession(session);
    const DM           = new SvbModel({
        pagetitle:           'Приемка',
        docdate:             new Date(),
        concreterequisition: null,
        project:             null,
        ourfirm:             null,
        storage:             null,
        contractor:          null,

        supplierconcrete: null,
        concrete:         null,
        price:            null,
        quantity:         null,
        remindQuantity:   null,
        comment:          null,
        cmeasure:         null,
        measure:          null,

        createDate:  new Date(),
        storekeeper: { r: userData.represent, v: userData.uuid },
        author:      { r: userData.represent, v: userData.uuid }
    }, 'doc', 'goodsreceipts');

    window.session = session;
    window.preloader = SvbComponent.pagePreloader('Загрузка', '');

    if (docUuid === 'new') {
        const urlParams = new URLSearchParams(window.location.search);
        const requisitionUuid = urlParams.get('uuid');

        window.form = await renderForm(DM, contentBlock, async () => {
            return await insertAction({
                docdate:             SvbFormatter.sqlDate(DM.model.createDate),
                ourfirm:             DM.model.ourfirm.v,
                storage:             DM.model.storage.v,
                storekeeper:         DM.model.author.v,
                project:             DM.model.project.v,
                contractor:          DM.model.contractor.v,
                concreterequisition: DM.model.concreterequisition.v,
                inserter:            null,
                draft:               false
            }, {
                items: [
                    {
                        cnomenclature: DM.model.supplierconcrete.v,
                        cmeasure:      DM.model.cmeasure.v,
                        cquantity:     DM.model.quantity,
                        factcquantity: DM.model.quantity,
                        sum:           (Number(DM.model.quantity) * Number(DM.model.price)),
                        nomenclature:  DM.model.concrete.v,
                        measure:       DM.model.measure.v,
                        quantity:      DM.model.quantity,
                        price:         DM.model.price,
                        factquantity:  DM.model.quantity
                    }
                ],
                concrete: [
                    {
                        quantity: DM.model.quantity,
                        comment:  DM.model.comment
                    }
                ]
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

        if (requisitionUuid) {
            const requisition = await getRequsition(requisitionUuid);

            DM.model.concreterequisition = { r: requisition.attr.represent, v: requisition.attr.uuid };
            DM.model.contractor = { r: requisition.attr.supplier?.r || null, v: requisition.attr.supplier?.v || null };
            DM.model.ourfirm = { r: requisition.attr.ourfirm?.r || null, v: requisition.attr.ourfirm?.v || null };
            DM.model.storage = { r: requisition.attr.storage?.r || null, v: requisition.attr.storage?.v || null };
            DM.model.project = { r: requisition.attr.project?.r || null, v: requisition.attr.project?.v || null };
            DM.model.price = requisition.attr.price || 1;

            DM.model.supplierconcrete = {
                r: requisition.attr.supplierconcrete?.r || null,
                v: requisition.attr.supplierconcrete?.v || null
            };
            DM.model.cmeasure = { r: requisition.attr.cmeasure?.r || null, v: requisition.attr.cmeasure?.v || null };
            DM.model.concrete = { r: requisition.attr.concrete?.r || null, v: requisition.attr.concrete?.v || null };
            DM.model.measure = { r: requisition.attr.measure?.r || null, v: requisition.attr.measure?.v || null };

            window.form.disable('concreterequisition');
            window.form.disable('contractor');
        }

        window.preloader.remove();
    } else {
        const request = await getInstance(docUuid);
        const instanceData = request.result.document.goodsreceipts.instance.attr;
        const tableItemsList = request.result.document.goodsreceipts.tables.items.list;
        const tableItems = tableItemsList.rows.map((row) => {
            return tableItemsList.columns.reduce((accum, current, index) => {
                accum[current] = row[index];

                return accum;
            }, {});
        });

        window.form = await renderForm(DM, contentBlock, async () => {
            SvbComponent.pageSuccess('Сохранено', 'Прием бетона сохранен');
            flutterMessages()
                .success({
                    code: 200
                });

            return;

            return await updateAction(DM.model.uuid, {
                floor:        DM.model.floor,
                ourfirm:      DM.model.ourfirm.v,
                project:      DM.model.project.v,
                storage:      DM.model.storage.v,
                concrete:     DM.model.concrete.v,
                quantity:     DM.model.quantity,
                mainproject:  DM.model.mainproject.v,
                concretepump: DM.model.concretepump.v,
                constructive: DM.model.constructives.v,
                purchasedate: new Date(DM.model.docdate).toISOString().split('T')[0]
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

        DM.model.uuid = instanceData.uuid;
        DM.model.concreterequisition = instanceData.concreterequisition;
        DM.model.comment = instanceData.comment;
        DM.model.comment1 = instanceData.comment1;
        DM.model.quantity = tableItems[0].factcquantity;
        DM.model.contractor = instanceData.contractor;
        DM.model.ourfirm = instanceData.ourfirm;
        DM.model.storage = instanceData.storage;
        DM.model.project = instanceData.project;
        DM.model.storekeeper = instanceData.storekeeper;

        DM.model.floor = instanceData.floor;
        DM.model.constructives = instanceData.constructive;
        DM.model.concretepump = instanceData.concretepump;
        DM.model.concrete = instanceData.concrete;
        DM.model.createDate = new Date(instanceData.insertdate).toISOString().slice(0, 16);
        DM.model.docdate = new Date(instanceData.docdate).toISOString().slice(0, 16);
        DM.model.author = instanceData.inserter;

        window.fileUploader.setValue(instanceData.scan);
        window.form.disable();

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

async function insertAction (data, tables) {
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
                name:     'goodsreceipts',
                data:     {
                    instance: data,
                    tables
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

async function updateAction (uuid, data, tables) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session:    window.session,
            type:       'document',
            action:     'update',
            reqoptions: {
                datatype: 'instance',
                instance: uuid,
                name:     'goodsreceipts',
                data:     {
                    instance: data,
                    tables
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

async function getInstance (uuid) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session:    window.session,
            type:       'document',
            action:     'select',
            reqoptions: {
                name:     'goodsreceipts',
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
                    header: false,
                    tables: {
                        items: true
                    }
                }
            }
        })
    })
        .then(res => res.json())
        .catch(e => e);
}

async function getRequsition (uuid) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
            session:    window.session,
            type:       'document',
            action:     'select',
            reqoptions: {
                name:     'concreterequisitions',
                datatype: 'instance',
                instance: uuid,
                lang:     'ru',
                view:     null
            },
            resoptions: {
                metadata: true,
                view:     true,
                data:     true,
                filters:  true,
                sort:     true
            }
        })
    })
        .then(res => res.json())
        .then(res => res.result.document.concreterequisitions.instance)
        .catch(e => e);
}

function flutterMessages () {
    return {
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
