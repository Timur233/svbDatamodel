import SvbModel from '../../../src/SvbModel.js';
import '../../../scss/main.scss';
import SvbElement from '../../../src/components/SvbElement.js';
import SvbComponent from '../../../src/SvbComponent.js';
import SvbFormatter from '../../../src/utils/SvbFormatter.js';
import { SvbAPI } from '../../../src/services/SvbAPI.js';

const docUuid      = getInstanceUuid();
const session      = getCookie('session');
const api = new SvbAPI(
    'https://cab.qazaqstroy.kz/',
    session,
    'https://cab.qazaqstroy.kz/files/'
);

document.addEventListener('DOMContentLoaded', async () => {
    await initPage(docUuid, session);
});

function recalculateItemsId (DM) {
    DM.model.items = DM.model.items.map((i, index) => {
        i.id = index + 1;

        return i;
    });
}

function showAddTaskModal (DM, id = null, taskData = null) {
    const modal = DM.vm.modal(`Задача №${id || DM.model.items.length + 1}`);
    const modalForm = DM.vm.form({
        attributes: [
            {
                label:      'Описание',
                descriptor: 'addTask.comment',
                settings:   {
                    required:    true,
                    multiline:   true,
                    type:        'text',
                    placeholder: 'Начните вводить'
                }
            },
            {
                label:      'Исполнитель',
                descriptor: 'addTask.executor',
                settings:   {
                    required:       true,
                    type:           'catalog',
                    typeObjectName: 'staffers',
                    placeholder:    'Начните вводить'
                }
            },
            {
                label:      'Выполнить до',
                descriptor: 'addTask.deadline',
                settings:   {
                    required:    true,
                    type:        'datetime-local',
                    placeholder: SvbFormatter.date(new Date())
                }
            }
        ]
    });
    const saveButton = SvbElement.create('button', null, 'btn btn--primary', id === null ? 'Создать' : 'Сохранить');
    const activeTask = taskData || DM.model.items.find(i => i.id === id);

    DM.model.addTask.id = activeTask?.id || DM.model.items.length + 1;
    DM.model.addTask.comment = activeTask?.comment || '';
    DM.model.addTask.executor = activeTask?.executor || { r: null, v: null };
    DM.model.addTask.deadline = activeTask?.deadline || new Date();

    modalForm.addStyles({ padding: '0', marginBottom: '20px' });
    modalForm.getInstance().state.attributes.forEach((attr) => {
        if (attr.input?.getInstance === undefined) return;

        const inputInstance = attr.input?.getInstance();

        if (inputInstance?.type === 'catalog' && inputInstance.searchHandling === undefined) {
            inputInstance.searchHandling = api.catalogHelper;
        }
    });

    saveButton.addStyles({ width: '100%' });
    saveButton.addEventListener('click', () => {
        if (modalForm.validate()) {
            if (id === null) {
                DM.model.items.push({ ...DM.model.addTask });
            } else {
                activeTask.comment = DM.model.addTask.comment;
                activeTask.executor = DM.model.addTask.executor;
                activeTask.deadline = DM.model.addTask.deadline;
            }

            modal.hide();
        }
    });

    modal.setContent(modalForm);
    modal.setContent(saveButton);

    modal.show();
}

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
    const observersForm = DM.vm.form({
        attributes: [
            {
                descriptor: 'cardTitle',
                render:     function () {
                    const component = SvbElement.create('div', null, 'card-title', 'Наблюдатели');

                    return component;
                },
                settings: {
                    isCustom: true
                }
            },
            {
                descriptor: 'observers',
                render:     function () {
                    const component = SvbElement.create('div', null, 'observer-list');

                    DM.model.observers.forEach((observer) => {
                        const observerItem = SvbElement.create('div', null, 'observer-list__item observer-item');
                        const observerName = SvbElement.create('span', null, null, observer.r);
                        const observerActions = SvbElement.create('div', null, 'observer-item__actions');
                        const deleteButton = SvbElement.create('button', null, 'observer-item__button', `
                            <svg width="24" height="24" viewBox="0 0 24 24" 
                                fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 5L5 19M5 5L19 19" stroke="#6B7A80" stroke-width="1.5" 
                                stroke-linecap="round" stroke-linejoin="round"/>
                            </svg>
                        `);

                        deleteButton.dataset.uuid = observer.v;
                        deleteButton.addEventListener('click', () => {
                            DM.model.observers = DM.model.observers.filter(i => i.v !== deleteButton.dataset.uuid);
                            if (observer.hasOwnProperty('uuid'))
                                DM.model.deletedObservers.push(observer);
                        });
                        observerActions.appendChild(deleteButton);

                        observerItem.appendChild(observerName);
                        observerItem.appendChild(observerActions);
                        component.appendChild(observerItem);
                    });

                    return component;
                },
                settings: {
                    isCustom: true
                }
            },
            {
                descriptor: 'selectObserver',
                settings:   {
                    type:           'catalog',
                    typeObjectName: 'staffers',
                    placeholder:    'Начните вводить'
                }
            }
        ]
    });
    const tasksForm = DM.vm.form({
        attributes: [
            {
                descriptor: 'cardTitle',
                render:     function () {
                    const component = SvbElement.create('div', null, 'card-title', 'Задачи');

                    return component;
                },
                settings: {
                    isCustom: true
                }
            },
            {
                descriptor: 'items',
                render:     function () {
                    const component = SvbElement.create('div', null, 'tasks-list');

                    DM.model.items.forEach((task) => {
                        const taskItem = SvbElement.create('div', null, 'tasks-list__item tasks-item');
                        const taskHeader = SvbElement.create('div', null, 'tasks-item__header');
                        const taskName = SvbElement.create('span', null, null, `Задача №${task.id}`);
                        const taskDescription = SvbElement.create('div', null, 'task-item__description');
                        const taskActions = SvbElement.create('div', null, 'task-item__buttons');
                        const deleteButton = SvbElement.create('button', null,
                            'btn btn--size-m btn--error task-item__button', `
                            Удалить
                        `);
                        const editButton = SvbElement.create('button', null,
                            'btn btn--size-m btn--cancel task-item__button', `
                            Редактировать
                        `);

                        taskDescription.innerHTML = `
                            <div class="caption">Описание</div>
                            <div class="content">${task.comment}</div>
                            
                            <div class="caption">Исполнитель</div>
                            <div class="content">${task.executor.r}</div>
                            
                            <div class="caption">Выполнить до</div>
                            <div class="content">${SvbFormatter.date(task.deadline)}</div>
                        `;

                        deleteButton.dataset.id = task.id;
                        deleteButton.addEventListener('click', () => {
                            DM.model.items = DM.model.items.filter(i => i.id !== Number(deleteButton.dataset.id));
                            if (task.hasOwnProperty('uuid') && !!task.uuid)
                                DM.model.deletedItems.push(task.uuid);

                            recalculateItemsId(DM);
                        });

                        editButton.dataset.id = task.id;
                        editButton.addEventListener('click', () => {
                            showAddTaskModal(DM, Number(editButton.dataset.id), task);
                        });

                        taskActions.appendChild(deleteButton);
                        taskActions.appendChild(editButton);

                        taskHeader.appendChild(taskName);

                        taskItem.appendChild(taskHeader);
                        taskItem.appendChild(taskDescription);
                        taskItem.appendChild(taskActions);

                        component.appendChild(taskItem);
                    });

                    return component;
                },
                settings: {
                    isCustom: true
                }
            },
            {
                descriptor: 'addButton',
                render:     function () {
                    const component = SvbElement.create('div', null, 'btn', 'Добавить задачу');

                    component.addEventListener('click', () => {
                        showAddTaskModal(DM);
                    });

                    return component;
                },
                settings: {
                    isCustom: true
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
    const fileUploader = DM.vm.fileUploader('Вложения');

    const buttonsGroup = SvbElement.create('div', null, 'app-form__buttons-group buttons-group buttons-group--column');
    const saveButton = SvbElement.create('button', null, 'btn btn--primary', 'Сохранить');

    saveButton.addEventListener('click', async () => {
        DM.model.scan = fileUploader.getValue();

        if (DM.model.observers.length === 0) {
            SvbComponent.pageError('Внимание', 'Нужно указать наблюдателей', [{
                title:    'Закрыть',
                callback: function () { this.close(); }
            }]);

            return;
        }

        if (DM.model.items.length === 0) {
            SvbComponent.pageError('Внимание', 'Нужно добавить задачи', [{
                title:    'Закрыть',
                callback: function () { this.close(); }
            }]);

            return;
        }

        await saveCallback();
    });

    buttonsGroup.appendChild(saveButton);

    DM.watch('selectObserver', (value) => {
        if (value?.v !== null && value?.v !== '' && !DM.model.observers.find(i => i.v === value.v)) {
            DM.model.observers.push(value);
            DM.model.selectObserver = { r: null, v: null };
        }
    });

    DM.watch('observers', () => {
        const observersList = observersForm.getField('observers');

        if (DM.model.observers.length > 0) {
            observersList.show();
        } else {
            observersList.hide();
        }
    });

    DM.watch('items', () => {
        const itemsList = tasksForm.getField('items');

        if (DM.model.items.length > 0) {
            itemsList.show();
        } else {
            itemsList.hide();
        }
    });

    [...tasksForm.getInstance().state.attributes,
        ...observersForm.getInstance().state.attributes].forEach((attr) => {
        if (attr.input?.getInstance === undefined) return;

        const inputInstance = attr.input?.getInstance();

        if (inputInstance?.type === 'catalog' && inputInstance.searchHandling === undefined) {
            inputInstance.searchHandling = api.catalogHelper;
        }
    });

    fileUploader.getInstance()
        .loadMethod = api.fs.upload.bind(api.fs);

    fileUploader.getInstance()
        .removeMethod = api.fs.remove.bind(api.fs);

    fileUploader.getInstance().cameraButtonClick = () => {
        flutterMessages().openCamera();
    };

    window.fileUploader = fileUploader;

    contentBlock.appendChild(title);
    contentBlock.appendChild(observersForm);
    contentBlock.appendChild(tasksForm);
    contentBlock.appendChild(fileUploader);
    contentBlock.appendChild(summary);
    contentBlock.appendChild(buttonsGroup);
    contentBlock.appendChild(SvbElement.create('style', null, null, `
        .observer-list {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .observer-item {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        .observer-item__button {
            border: none;
            background: none;
            padding: 0 !important;
        }

        .task-item__description {
            margin-bottom: 16px;
        }

        .caption {
            margin-top: 16px;
            font-size: 14px;
            color: rgba(107, 122, 128, 1);
        }

        .content {
            color: rgba(0, 0, 0, 1);
        }

        .task-item__buttons {
            display: flex;
            gap: 3%;
        }

        .task-item__buttons > .btn {
            width: 50%;
        }

        .tasks-item {
            padding-bottom: 20px;
            margin-bottom: 4px;
            border-bottom: 1px solid rgba(209, 213, 219, 1);
        }

        .tasks-item__header > span {
            font-size: 16px;
        }

        .tasks-item__header {
            margin-top: 16px;
        }

        .card-title {
            font-size: 18px;
        }
    `));
}

async function initPage (docUuid, session) {
    const contentBlock = document.querySelector('#content-block');
    const userData     = await api.checkSession(session);
    const DM           = new SvbModel({
        session,
        pageTitle:      'Служебная записка',
        observers:      [],
        deletedObservers: [],
        items:          [],
        deletedItems:   [],
        selectObserver: {},
        addTask:        {},
        docdate:        new Date(),
        author:         { r: userData.userSettings.employee.r, v: userData.userSettings.employee.v }
    }, 'doc', 'worknotes');

    window.session = session;
    window.preloader = SvbComponent.pagePreloader('Загрузка', '');

    if (docUuid === 'new') {
        await renderForm(DM, contentBlock, async () => {
            const tasks = [];

            for (let i = 0; i < DM.model.items.length; i++) {
                const item = DM.model.items[i];
                const task = await api.insert('document', 'tasks', null, {
                    author:     DM.model.author.v,
                    deadline:   SvbFormatter.sqlTimestamp(item.deadline),
                    decription: item.comment,
                    executor:   item.executor.v,
                    draft:      false,
                    subject:    '-',
                    type:       '74ba8a95-b787-435f-be07-8a0afc035379'
                });

                tasks.push(task.uuid);
            }

            return await api.insert('document', 'worknotes', null, {
                author:     DM.model.author.v,
                decription: '-',
                draft:      false,
                scan:       DM.model.scan,
                subject:    'Служебная записка'
            },
            {
                items:     tasks.map((i, index) => ({ rownumber: index + 1, task: i })),
                observers: DM.model.observers.map((i, index) => ({ rownumber: index + 1, staffer: i.v }))
            })
                .then((res) => {
                    SvbComponent.pageSuccess('Сохранено', 'Служебная записка сохранена');
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

        DM.model.observers = [];
        DM.model.items = [];

        window.preloader.remove();
    } else {
        const request = await api.instance('document', 'worknotes', docUuid, { items: true, observers: true });
        const { instance, tables } = request;

        for (let i = 0; i < tables.items.list.rows.length; i++) {
            const taskRow = tables.items.list.rows[i];
            const taskData = await api.instance('document', 'tasks', taskRow.task.v);

            taskRow.data = taskData.instance;
        }

        await renderForm(DM, contentBlock, async () => {
            const itemsTable = {updated: [], inserted: [], deleted: DM.model.deletedItems};
            const observersTable = { updated: [], inserted: [], deleted: [] };

            DM.model.observers.map((i, index) => {
                if (i.hasOwnProperty('uuid')) {
                    observersTable.deleted.push(i.uuid);
                    if (!DM.model.deletedObservers.some(el => el.hasOwnProperty('uuid') && el.uuid === i.uuid))
                        observersTable.inserted.push({ rownumber: index + 1, staffer: i.v });
                } else {
                    observersTable.inserted.push({ rownumber: index + 1, staffer: i.v });
                }
            });

            DM.model.deletedObservers.map((i) => {
               observersTable.deleted.push(i.uuid);
            });

            const insertTasks = [];
            const createTasks = [];
            const updateTasks = [];
            DM.model.items.forEach(task => {
               if (!task.hasOwnProperty('uuid')) {
                   createTasks.push(task);
               } else {
                   updateTasks.push(task);
               }
            });

            for (const task of updateTasks) {
                await api.update('document', 'tasks', task.taskId, {
                    deadline:   SvbFormatter.sqlTimestamp(task.deadline),
                    decription: task.comment,
                    executor:   task.executor.v,
                    draft: false,
                }, {}, {}, {metadata: false, view: false, data: true, dataparams: {header: true}});
            }

            for (const task of createTasks) {
                const createdTask = await api.insert('document', 'tasks', null, {
                    author:     DM.model.author.v,
                    deadline:   SvbFormatter.sqlTimestamp(task.deadline),
                    decription: task.comment,
                    executor:   task.executor.v,
                    draft:      false,
                    subject:    '-',
                    type:       '74ba8a95-b787-435f-be07-8a0afc035379'
                });

                insertTasks.push(createdTask.uuid);
            }

            itemsTable.inserted = insertTasks.map((i, index) => {
                return {rownumber: updateTasks.length + (index + 1), task: i};
            });

            return await api.update('document', 'worknotes', docUuid,
                {
                    scan: DM.model.scan,
                },
                {
                    observers: observersTable,
                    items: itemsTable,
                }
            ).then((res) => {
                SvbComponent.pageSuccess('Сохранено', 'Служебная записка сохранена');
                flutterMessages()
                    .success({
                        code: res.status,
                        uuid: res?.result?.uuid
                    });
            }).catch((e) => {
                flutterMessages()
                    .error({ message: e });
            });
        });

        DM.model.pageTitle = 'Служебная записка';
        DM.model.observers = tables.observers.list.rows.map(i => ({ r: i.staffer.r, v: i.staffer.v, uuid: i.uuid }));
        DM.model.items = tables.items.list.rows.sort((a, b) => a.rownumber - b.rownumber).map((row, index) => ({
            id:       index + 1,
            uuid:     row.uuid,
            comment:  row.data.decription,
            executor: row.data.executor,
            deadline: row.data.deadline,
            taskId:   row.task.v,
        }));
        DM.model.scan = instance.scan;
        DM.model.docdate = SvbFormatter.date(instance.docdate);
        DM.model.author = { r: instance.author.r, v: instance.author.v };

        if (window.fileUploader)
            window.fileUploader.setValue(DM.model.scan);

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
