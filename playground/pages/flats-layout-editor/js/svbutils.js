

class SVBUtils {
    static logging = false;
    
    static log(logText) {
        if (!this.logging) return;
        console.log(logText);
    };
    
    static getCookie(name) {
        var matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }

    static setCookie(name, value, days) {
        var expires = "";
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        }
        document.cookie = name + "=" + (value || "") + expires + "; path=/";
    }

    static deleteAllCookies() {
        var cookies = document.cookie.split(";");

        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            var eqPos = cookie.indexOf("=");
            var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
            document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
        }
    }
}


// #############################################################################
// Timur utils.js
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