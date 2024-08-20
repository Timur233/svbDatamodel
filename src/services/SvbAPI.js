import { FsAPI } from './FsAPI';

export class SvbAPI {
    constructor (appURL, session, fileServerURL) {
        this.APP_URL = appURL || null;
        this.FILE_SERVER_URL = fileServerURL || null;
        this._session = session || null;
        this._fs = null;

        this._defaultReqoptions = {
            lang:             'ru',
            limit:            25,
            page:             'last',
            view:             null,
            selectedInstance: null
        };

        this._defaultResoptions = {
            metadata:   true,
            view:       true,
            data:       true,
            filters:    true,
            sort:       true,
            tree:       false,
            dataparams: {
                header: true
            }
        };

        if (this.FILE_SERVER_URL && this.FILE_SERVER_URL !== null) {
            this._fs = new FsAPI(this.FILE_SERVER_URL, this._session);
        }

        if (this.APP_URL === null && this._session === null) {
            throw new Error('Не указан адрес приложения.');
        }
    }

    get fs () {
        if (this._fs !== null) {
            return this._fs;
        } else {
            throw new Error('API файлового сервера не инициализирован. Нужно указать URL');
        }
    }

    /**
     *
     * @param {string} type object type
     * @param {string} action action name
     * @param {object} reqoptions request params
     * @param {object} resoptions response params
     * @returns {Promise}
     */
    _fetch (type, action, reqoptions, resoptions) {
        return fetch(`${this.APP_URL}svbapi`, {
            method:  'POST',
            headers: {
                'Content-type': 'application/json'
            },
            body: JSON.stringify({
                session: this._session,
                type,
                action,
                reqoptions,
                resoptions
            })
        })
            .then(response => response.json());
    }

    /**
     *
     * @param {string} type object type
     * @param {string} action api action
     * @param {string} objectName catalog/document name
     * @param {string} uuid document uuid
     * @param {object} data document data object (key: value)
     * @param {object} tables document data tables (key is table name)
     * @param {Object} params request params
     * @param {Object} resParams response params
     * @returns {Promise}
     */
    _save (
        type,
        action,
        objectName,
        uuid = null,
        data = {},
        tables = {},
        params = {},
        resParams = {}
    ) {
        return this._fetch(
            type,
            action,
            {
                name:     objectName,
                datatype: 'instance',
                instance: uuid,
                lang:     params?.lang || this._defaultReqoptions.lang,
                data:     {
                    instance: data,
                    tables
                }
            },
            {
                metadata:   resParams?.metadata || this._defaultResoptions.metadata,
                view:       resParams?.view || this._defaultResoptions.view,
                data:       resParams?.data || this._defaultResoptions.data,
                dataparams: resParams?.dataparams || this._defaultResoptions.dataparams
            }
        );
    }

    /**
     *
     * @param {string} type object type
     * @param {string} objectName catalog/document name
     * @param {string} search search string
     * @param {Object} params request params
     * @param {Object} resParams response params
     * @returns {Promise}
     */
    list (type, objectName, search = '', params = {}, resParams = {}) {
        return this._fetch(
            type,
            'select',
            {
                name:             objectName,
                datatype:         'list',
                lang:             params?.lang || this._defaultReqoptions.lang,
                filters:          params?.filters || {},
                sort:             params?.sort || [],
                limit:            params?.limit || this._defaultReqoptions.limit,
                page:             params?.page || this._defaultReqoptions.page,
                search:           search || null,
                view:             params?.view || this._defaultReqoptions.view,
                selectedInstance: params?.selectedInstance || this._defaultReqoptions.selectedInstance
            },
            {
                metadata: resParams?.metadata || this._defaultResoptions.metadata,
                view:     resParams?.view || this._defaultResoptions.view,
                data:     resParams?.data || this._defaultResoptions.data,
                filters:  resParams?.filters || this._defaultResoptions.filters,
                sort:     resParams?.sort || this._defaultResoptions.sort,
                tree:     resParams?.tree || this._defaultResoptions.tree
            }
        )
            .then((response) => {
                const { status, message } = response;

                if (status === 200) {
                    const responseData = response?.result?.[type]?.[objectName];

                    if (responseData) {
                        return {
                            status,
                            message,
                            attrs:   responseData.attr,
                            rows:    SvbAPI.formatRowsData(responseData.list.columns, responseData.list.rows),
                            filters: responseData.list.filters,
                            sort:    responseData.list.sort,
                            limit:   responseData.list.limit,
                            page:    responseData.list.page,
                            total:   responseData.list.total
                        };
                    }
                }

                throw new Error(`Ошибка ответа от сервера: ${message}`);
            })
            .catch((error) => {
                console.error(error);
            });
    }

    /**
     *
     * @param {string} type object type
     * @param {string} objectName catalog/document name
     * @param {string} uuid document uuid
     * @param {Object} params request params
     * @param {Object} resParams response params
     * @returns {Promise}
     */
    instance (type, objectName, uuid, tables = {}, params = {}, resParams = {}) {
        const dataparams = resParams?.dataparams || this._defaultResoptions.dataparams;

        if (tables && Object.keys(tables).length > 0) {
            dataparams.tables = tables;
        }

        return this._fetch(
            type,
            'select',
            {
                name:     objectName,
                datatype: 'instance',
                instance: uuid,
                lang:     params?.lang || this._defaultReqoptions.lang,
                view:     params?.view || this._defaultReqoptions.view
            },
            {
                metadata: resParams?.metadata || this._defaultResoptions.metadata,
                view:     resParams?.view || this._defaultResoptions.view,
                data:     resParams?.data || this._defaultResoptions.data,
                filters:  resParams?.filters || this._defaultResoptions.filters,
                sort:     resParams?.sort || this._defaultResoptions.sort,
                dataparams
            }
        )
            .then((response) => {
                const { status, message } = response;

                if (status === 200) {
                    const responseData = response?.result?.[type]?.[objectName];

                    if (responseData) {
                        return {
                            status,
                            message,
                            attr:     responseData.attr,
                            vset:     responseData.vset,
                            instance: responseData.instance.attr,
                            tables:   SvbAPI.tablesFormatter(responseData.tables || {})
                        };
                    }
                }

                throw new Error(`Ошибка ответа от сервера: ${message}`);
            })
            .catch((error) => {
                console.error(error);

                return { status: 500 };
            });
    }

    /**
     *
     * @param {string} type object type
     * @param {string} objectName catalog/document name
     * @param {string} uuid document uuid
     * @param {object} data document data object (key: value)
     * @param {object} tables document data tables (key is table name)
     * @param {Object} params request params
     * @param {Object} resParams response params
     * @returns {Promise}
     */
    insert (
        type,
        objectName,
        uuid = null,
        data = {},
        tables = {},
        params = {},
        resParams = {}
    ) {
        return this._save(
            type,
            'insert',
            objectName,
            uuid,
            data,
            tables,
            params,
            resParams
        )
            .then((response) => {
                const { status, message } = response;

                if (status === 200) {
                    const responseData = response?.result;

                    if (responseData) {
                        return {
                            status,
                            message,
                            represent: responseData.represent,
                            uuid:      responseData.uuid
                        };
                    }
                }

                throw new Error(`Ошибка ответа от сервера: ${message}`);
            })
            .catch((error) => {
                console.error(error);

                return { status: 500 };
            });
    }

    /**
     *
     * @param {string} type object type
     * @param {string} objectName catalog/document name
     * @param {string} uuid document uuid
     * @param {object} data document data object (key: value)
     * @param {object} tables document data tables (key is table name)
     * @param {Object} params request params
     * @param {Object} resParams response params
     * @returns {Promise}
     */
    update (
        type,
        objectName,
        uuid = null,
        data = {},
        tables = {},
        params = {},
        resParams = {}
    ) {
        return this._save(
            type,
            'update',
            objectName,
            uuid,
            data,
            tables,
            params,
            resParams
        )
            .then((response) => {
                const { status, message } = response;

                if (status === 200) {
                    const responseData = response?.result;

                    if (responseData) {
                        return {
                            status,
                            message,
                            represent: responseData.represent,
                            uuid:      responseData.uuid
                        };
                    }
                }

                throw new Error(`Ошибка ответа от сервера: ${message}`);
            })
            .catch((error) => {
                console.error(error);

                return { status: 500 };
            });
    }

    /**
     *
     * @param {string} type object type
     * @param {string} objectName catalog/document name
     * @param {string} uuid object uuid
     * @returns {Promise}
     */
    delete (type, objectName, uuid, params = {}, resParams = {}) {
        return this._fetch(
            type,
            'delete',
            {
                name:     objectName,
                datatype: 'instance',
                instance: uuid,
                lang:     params?.lang || this._defaultReqoptions.lang
            },
            {
                metadata:   resParams?.metadata || this._defaultResoptions.metadata,
                view:       resParams?.view || this._defaultResoptions.view,
                data:       resParams?.data || this._defaultResoptions.data,
                dataparams: resParams?.dataparams || this._defaultResoptions.dataparams
            }
        )
            .then((response) => {
                const { status, message } = response;

                if (status === 200) {
                    return {
                        status,
                        message
                    };
                }

                throw new Error(`Ошибка ответа от сервера: ${message}`);
            })
            .catch((error) => {
                console.error(error);

                return { status: 500 };
            });
    }

    /**
     *
     * @returns {Promise}
     */
    checkSession () {
        return this._fetch('system', 'checksession', {}, {})
            .then((response) => {
                const { valid, msg } = response;

                if (valid) {
                    return response;
                }

                throw new Error(`Ошибка ответа от сервера: ${msg}`);
            })
            .catch((error) => {
                console.error(error);

                return { status: 401 };
            });
    }

    /**
     *
     * @param {Object} tables response tables object
     * @returns {Object}
     */
    static tablesFormatter (tables) {
        return Object.keys(tables).reduce((formattedTables, key) => {
            formattedTables[key] = {
                md:   tables[key].md,
                view: tables[key].view,
                attr: tables[key].attr,
                vset: tables[key].vset,
                list: {
                    owner:   tables[key].list.owner,
                    limit:   tables[key].list.limit,
                    page:    tables[key].list.page,
                    total:   tables[key].list.total,
                    filters: tables[key].list.filters,
                    sort:    tables[key].list.sort,
                    rows:    SvbAPI.formatRowsData(tables[key].list.columns, tables[key].list.rows)
                }
            };

            return formattedTables;
        }, {});
    }

    /**
     *
     * @param {string[]} columns columns keys
     * @param {object[]} rows rows data
     * @returns
     */
    static formatRowsData (columns = [], rows = []) {
        return rows.map((row) => {
            return columns.reduce((acc, key, index) => {
                acc[key] = row[index];

                return acc;
            }, {});
        });
    }
}
