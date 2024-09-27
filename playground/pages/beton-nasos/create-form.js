import SvbModel from '../../../src/SvbModel.js';
import '../../../scss/main.scss';
import SvbElement from '../../../src/components/SvbElement.js';
import SvbComponent from '../../../src/SvbComponent.js';
import SvbFormatter from '../../../src/utils/SvbFormatter.js';
import {SvbAPI} from "../../../src/services/SvbAPI";
import {FlutterMessages} from '../../../src/utils/FlutterMessages.js';
import {FilesActions} from '../../../src/utils/FilesActions.js';
import {checkSession, getInstanceUuid, getCookie} from '../../../src/utilities.js';

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
        .loadMethod = FilesActions.upload.bind(fileUploader.getInstance());

    fileUploader.getInstance()
        .removeMethod = FilesActions.remove.bind(fileUploader.getInstance());

    fileUploader.getInstance().cameraButtonClick = () => {
        FlutterMessages.openCamera();
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
    } else {
        const instanceData = await api.instance('document', 'concretepumpjobs', docUuid).then(res => res.instance);

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
                FlutterMessages.success({
                    code: res.status,
                    uuid: DM.model.uuid
                });
            }).catch((e) => {
                FlutterMessages.error({ message: e });
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
        DM.model.finihdate = instanceData.finihdate;
        DM.model.createDate = new Date(instanceData.insertdate).toISOString().slice(0, 16);
        DM.model.author = instanceData.inserter;

        window.fileUploader.setValue(instanceData.scan);
        window.preloader.remove();
    }
}
