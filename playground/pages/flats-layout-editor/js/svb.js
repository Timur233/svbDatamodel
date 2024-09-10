'use strict';

const svbAttrTypes = [
    'text', 'numeric', 'date', 'timestamp', 'boolean', 'system', 'catalog',
    'document', 'doctable', 'uuid', 'json', 'file', 'image', 'audio',
    'video', 'href'
];
const elementTypes = [
    'span', 'input', 'textarea', 'checkbox', 'radiobutton', 'file'
];

class Svb {
    // static svbList = {};

    constructor (svbAppUrl) {
        if (!svbAppUrl) { throw new Error(`svbAppUrl ${svbAppUrl} not specified`); }

        this.svbAppUrl = svbAppUrl;
        this.svbVersion = 0;

        this.appName;
        this.appPrefix = false;

        this.md = {};

        this.origin = new SvbDataModel();
        this.dm = {};

        // this.user = this.instDM("system.users");
        this.lang = 'rus';
        this.user;

        this.onUnauthorized = async () => { return false; };

        // if (!Svb.svbList[svbAppUrl]) Svb.svbList[this.svbAppUrl] = this;
    }

    async init () {
        // Проверяем доступность сервера
        // и получаем appName и appPrefix
        if (!this.appName || !this.appPrefix) {
            const testRes = await this.svbFetch({ type: 'test' });

            if (!testRes || testRes.status !== 200 || !testRes.result ||
                    !testRes.result.appName || !testRes.result.appPrefix) {
                throw new Error('App init error');
            }

            this.appName = testRes.result.appName;
            this.appPrefix = testRes.result.appPrefix;
        }

        if (!this.user) {
            // Проверяем сессию
            const checkSessionRes = await this.checkSession({
                resOptions: {
                    user:          true,
                    userSettings:  true,
                    role:          true,
                    interface:     true,
                    point:         true,
                    pointSettings: true,
                    lang:          true
                }
            });

            if (checkSessionRes && checkSessionRes.session && checkSessionRes.session.valid === true) {
                this.user = checkSessionRes.user;
                this.user.role = checkSessionRes.role;
                this.user.interface = checkSessionRes.interface;
                this.user.point = checkSessionRes.point;
                this.user.lang = checkSessionRes.lang;
            }
        }
    }

    async createSvbObject (type, name, dataType, oid, options) {
        if (!type || !name || !dataType || !oid) {
            throw new Error('No required params');
        }

        if (!Svb.CONST.OBJTYPES.includes(type)) {
            throw new Error('Bad object type');
        }

        let svbObject;

        if (dataType === 'instance') {
            if (type === 'catalog') {
                svbObject = new SvbCatInstance(name, oid, this);
            } else if (type === 'document') {
                svbObject = new SvbDocInstance(name, oid, this);
            } else if (type === 'doctable') {
                svbObject = new SvbDocTableInstance(name, oid, this);
            } else if (type === 'system') {
                svbObject = new SvbSysInstance(name, oid, this);
            }
        } else {
            dataType = 'list';

            if (type === 'catalog') {
                svbObject = new SvbCatList(name, oid, this);
            } else if (type === 'document') {
                svbObject = new SvbDocList(name, oid, this);
            } else if (type === 'doctable') {
                svbObject = new SvbDocTableList(name, oid, this);
            } else if (type === 'system') {
                svbObject = new SvbSysList(name, oid, this);
            }
        }

        if (!svbObject) {
            throw new Error('Svb object create error');
        }

        await svbObject.init(options);

        return svbObject;
    }

    async createCustomObject (oid, options) {
        const customForm = new CustomForm(oid);
        // await customForm.init(options);

        return customForm;
    }

    async bind (htmlTemplateText, svbObjectArray) {
        // Из текстового HTML-шаблона делаем шаблон из HTML-elements
        const tmplNode = document.createElement('div');

        tmplNode.innerHTML = htmlTemplateText;

        // Замапим svbObject с их ключами
        const svbObjectMap = {};

        for (let i = 0; i < svbObjectArray.length; i++) {
            const svbObject = svbObjectArray[i];

            svbObjectMap[svbObject.oid] = svbObject;
        }

        const components = {};
        const svbContent = await this.processingTmplNode(tmplNode, document.createElement('div'), svbObjectMap, components);

        return { svbContent: svbContent.innerHtml, components };
    }

    async processingTmplNode (tmplNode, newNode, svbObjectMap, components) {
        for (const childTmplNode of tmplNode.childNodes) {
            // Пропускаем текстовые элементы
            const childTagName = childTmplNode.nodeName.toLowerCase();

            if (childTagName === '#text') {
                // newNode.innerHTML += childTmplNode.nodeValue;
                const textContent = document.createTextNode(childTmplNode.nodeValue);

                newNode.appendChild(textContent);
                continue;
            }

            let svbCmpElement, svbOid;

            if (childTmplNode.dataset && childTmplNode.dataset.svbComponent) {
                if (['toolbar', 'list'].includes(childTmplNode.dataset.svbComponent)) {
                    if (!childTmplNode.dataset || !childTmplNode.dataset.svbOid) {
                        throw new Error('OID not specified');
                    }

                    svbOid = childTmplNode.dataset.svbOid;
                }

                switch (childTmplNode.dataset.svbComponent) {
                    case 'workspace':
                        svbCmpElement = new SvbElementWorkspace();
                        break;
                    case 'window':
                        svbCmpElement = new SvbElementWindow();
                        break;
                    case 'panel':
                        svbCmpElement = new SvbElementPanel();
                        break;
                    case 'toolbar':
                        svbCmpElement = new SvbElementToolbar(svbObjectMap[svbOid]);
                        break;
                    case 'list':
                        const svbObject = svbObjectMap[svbOid];

                        if (childTagName === 'table') {
                            svbCmpElement = new SvbElementTable(svbObject);
                        } else if (childTagName === 'select') {
                            svbCmpElement = new SvbElementSelect(svbObject);
                        }

                        break;
                    case 'filters':
                        svbCmpElement = new SvbElementFilters(svbObjectMap[svbOid]);
                        break;
                }
            }

            let childNewNode;

            if (svbCmpElement) {
                if (svbCmpElement.svb.objectRelated) {
                    await svbCmpElement.svb.component.init();
                }

                if (childTmplNode.id) {
                    components[childTmplNode.id] = svbCmpElement.svb.component;
                }

                childNewNode = svbCmpElement;

                if (childTmplNode.dataset && childTmplNode.dataset.svbOid) {
                    childNewNode.dataset.svbOid = childTmplNode.dataset.svbOid;
                }

                if (childTmplNode.dataset && childTmplNode.dataset.svbComponent) {
                    childNewNode.dataset.svbComponent = childTmplNode.dataset.svbComponent;
                }
            } else {
                childNewNode = document.createElement(childTagName);
            }

            if (childTmplNode.id) {
                childNewNode.id = childTmplNode.id;
            }

            if (childTmplNode.className) {
                const classNames = childTmplNode.className.split(' ');

                classNames.forEach((name) => {
                    childNewNode.classList.add(name);
                });
            }

            if (tmplNode.childNodes.length > 0) {
                childNewNode = await this.processingTmplNode(childTmplNode, childNewNode, svbObjectMap, components);
            }

            newNode.appendChild(childNewNode);
        }

        return newNode;
    }

    async getMetadata (type, name) {
        if (!this.md[type] || !this.md[type][name]) {
            const mdRes = await this.svbFetch({
                type:       'metadata',
                action:     'select',
                descriptor: `${type}.${name}`
            });

            if (mdRes.status !== 200 || !mdRes.result || !mdRes.result.data) {
                throw new Error('metadata init error');
            }

            if (!this.md[type]) {
                this.md[type] = {};
            }

            this.md[type][name] = mdRes.result.data;
        }

        return this.md[type][name];
    }

    async getVset (objType, objName, datatype, vsetName) {
        const vsetRes = await this.svbFetch({
            type:       'view',
            action:     'getVset',
            reqoptions: {
                objType,
                objName,
                datatype,
                view: {
                    name: vsetName
                }
            }
        });
        let vset;

        if (vsetRes.status === 200 && vsetRes.result && vsetRes.result.vset) {
            vset = vsetRes.result.vset;
        }

        if (!vset.default) {
            vset = {
                default: {
                    attr: {
                        represent: {
                            md: {
                                name:      'represent',
                                type:      'text',
                                represent: 'Наименование'
                            },
                            element: {
                                readOnly: true
                            },
                            value: {
                                width:  150,
                                height: 24
                            }
                        }
                    }
                }
            };
        }

        return vset;
    }

    syncDMListForDescriptor (descriptor, data) {
        if (this.origin[descriptor]) {
            if (this.origin[descriptor].IDM) {
                for (var i = 0; i < this.origin[descriptor].IDM.length; i++) {
                    this.origin[descriptor].IDM[i].loadData(data);
                }
            }

            if (this.origin[descriptor].LDM) {
                for (var i = 0; i < this.origin[descriptor].LDM.length; i++) {
                    this.origin[descriptor].LDM[i].reloadData();
                }
            }
        }
    }

    async checkSession (options) {
        let session = options.session;

        if (!session) {
            if (!this.appPrefix) await this.init();

            session = SVBUtils.getCookie(this.appPrefix + '_session');

            if (!session) session = SVBUtils.getCookie('session');

            if (!session) return false;
        }

        const fetchData = {
            type:   'user',
            action: 'checkSession',
            session
        };

        if (options) {
            if (options.resOptions) fetchData.resoptions = options.resOptions;
        }

        const checkSessionRes = await this.svbFetch(fetchData);

        if (checkSessionRes) {
            return checkSessionRes;
        }

        // this.user.IDM.loadData(checkSessionRes.userData);
        //        this.user.currentRole_IDM.loadData(checkSessionRes.roleData);
        //        this.user.role.IDM.loadData(checkSessionRes.roleData);
        //        this.user.role.IDM.loadData(checkSessionRes.roleData);

        return {
            status: 400
        };
    }

    async svbFetch (fetchData) {
        if (!this.svbAppUrl) throw new Error('svbAppUrl is not init');

        if (!fetchData) throw Error('Arguments is null');

        if (!fetchData.session) {
            if (fetchData.type === 'test' ||
                    (fetchData.type === 'user' && fetchData.action === 'authentication')) {
                // В этих случаях сессия в запросе не нужна
            } else {
                // в остальных случаях сессия обязательна
                //                if (this.appPrefix === false) {
                //                    await this.init();
                //                }
                fetchData.session = SVBUtils.getCookie(this.appPrefix + '_session');

                if (!fetchData.session) {
                    fetchData.session = SVBUtils.getCookie('session');
                }

                if (!fetchData.session) {
                    console.error('Необходимо авторизоваться');

                    return await this.onUnauthorized();
                }
            }
        }

        let result;

        await fetch(this.svbAppUrl, {
            method:  'POST',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(fetchData)
        })
            .then(response => response.json())
            .then((data) => {
                result = data;
            })
            .catch(error => console.error(error));

        return result;
    }

    async getHtmlTemplate (templateName) {
        const htmlTemplate = await this.svbFetch({
            type:       'view',
            action:     'getHtml',
            reqoptions: {
                name: templateName
            }
        });

        if (htmlTemplate.status === 200) {
            return htmlTemplate.result.template;
        }

        return '';
    }

    decomposeSvbDescriptor (svbDescriptor) {
        // document.worknotes[1].table.items
        if (!svbDescriptor || typeof svbDescriptor !== 'string' || svbDescriptor.trim() === '') {
            throw Error('Descriptor is invalid');
        }

        const dscrData = {
            original: svbDescriptor
        };

        const split_descriptor = svbDescriptor.split('.');

        if (['cat', 'catalog', 'doc', 'document', 'sys', 'system'].includes(split_descriptor[0])) {
            dscrData.objType = split_descriptor[0];
        } else {
            throw Error('Descriptor is invalid (bad type)');
        }

        dscrData.type = 'type';

        if (split_descriptor.length > 1) {
            if (!split_descriptor[1] || split_descriptor[1].trim() === '') { throw Error('Descriptor is invalid (bad name)'); }

            const match = split_descriptor[1].match(/(.*) \[(.*?)\]/);

            if (match) {
                if (!match[0] || match[0].trim() === '') { throw Error('Descriptor is invalid (bad name)'); }

                if (!match[1] || match[1].trim() === '') { throw Error('Descriptor is invalid (bad id)'); }

                dscrData.objName = match[0];
                dscrData.objId = match[1];
                dscrData.type = 'instance';

                if (split_descriptor.length > 3) {
                    throw Error('Descriptor is invalid (bad length)');
                } else if (split_descriptor.length > 2) {
                    if (!split_descriptor[1] || split_descriptor[1].trim() === '') { throw Error('Descriptor is invalid (bad attrName)'); }

                    dscrData.attrName = split_descriptor[2];
                    dscrData.type = 'attribute';
                }
            } else {
                dscrData.objName = split_descriptor[1];
                dscrData.type = 'list';

                if (split_descriptor.length > 5) {
                    throw Error('Descriptor is invalid (bad length)');
                } else {
                    if (split_descriptor.length > 2) {
                        if (dscrData.objType !== 'doc' || split_descriptor[2] !== 'tab') { throw Error('Descriptor is invalid (bad doctab type)'); }

                        dscrData.objType = 'doctab';

                        if (split_descriptor.length > 3) {
                            if (!split_descriptor[3] || split_descriptor[3].trim() === '') { throw Error('Descriptor is invalid (bad doctab)'); }

                            const match2 = split_descriptor[3].match(/(.*) \[(.*?)\]/);

                            if (match2) {
                                if (!match2[0] || match2[0].trim() === '') { throw Error('Descriptor is invalid (bad doctab name)'); }

                                if (!match2[1] || match2[1].trim() === '') { throw Error('Descriptor is invalid (bad doctab id)'); }

                                dscrData.docTabName = match2[0];
                                dscrData.docTabId = match2[1];
                                dscrData.type = 'docTabInstance';

                                if (split_descriptor.length > 4) {
                                    if (!split_descriptor[4] || split_descriptor[4].trim() === '') { throw Error('Descriptor is invalid (bad doctab attrName)'); }

                                    dscrData.docTabAttrName = split_descriptor[2];
                                    dscrData.type = 'docTabAttribute';
                                }
                            } else {
                                dscrData.docTabName = split_descriptor[3];
                                dscrData.type = 'docTabList';
                            }
                        }
                    }
                }
            }
        }

        return dscrData;
    }

    static get CONST () {
        return Object.freeze({
            TYPE: {
                METADATA:  'metadata',
                GROUP:     'group',
                // OBJECTS
                SYSTEM:    'system',
                CATALOG:   'catalog',
                DOCUMENT:  'document',
                DOCTABLE:  'doctable',
                REGISTER:  'register',
                // BASE
                TEXT:      'text',
                BOOLEAN:   'boolean',
                NUMERIC:   'numeric',
                DATE:      'date',
                TIMESTAMP: 'timestamp',
                // MEDIA
                FILE:      'file',
                IMAGE:     'image',
                AUDIO:     'audio',
                VIDEO:     'video',
                // OTHER
                UUID:      'uuid',
                JSON:      'json'
            },
            HTTP: {
                OK:                  { status: 200, statusText: 'OK' },
                BadRequest:          { status: 400, statusText: 'Bad Request' },
                Unauthorized:        { status: 401, statusText: 'Unauthorized' },
                Forbidden:           { status: 403, statusText: 'Forbidden' },
                MethodNotAllowed:    { status: 405, statusText: 'Method Not Allowed' },
                InternalServerError: { status: 500, statusText: 'Internal Server Error' },
                UnknownError:        { status: 520, statusText: 'Unknown Error' }
            },
            MSGTYPE: {
                DEBUG:    'debug',
                INFO:     'info',
                WARRNING: 'warrning',
                ERROR:    'error'
            },
            OBJTYPES: ['system', 'catalog', 'document', 'doctable']
        });
    }

    instDM (descriptor) {
        const instDM = new DocInstDM(descriptor, this);

        instDM.afterSave = () => {
            this.syncDMListForDescriptor(descriptor, instDM.data);
        };

        if (!this.origin[descriptor]) {
            this.origin[descriptor] = {
                LDM: [],
                IDM: []
            };
        }

        if (!this.origin[descriptor].IDM) {
            this.origin[descriptor].IDM = [];
        }

        this.origin[descriptor].IDM.push(instDM);

        return instDM;
    }

    listDM (descriptor) {
        const listDM = new ListDM(descriptor, this);

        if (!this.origin[descriptor]) {
            this.origin[descriptor] = {
                LDM: [],
                IDM: []
            };
        }

        if (!this.origin[descriptor].LDM) {
            this.origin[descriptor].LDM = [];
        }

        this.origin[descriptor].LDM.push(listDM);

        return listDM;
    }

    async newInstDoc (docName, options) {
        let dmID = options.dmID;
        const docUuid = options.objUuid;

        if (!dmID) {
            dmID = 'dm1';
            const dmCount = Object.keys(this.origin.dm).length;

            if (dmCount > 0) {
                dmID = 'dm' + (dmCount + 1);
                this.origin.dm[dmID] = {};
            }
        }

        const newDoc = new DocInstDM(docName, this, dmID);

        await newDoc.init(docUuid);

        return newDoc;

        //        const descriptor = "document." + docName;
        //        const md = {
        //            name: docName,
        //            represent: "",
        //            instancerepresent: ""
        //        };
        //        return {
        //            descriptor: descriptor,
        //            md: md,
        //            table: {
        //                items: new DocInstDM(docName, this)
        //            }
        //        };
    }

    async newInstCat (catName, options) {
        let dmID = options.dmID;
        const catUuid = options.objUuid;

        if (!dmID) {
            dmID = 'dm1';
            const dmCount = Object.keys(this.origin.dm).length;

            if (dmCount > 0) {
                dmID = 'dm' + (dmCount + 1);
                this.origin.dm[dmID] = {};
            }
        }

        const newCat = new CatInstDM(catName, this, dmID);

        await newCat.init(catUuid);

        return newCat;
    }
}

class SvbObject {
    constructor (type, name, datatype, objectId, svb) {
        this.type = type;
        this.name = name;
        this.descriptor = `${type}.${name}`;
        this.datatype = datatype;
        this.oid = objectId;
        this.svb = svb;

        this.md = {};
        this.dm = new SvbDataModel();
        this.vset = {
            default: {
                attr: {
                    represent: {
                        md: {
                            name:      'represent',
                            type:      'text',
                            represent: 'Наименование'
                        },
                        settings: {
                            readOnly: true
                        },
                        value: {
                            width:  150,
                            height: 24
                        }
                    }
                }
            }
        };

        // this.toolbar = new SvbCompToolbar(this);
    }

    async init (options) {
        this.md = await this.svb.getMetadata(this.type, this.name);

        if (options.vset) {
            const vsetRes = await this.svb.getVset(this.type, this.name, this.datatype, options.vset);
            //            if (vsetRes) {
            //                this.vset[options.vset] = vsetRes;
            //            }
        }
    }
}

class SvbList extends SvbObject {
    constructor (type, name, objectId, svb) {
        super(type, name, 'list', objectId, svb);

        // this.filter = new SvbCompFilters(this);
        // this.tags = new SvbCompTags(this);

        this.sort = {};
        this.page = 0;
        this.limit = 25;
        this.pages = [];
        this.instanceCount = 0;
        this.activeInstance = 0;
        this.selectedInstances = [];

        this.list = {
            viewType: 'table'
        };
        // this.filters = new SvbCompFilters(objectId);
    }

    async init (options) {
        await super.init(options);

        if (options) {
            if (options.list && options.list.componentType) {
                this.listViewType = options.list.viewType;
            }

            if (options.listComponentType === 'table') {
                this.list = new SvbCompTable();
            } else if (options.listComponentType === 'select') {
                this.list = new SvbCompSelect();
            }

            if (options.filter) {
                if (options.filter.static) {
                    for (const filterKey in options.filter.static) {
                        // this.filter.static[filterKey] = options.filter.static[filterKey];
                    }
                }

                if (options.filter.user) {
                    for (const filterKey in options.filter.user) {
                        // this.filter.user[filterKey] = options.filter.user[filterKey];
                    }
                }
            }
        }
    }

    async loadData () {

    }
}

class SvbInstance extends SvbObject {
    constructor (type, name, objectId, svb) {
        super(type, name, 'instance', objectId, svb);

        this.attr = {};
    }

    async init (options) {

    }
}

class SvbSysList extends SvbList {
    constructor (name, objectId, svb) {
        super('system', name, objectId, svb);
    }
}

class SvbSysInstance extends SvbInstance {
    constructor (name, objectId, svb) {
        super('system', name, objectId, svb);
    }
}

class SvbCatList extends SvbList {
    constructor (name, objectId, svb) {
        super('catalog', name, objectId, svb);
    }
}

class SvbCatInstance extends SvbInstance {
    constructor (name, objectId, svb) {
        super('catalog', name, objectId, svb);
    }
}

class SvbDocList extends SvbList {
    constructor (name, objectId, svb) {
        super('document', name, objectId, svb);
    }
}

class SvbDocInstance extends SvbInstance {
    constructor (name, objectId, svb) {
        super('document', name, objectId, svb);
    }
}

class SvbDocTableList extends SvbList {
    constructor (name, objectId, svb) {
        super('doctable', name, objectId, svb);
    }
}

class SvbDocTableInstance extends SvbInstance {
    constructor (name, objectId, svb) {
        super('doctable', name, objectId, svb);
    }
}

class CustomForm {
    constructor () {
    }
}

class SvbAttrElement {
    constructor (svbAttrType, elementType) {
        this.svbAttrType = svbAttrType;
        this.htmlType = htmlType;

        if (!svbAttrTypes.includes(svbAttrType)) {
            throw new Error('bad svb attr type');
        }

        if (!elementTypes.includes(elementType)) {
            throw new Error('bad element type');
        }

        let elem;

        switch (elementTypes) {
            case 'input':
                elem = document.createElement('input');
                break;
            default:
                elem = document.createElement('div');
                break;
        }

        const customEvent = new Event('svb:change');

        elem.addEventListener('change', () => {
            elem.dispatchEvent(customEvent);
        });

        const inputReactor = model.addReactor({
            descriptor: 'dataC.b',
            emitEvent:  function (value) {
                exampleInput.value = model.model.dataC.b;
            }
        });

        elem.addEventListener('svb:change', (e) => {
            inputReactor.set(e.target.value);
        });

        return elem;
    }
}

// SvbComponent

class SvbComponent {
    constructor (svbComponentType, svbCmpElement) {
        this.type = svbComponentType;
        this.view = svbCmpElement;
    }
}
class SvbCmpWorkspace extends SvbComponent {
    constructor (svbCmpElement, options) {
        super('workspace', svbCmpElement);

        // add params
        this.windowRegister = {};
    }

    addWindow (svbCmpWindow) {
        this.view.appendChild(svbCmpWindow);
    }
}
class SvbCmpWindow extends SvbComponent {
    constructor (svbCmpElement, options) {
        super('window', svbCmpElement);
    }
}
class SvbCmpPanel extends SvbComponent {
    constructor (svbCmpElement, options) {
        super('panel', svbCmpElement);
    }
}
class SvbCmpTitle extends SvbComponent {
    constructor (svbCmpElement, options) {
        super('title', svbCmpElement);
    }

    async init () {}
}
class SvbCmpTable extends SvbComponent {
    constructor (svbCmpElement, options) {
        super('table', svbCmpElement);
    }

    async init () {}
    //        let vset = this.svbObject.vset;
    //        if (!vset) {
    //            vset = {
    //                attr: {
    //                    represent: ""
    //                }
    //            };
    //        }
    //
    //        for (const attrName in vset.attr) {
    //            const attr = vset.attr[attrName];
    //        }
    //        return this;
    //    }

    addRow () {

    }

    deleteRow () {

    }
}
class SvbCmpTree extends SvbComponent {
    constructor (svbCmpElement, options) {
        super('tree', svbCmpElement);
    }

    async init () {}
}
class SvbCmpSelect extends SvbComponent {
    constructor (svbCmpElement, options) {
        super('select', svbCmpElement);
    }

    async init () {}

    addOption () {

    }

    deleteOption () {

    }
}
class SvbCmpToolbar extends SvbComponent {
    constructor (svbCmpElement, options) {
        super('toolbar', svbCmpElement);
    }

    async init () {}
}
class SvbCmpFilters extends SvbComponent {
    constructor (svbCmpElement, options) {
        super('filters', svbCmpElement);
    }

    async init () {}
}
class SvbCmpTags extends SvbComponent {
    constructor (svbCmpElement, options) {
        super('tags', svbCmpElement);
    }

    async init () {}
}

class SvbElement {
    constructor () {
        const svbCmpElement = document.createElement('div');

        svbCmpElement.classList.add('svbCmpElement');
        svbCmpElement.svb = {
            object: false
        };

        return svbCmpElement;
    }
}

class SvbElementWorkspace extends SvbElement {
    constructor (options) {
        const svbCmpElement = super();

        svbCmpElement.classList.add('svbCmpElem_workspace');
        svbCmpElement.svb.component = new SvbCmpWorkspace(svbCmpElement, options);

        return svbCmpElement;
    }
}
class SvbElementWindow extends SvbElement {
    constructor (options) {
        const svbCmpElement = super();

        svbCmpElement.classList.add('svbCmpElem_window');
        svbCmpElement.svb.component = new SvbCmpWindow(svbCmpElement, options);

        return svbCmpElement;
    }
}
class SvbElementPanel extends SvbElement {
    constructor (options) {
        const svbCmpElement = super();

        svbCmpElement.classList.add('svbCmpElem_panel');
        svbCmpElement.svb.component = new SvbCmpPanel(svbCmpElement, options);

        return svbCmpElement;
    }
}

class SvbObjectElement extends SvbElement {
    constructor (svbObject) {
        const svbCmpElement = super();

        if (!svbObject) throw new Error('svb object not specified');

        this.svb.object = svbObject;

        return svbCmpElement;
    }

    async init () {}
}

class SvbElementTitle extends SvbObjectElement {
    constructor (svbObject, options) {
        const svbCmpElement = super(svbObject);

        svbCmpElement.classList.add('svbCmpElem_title');
        svbCmpElement.svb.component = new SvbCmpTitle(svbCmpElement, options);

        return svbCmpElement;
    }
}
class SvbElementTable extends SvbObjectElement {
    constructor (svbObject, options) {
        const svbCmpElement = super(svbObject);

        svbCmpElement.classList.add('svbCmpElem_table');
        svbCmpElement.svb.component = new SvbCmpTable(svbCmpElement, options);

        return svbCmpElement;
    }
}
class SvbElementTree extends SvbObjectElement {
    constructor (svbObject, options) {
        const svbCmpElement = super(svbObject);

        svbCmpElement.classList.add('svbCmpElem_tree');
        svbCmpElement.svb.component = new SvbCmpTree(svbCmpElement, options);

        return svbCmpElement;
    }
}
class SvbElementSelect extends SvbObjectElement {
    constructor (svbObject, options) {
        const svbCmpElement = super(svbObject);

        svbCmpElement.classList.add('svbCmpElem_select');
        svbCmpElement.svb.component = new SvbCmpSelect(svbCmpElement, options);

        return svbCmpElement;
    }
}
class SvbElementToolbar extends SvbObjectElement {
    constructor (svbObject, options) {
        const svbCmpElement = super(svbObject);

        svbCmpElement.classList.add('svbCmpElem_toolbar');
        svbCmpElement.svb.component = new SvbCmpToolbar(svbCmpElement, options);

        return svbCmpElement;
    }
}
class SvbElementFilters extends SvbObjectElement {
    constructor (svbObject, options) {
        const svbCmpElement = super(svbObject);

        svbCmpElement.classList.add('svbCmpElem_filters');
        svbCmpElement.svb.component = new SvbCmpFilters(svbCmpElement, options);

        return svbCmpElement;
    }
}
class SvbElementTags extends SvbObjectElement {
    constructor (svbObject, options) {
        const svbCmpElement = super(svbObject);

        svbCmpElement.classList.add('svbCmpElem_tags');
        svbCmpElement.svb.component = new SvbCmpTags(svbCmpElement, options);

        return svbCmpElement;
    }
}
