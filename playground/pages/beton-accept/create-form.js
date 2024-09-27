import SvbModel from '../../../src/SvbModel.js';
import '../../../scss/main.scss';
import SvbElement from '../../../src/components/SvbElement.js';
import SvbComponent from '../../../src/SvbComponent.js';
import SvbFormatter from '../../../src/utils/SvbFormatter.js';
import { SvbAPI } from '../../../src/services/SvbAPI';
import { FlutterMessages } from '../../../src/utils/FlutterMessages.js';
import { FilesActions } from '../../../src/utils/FilesActions.js';
import { checkSession, getCookie, getInstanceUuid } from '../../../src/utilities.js';

document.addEventListener('DOMContentLoaded', async () => {
    await initPage();
});

async function renderForm (DM, contentBlock, saveCallback) {
    const api = new SvbAPI('https://cab.qazaqstroy.kz/', DM.model.session);
    const pageTitle = DM.vm.custom({
        descriptor: 'pagetitle',
        render:     () => {
            return `
                <span class="page-title">${DM.model.pagetitle}</span>
            `;
        }
    });
    const infoBlock = DM.vm.custom({
        descriptor: 'reqisitionData',
        render:     (value) => {
            return `
                <span class="page-info">${DM.model.reqisitionData}</span>
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
                descriptor: 'axes',
                settings:   {
                    required:    true,
                    type:        'text',
                    placeholder: 'Введите текст'
                }
            },
            {
                label:      'Фактический объем',
                descriptor: 'acceptedquantity',
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
                descriptor: 'remains',
                settings:   {
                    required:    false,
                    hidden:      true,
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
                        <span class="svb-text__text">${SvbFormatter.date(DM.model.acceptancedate)}</span>
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
            SvbComponent.pageError('Внимание!', 'Данное действие нельзя будет изменить', [{
                title:     'Отменить',
                classList: 'btn--outline',
                callback:  function () { this.close(); }
            }, {
                title:     'Продолжить',
                classList: 'btn--primary',
                callback:  async function () {
                    await saveCallback();
                }
            }], `
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.1749 40.3461C32.2319 22.5505 37.2604 13.6527 44.1607 11.3623C47.9566 10.1022 
                    52.0457 10.1022 55.8416 11.3623C62.742 13.6527 67.7703 22.5505 77.8274 40.3461C87.8845 
                    58.1415 92.9128 67.0394 91.4045 74.2894C90.5745 78.2782 88.5299 81.8957 85.5637 84.6244C80.172 
                    89.584 70.1153 89.584 50.0012 89.584C29.8872 89.584 19.8302 89.584 14.4385 84.6244C11.4723 
                    81.8957 9.42778 78.2782 8.5979 74.2894C7.08945 67.0394 12.1179 58.1415 22.1749 40.3461Z" 
                    stroke="#F38B01" stroke-width="6"/>
                    <path d="M49.9663 66.6672H50.0038" stroke="#F38B01" stroke-width="6" stroke-linecap="round" 
                    stroke-linejoin="round"/>
                    <path d="M50 54.1668V37.5" stroke="#F38B01" stroke-width="6" stroke-linecap="round" 
                    stroke-linejoin="round"/>
                </svg>
            `);
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

    contentBlock.appendChild(pageTitle);
    contentBlock.appendChild(infoBlock);
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

        .page-info {
            line-height: 1.4;
            color: rgba(55, 65, 81, 1);
            font-size: 15px;
        }
    `));

    return svbForm;
}

async function initPage () {
    const docUuid      = getInstanceUuid();
    const session      = getCookie('session');
    const contentBlock = document.querySelector('#content-block');
    const userData     = await checkSession(session);
    const api = new SvbAPI('https://cab.qazaqstroy.kz/', session);

    const DM           = new SvbModel({
        session,
        pagetitle:           'Приемка',
        greenscan:           null,
        acceptancedate:      new Date(),
        concreterequisition: null,
        contractor:          null,
        axes:                null,
        acceptedquantity:    null,
        remains:             0,
        author:              { r: userData.represent, v: userData.uuid },
        staffer:             { r: userData.userSettings.employee.r, v: userData.userSettings.employee.v }
    }, 'doc', 'concreterequisitionreceipts');

    window.session = session;
    window.preloader = SvbComponent.pagePreloader('Загрузка', '');

    if (docUuid === 'new') {
        const urlParams = new URLSearchParams(window.location.search);
        const requisitionUuid = urlParams.get('uuid');

        window.form = await renderForm(DM, contentBlock, async () => {
            return await api.update('document', 'concreterequisitions', DM.model.uuid, {
                acceptor:         DM.model.staffer.v,
                actualsupplier:   DM.model.contractor.v,
                acceptanceonly:   false,
                accepted:         true,
                acceptancedate:   SvbFormatter.sqlTimestamp(DM.model.acceptancedate),
                greenscan:        DM.model.greenscan,
                axes:             DM.model.axes,
                acceptedquantity: DM.model.acceptedquantity,
                remains:          DM.model.remains
            }).then((res) => {
                SvbComponent.pageSuccess('Сохранено', 'Прием бетона сохранен');
                FlutterMessages.success({
                    code: res.status,
                    uuid: res?.result?.uuid
                });
            }).catch((e) => {
                FlutterMessages.error({ message: e });
            });
        });

        if (requisitionUuid) {
            // const requisition = await api.instance('document', 'concreterequisitions', requisitionUuid);
            const requisition = await api.instance('document', 'concreterequisitions', requisitionUuid).then(res => res.instance);

            DM.model.docnumber = requisition.docnumber;
            DM.model.pagetitle = `Заявка RT - №${DM.model.docnumber}`;
            DM.model.reqisitionData = `${requisition.mainproject.r} / ${requisition.project.r}
             / ${requisition.floor} этаж / ${requisition.concrete.r}
             / ${Number(requisition.quantity)}м<sup>2</sup>`;
            DM.model.concreterequisition = { r: requisition.represent, v: requisition.uuid };
            DM.model.contractor = { r: requisition.supplier.r, v: requisition.supplier.v };
            DM.model.greenscan = requisition.greenscan;
            DM.model.axes = requisition.axes;
            DM.model.acceptedquantity = requisition.acceptedquantity;
            DM.model.remains = requisition.remains;

            window.form.disable('concreterequisition');

            window.fileUploader.setValue(DM.model.greenscan);
        }

        window.preloader.remove();
    }
}
