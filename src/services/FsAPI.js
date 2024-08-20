export class FsAPI {
    constructor (appURL, session) {
        this.APP_URL = appURL || null;
        this._session = session || null;

        if (this.APP_URL === null && this._session === null) {
            throw new Error('Не указан адрес приложения.');
        }
    }

    /**
     *
     * @param {File} file
     * @returns {Promise}
     */
    upload (file) {
        const formData = new FormData();

        formData.append('file', file);

        return fetch(`${this.APP_URL}upload`, {
            method: 'POST',
            body:   formData
        })
            .then(res => res.json())
            .then(res => ({
                name:  res.name,
                url:   res.url,
                value: res.url
            }))
            .catch((error) => {
                console.error(error);

                return { status: 500 };
            }); ;
    }

    /**
     *
     * @param {string[]} uuidList
     * @returns {Promise|undefined}
     */
    save (uuidList) {
        if (uuidList.length > 0) {
            return fetch(`${this.APP_URL}download`, {
                method: 'POST',
                body:   JSON.stringify({ files: uuidList })
            })
                .then(res => res.json())
                .catch((error) => {
                    console.error(error);

                    return { status: 500 };
                });
        }
    }

    /**
     *
     * @param {string} uuid
     * @returns {Promise|undefined}
     */
    preview (uuid) {
        if (uuid && uuid !== '') {
            return fetch(`${this.APP_URL}download`, {
                method: 'POST',
                body:   JSON.stringify({ url: uuid })
            })
                .then(response => response.blob())
                .then((blob) => {
                    const reader = new FileReader();

                    return new Promise((resolve, reject) => {
                        reader.onloadend = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    });
                })
                .catch((error) => {
                    console.error(error);

                    return { status: 500 };
                });
        }
    }

    remove () {}
}
