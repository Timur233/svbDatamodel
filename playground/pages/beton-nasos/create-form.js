import SvbModel from '../../../src/SvbModel.js';
import '../../../scss/main.scss';
import SvbElement from '../../../src/components/SvbElement.js';
import SvbComponent from '../../../src/SvbComponent.js';
import SvbFormatter from '../../../src/utils/SvbFormatter.js';
import {SvbAPI} from "../../../src/services/SvbAPI";

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
                label:      'Гос. номер автобетононасоса',
                descriptor: 'autonumber',
                settings:   {
                    required:    true,
                    type:        'text',
                    placeholder: 'Гос. номер'
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
                label:      'Начало работы автобетононасоса',
                descriptor: 'startdate',
                settings:   {
                    required:    true,
                    type:        'datetime-local',
                    placeholder: SvbFormatter.timestamp(new Date())
                }
            },
            {
                label:      'Завершение работы автобетононасоса',
                descriptor: 'finihdate',
                settings:   {
                    required:    true,
                    type:        'datetime-local',
                    placeholder: SvbFormatter.timestamp(new Date())
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

    svbForm.getInstance().state.attributes.forEach((attr) => {
        const inputInstance = attr.input.getInstance();

        inputInstance.searchHandling = api.catalogHelper;
    });

    fileUploader.getInstance()
        .loadMethod = filesActions().upload.bind(fileUploader.getInstance());

    fileUploader.getInstance()
        .removeMethod = filesActions().remove.bind(fileUploader.getInstance());

    fileUploader.getInstance().cameraButtonClick = () => {
        flutterMessages().openCamera();
    };

    window.fileUploader = fileUploader;

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

    DM.watch('startdate', (value) => {
        svbForm.getAttribute('finihdate').getInstance().setStartDate(value);
        svbForm.getAttribute('finihdate').setValue(value);
    });

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
        pageTitle:    'Фиксация работы автобетононасоса',
        ourfirm:      null,
        mainproject:  null,
        concretepump: null,
        autonumber:   null,
        supplier:     null,

        startdate: null,
        finihdate: null,

        createDate: new Date(),
        author:     { r: userData.represent, v: userData.uuid }
    }, 'doc', 'concreterequisitions');

    window.session = session;
    window.preloader = SvbComponent.pagePreloader('Загрузка', '');

    if (docUuid === 'new') {
        await renderForm(DM, contentBlock, async () => {
            return await api.insert('document', 'concretepumpjobs', null, {
                ourfirm:      DM.model.ourfirm.v,
                mainproject:  DM.model.mainproject.v,
                project:      DM.model.project.v,
                concretepump: DM.model.concretepump.v,
                autonumber:   DM.model.autonumber,
                supplier:     DM.model.supplier.v,
                startdate:    SvbFormatter.sqlTimestamp(DM.model.startdate),
                finihdate:    SvbFormatter.sqlTimestamp(DM.model.finihdate),
                scan:         window.fileUploader.getValue(),

                draft: false
            }).then((res) => {
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
        const request = await api.instance('document', 'concretepumpjobs', docUuid);
        const instanceData = request.result.document.concretepumpjobs.instance.attr;

        await renderForm(DM, contentBlock, async () => {
            return await api.update('document', 'concretepumpjobs', DM.model.uuid, {
                ourfirm:      DM.model.ourfirm.v,
                mainproject:  DM.model.mainproject.v,
                project:      DM.model.project.v,
                concretepump: DM.model.concretepump.v,
                autonumber:   DM.model.autonumber,
                supplier:     DM.model.supplier.v,
                startdate:    SvbFormatter.sqlDate(DM.model.startdate),
                finihdate:    SvbFormatter.sqlDate(DM.model.finihdate),
                scan:         window.fileUploader.getValue()
            }).then((res) => {
                SvbComponent.pageSuccess('Сохранено', 'Прием бетона сохранен');
                flutterMessages()
                    .success({
                        code: res.status,
                        uuid: DM.model.uuid
                    });
            }).catch((e) => {
                flutterMessages()
                    .error({ message: e });
            });
        });

        DM.model.pageTitle = `Фиксация работы автобетононасоса №${instanceData.docnumber} от ${
            SvbFormatter.date(instanceData.insertdate)}`;
        DM.model.uuid = instanceData.uuid;
        DM.model.ourfirm = instanceData.ourfirm;
        DM.model.storage = instanceData.storage;
        DM.model.mainproject = instanceData.mainproject;
        DM.model.project = instanceData.project;
        DM.model.scan = instanceData.scan;
        DM.model.concretepump = instanceData.concretepump;
        DM.model.autonumber = instanceData.autonumber;
        DM.model.supplier = instanceData.supplier;

        DM.model.startdate = new Date(instanceData.startdate || null)?.toISOString()?.slice(0, 16);
        DM.model.finihdate = new Date(instanceData.infinihdatesertdate || null)?.toISOString()?.slice(0, 16);
        DM.model.createDate = new Date(instanceData.insertdate).toISOString().slice(0, 16);
        DM.model.author = instanceData.inserter;

        window.fileUploader.setValue(instanceData.scan);
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
