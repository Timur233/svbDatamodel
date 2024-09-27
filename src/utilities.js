/**
 * @param  {String} type
 * @param  {*}      detail
 * @param  {Node}   elem
 */
function emit (type, detail, element = document) {
    const event = new CustomEvent(`model:${type}`, {
        bubbles:    true,
        cancelable: true,
        detail
    });

    return element.dispatchEvent(event);
}

/**
 * @param  {String|Node} element
 * @return {Node}
 */
function getElem (element) {
    return typeof element === 'string' ? document.querySelector(element) : element;
}

/**
 * @param  {*}      object
 * @return {String}
 */
function getObjectType (object) {
    /** Тип данных по прототипу */
    return Object.prototype.toString.call(object)
        .slice(8, -1).toLowerCase();
}

/**
 * @param {String}
 * @return {Array}
 */
function parseDescriptor (descriptorString) {
    const descriptor = descriptorString.split('.');

    return descriptor;
}

function compareDescriptors (eventDescriptor, listenerDescriptor) {
    if (listenerDescriptor.length > eventDescriptor.length) {
        return false;
    }

    for (let i = 0; i <= eventDescriptor.length - listenerDescriptor.length; i++) {
        let j;

        for (j = 0; j < listenerDescriptor.length; j++) {
            if (eventDescriptor[i + j] !== listenerDescriptor[j]) {
                break;
            }
        }

        if (j === listenerDescriptor.length) {
            return true;
        }
    }

    return false;
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

export { emit, getElem, getObjectType, parseDescriptor, compareDescriptors, base64ToFile, getInstanceUuid, getCookie, checkSession };
