import SvbModel from '../../../src/SvbModel.js';
import '../../../scss/main.scss';
import SvbElement from '../../../src/components/SvbElement.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initPage();
});

async function renderForm(DM, contentBlock, saveCallback) {
    const svbForm = DM.vm.form({
        attributes: [
            {
                label: 'Объект',
                descriptor: 'mainproject',
                settings: {
                    type: 'catalog',
                    typeObjectName: 'projects',
                    placeholder: 'Начните вводить',
                    filters: {
                        static: [
                            {
                                preoperator: 'AND',
                                attribute: 'isfolder',
                                filteralias: 'Это блок?',
                                predicate: '=',
                                value: true,
                                postoperator: '',
                                represent: true
                            }
                        ]
                    }
                }
            },
            {
                label: 'Блок',
                descriptor: 'project',
                settings: {
                    type: 'catalog',
                    typeObjectName: 'projects',
                    placeholder: 'Начните вводить',
                    filters: {
                        static: [
                            {
                                preoperator: 'AND',
                                attribute: 'isfolder',
                                filteralias: 'Это блок?',
                                predicate: '=',
                                value: true,
                                postoperator: '',
                                represent: true
                            }
                        ]
                    }
                }
            },
            {
                label: 'Этаж',
                descriptor: 'floor',
                settings: {
                    type: 'number',
                    placeholder: 'Укажите этаж',
                }
            },
            {
                label: 'Марка бетона',
                descriptor: 'concrete',
                settings: {
                    type: 'catalog',
                    typeObjectName: 'nomenclature',
                    placeholder: 'Начните вводить',
                    filters: {
                        static: [
                            {
                                preoperator: 'AND',
                                attribute: 'type',
                                predicate: '=',
                                value: '257e1933-de73-49fd-acc2-a73322fef8e5',
                                postoperator: '',
                                represent: true
                            }
                        ]
                    }
                }
            },
            {
                label: 'Конструктив',
                descriptor: 'constructives',
                settings: {
                    type: 'catalog',
                    typeObjectName: 'constructives',
                    placeholder: 'Начните вводить',
                    filters: {
                        static: [
                            {
                                preoperator: 'AND',
                                attribute: 'forconcrete',
                                filteralias: 'Это блок?',
                                predicate: '=',
                                value: true,
                                postoperator: '',
                                represent: true
                            }
                        ]
                    }
                }
            },
            {
                label: 'Объем',
                descriptor: 'quantity',
                settings: {
                    type: 'number',
                    placeholder: 'Объем',
                    slots: [{
                        content: 'М<sup>3</sup>'
                    }]
                }
            },
            {
                label: 'Автобетононасос',
                descriptor: 'concretepump',
                settings: {
                    type: 'catalog',
                    typeObjectName: 'concretepumptypes',
                    placeholder: 'Начните вводить',
                }
            },
            {
                label: 'Дата и время доставки',
                descriptor: 'docdate',
                settings: {
                    type: 'datetime-local',
                    placeholder: '17.04.2024 15:00:00',
                }
            },
        ]
    });
    const summary = DM.vm.custom({
        descriptor: 'summary',
        render: () => {
            return `
                <div class="svb-form__filed svb-field">
                    <label class="svb-field__label">Дата</label>
                    <div class="svb-text">
                        <span class="svb-text__text">${DM.model.createDate}</span>
                    </div> 
                </div>
                <div class="svb-form__filed svb-field">
                    <label class="svb-field__label">Автор</label>
                    <div class="svb-text">
                        <span class="svb-text__text">${DM.model.author.r}</span>
                    </div> 
                </div>
            `
        }
    });
    const buttonsGroup = SvbElement.create('div', null, 'app-form__buttons-group buttons-group buttons-group--column');
    const saveButton = SvbElement.create('button', null, 'btn btn--primary', 'Сохранить');
    const clearButton = SvbElement.create('button', null, 'btn btn--cancel btn--color-red', 'Сброс');

    saveButton.addEventListener('click', async () => {
        await saveCallback();
    })
    
    clearButton.addEventListener('click', () => {
        DM.model.mainproject = null;
        DM.model.project = null;
        DM.model.floor = null;
        DM.model.constructives = null;
        DM.model.quantity = null;
        DM.model.concretepump = null;
        DM.model.docdate = null;
    })
    
    buttonsGroup.appendChild(saveButton);
    buttonsGroup.appendChild(clearButton);
    
    DM.watch('mainproject', (value) => {
        const storage = svbForm.getAttribute('mainproject').getInstance()
            .state?.additionalInfo?.storage;

        DM.model.project = null;

        svbForm.getAttribute('project').setFilters({
            static: [
                {
                    preoperator: 'AND',
                    attribute: 'folder',
                    filteralias: 'Основной проект',
                    predicate: '=',
                    value: value?.v,
                    postoperator: '',
                    represent: true
                }
            ]
        });

        if (storage?.v) {
            getStorageData(storage.v)
                .then(data => {
                    const { instance } = data.result.catalog.storages;
                    const ourFirm = {
                        r: instance.attr.ourfirm.r,
                        v: instance.attr.ourfirm.v,
                    }
    
                    DM.model.ourfirm = ourFirm;
                    DM.model.storage = storage;
                })
        }
    });
    
    svbForm.getInstance().state.attributes.forEach(attr => {
        const inputInstance = attr.input.getInstance();
        
        inputInstance.searchHandling = catalogHelper
    });
    
    contentBlock.appendChild(svbForm);
    contentBlock.appendChild(summary);
    contentBlock.appendChild(buttonsGroup);
}

async function initPage() {
    const docUuid      = getInstanceUuid();
    const session      = getCookie('session');
    const contentBlock = document.querySelector('#content-block');
    const userData     = await checkSession(session);
    const DM           = new SvbModel({
        ourfirm: null,
        mainproject: null,
        project: null,
        floor: null,
        constructives: null,
        quantity: null,
        concretepump: null,
        docdate: null,
        createDate: new Date()
            .toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
            .replace(/\//g, '.'),
        author: { r: userData.represent, v: userData.uuid },
    }, 'doc', 'concreterequisitions');

    window.session = session;

    if (docUuid === 'new') {
        await renderForm(DM, contentBlock, async () => { 
            return await insertAction({
                "floor": DM.model.floor,
                "docdate": new Date(DM.model.createDate).toISOString().split('T')[0],
                "ourfirm": DM.model.ourfirm.v,
                "project": DM.model.project.v,
                "storage": DM.model.storage.v,
                "concrete": DM.model.concrete.v,
                "inserter": null,
                "quantity": DM.model.quantity,
                "docnumber": null,
                "mainproject": DM.model.mainproject.v,
                "concretepump": DM.model.concretepump.v,
                "constructive": DM.model.constructives.v,
                "purchasedate": new Date(DM.model.docdate).toISOString().split('T')[0],
                "writeoffitem": "132538d4-96dc-4b91-b3f7-d61b58d0226e",
                "draft": false
            })
                .then(res => {
                    console.log(res);
                    window.flutter_inappwebview
                        .callHandler('jsMessage', { 
                            code:    200,
                            message: 'success' 
                        });
                })
        })
    } else {
        const request = await getInstance(docUuid);
        const instanceData = request.result.document.concreterequisitions.instance.attr;

        await renderForm(DM, contentBlock, async () => { 
            return await updateAction(DM.model.uuid, {
                "floor": DM.model.floor,
                "ourfirm": DM.model.ourfirm.v,
                "project": DM.model.project.v,
                "storage": DM.model.storage.v,
                "concrete": DM.model.concrete.v,
                "quantity": DM.model.quantity,
                "mainproject": DM.model.mainproject.v,
                "concretepump": DM.model.concretepump.v,
                "constructive": DM.model.constructives.v,
                "purchasedate": new Date(DM.model.docdate).toISOString().split('T')[0],
            })
                .then(res => {
                    console.log(res);
                    window.flutter_inappwebview
                        .callHandler('jsMessage', { 
                            code:    200,
                            message: 'success' 
                        });
                })
        });

        DM.model.uuid = instanceData.uuid,
        DM.model.ourfirm = instanceData.ourfirm;
        DM.model.storage = instanceData.storage;
        DM.model.mainproject = instanceData.mainproject;
        DM.model.project = instanceData.project;
        DM.model.floor = instanceData.floor;
        DM.model.constructives = instanceData.constructive;
        DM.model.quantity = instanceData.quantity;
        DM.model.concretepump = instanceData.concretepump;
        DM.model.concrete = instanceData.concrete;
        DM.model.docdate = new Date(instanceData.purchasedate).toISOString().slice(0, 16);
        DM.model.createDate = new Date(instanceData.insertdate).toISOString().slice(0, 16);
        DM.model.author = instanceData.inserter;
    }

}

function getInstanceUuid() {
    return window.svbReqOptions.uuid;
}

function getCookie(name) {
    const cookies = document.cookie;
    const match = cookies.match(new RegExp('(^| )' + name + '=([^;]+)'));

    if (match) {
        return decodeURIComponent(match[2]);
    } else {
        return null;
    }
}

async function checkSession(session) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            session: session,
            type:    'system',
            action:  'checksession',
            name:    'users'
        })
    })
        .then(res => res.json())
        .catch(e => e)
}
    
async function catalogHelper (typeObjectName, search = '', filters = { "static": [], "user": [] }) {
    const req = await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "session": window.session,
            "type": "catalog",
            "action": "select",
            "reqoptions": {
                "name": typeObjectName,
                "datatype": "list",
                "lang": "ru",
                "filters": filters,
                "sort": [],
                "limit": 10,
                "page": 1,
                "search": search
            },
            "resoptions": {
                "metadata": false,
                "view": false,
                "data": true,
                "filters": false,
                "sort": true
            }
        })
    }).then(res => { 
        return res.json()
    });

    if (req.status === 200) {
        const { columns, rows } = req.result.catalog[typeObjectName].list;

        return rows.map(row => {
            return columns.reduce((acc, curr, index) => {
                acc[curr] = row[index];

                return acc;
            }, {})
        })
    }

    return [];
}

async function getStorageData(uuid) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "session": window.session,
            "type": "catalog",
            "action": "select",
            "reqoptions": {
                "name": "storages",
                "datatype": "instance",
                "instance": uuid,
                "lang": "ru",
                "view": null
            },
            "resoptions": {
                "metadata": true,
                "view": true,
                "data": true,
                "filters": true,
                "sort": true,
                "dataparams": {
                    "header": true
                }
            }
        })
    })
        .then(res => res.json())
        .catch(e => e)
}

async function insertAction(data) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "session": window.session,
            "type": "document",
            "action": "insert",
            "reqoptions": {
                "datatype": "instance",
                "instance": "",
                "name": "concreterequisitions",
                "data": {
                    "instance": data,
                    "tables": {}
                },
                "lang": "ru"
            },
            "resoptions": {
                "metadata": false,
                "view": false,
                "data": true,
                "dataparams": {
                    "header": true
                }
            }
        })
    })
        .then(res => res.json())
        .catch(e => e)
}

async function updateAction(uuid, data) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "session": window.session,
            "type": "document",
            "action": "update",
            "reqoptions": {
                "datatype": "instance",
                "instance": uuid,
                "name": "concreterequisitions",
                "data": {
                    "instance": data,
                    "tables": {}
                },
                "lang": "ru"
            },
            "resoptions": {
                "metadata": false,
                "view": false,
                "data": true,
                "dataparams": {
                    "header": true
                }
            }
        })
    })
        .then(res => res.json())
        .catch(e => e)
}

async function getInstance(uuid) {
    return await fetch('https://cab.qazaqstroy.kz/svbapi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            "session": window.session,
            "type": "document",
            "action": "select",
            "reqoptions": {
                "name": "concreterequisitions",
                "datatype": "instance",
                "instance": uuid,
                "lang": "ru",
                "view": null
            },
            "resoptions": {
                "metadata": true,
                "view": true,
                "data": true,
                "filters": true,
                "sort": true,
                "dataparams": {
                    "header": true
                }
            }
        })
    })
        .then(res => res.json())
        .catch(e => e)
}