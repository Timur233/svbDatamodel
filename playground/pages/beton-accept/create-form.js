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

        inputInstance.searchHandling = catalogHelper;
    });

    fileUploader.getInstance()
        .loadMethod = filesActions().upload.bind(fileUploader.getInstance());

    fileUploader.getInstance()
        .removeMethod = filesActions().remove.bind(fileUploader.getInstance());

    fileUploader.getInstance().cameraButtonClick = () => {
        flutterMessages().openCamera();
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
    const DM           = new SvbModel({
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
            return await updateAction(requisitionUuid, {
                acceptor:         DM.model.staffer.v,
                actualsupplier:   DM.model.contractor.v,
                acceptanceonly:   false,
                accepted:         true,
                acceptancedate:   SvbFormatter.sqlTimestamp(DM.model.acceptancedate),
                greenscan:        DM.model.greenscan,
                axes:             DM.model.axes,
                acceptedquantity: DM.model.acceptedquantity,
                remains:          DM.model.remains
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

            DM.model.docnumber = requisition.attr.docnumber;
            DM.model.pagetitle = `Заявка RT - №${DM.model.docnumber}`;
            DM.model.reqisitionData = `${requisition.attr.mainproject.r} / ${requisition.attr.project.r}
             / ${requisition.attr.floor} этаж / ${requisition.attr.concrete.r}
             / ${Number(requisition.attr.quantity)}м<sup>2</sup>`;
            DM.model.concreterequisition = { r: requisition.attr.represent, v: requisition.attr.uuid };
            DM.model.contractor = { r: requisition.attr.supplier.r, v: requisition.attr.supplier.v };
            DM.model.greenscan = requisition.attr.greenscan;
            DM.model.axes = requisition.attr.axes;
            DM.model.acceptedquantity = requisition.attr.acceptedquantity;
            DM.model.remains = requisition.attr.remains;

            window.form.disable('concreterequisition');

            window.fileUploader.setValue(DM.model.greenscan);
        }

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

async function updateAction (uuid, data) {
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
