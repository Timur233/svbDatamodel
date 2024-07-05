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

export { emit, getElem, getObjectType, parseDescriptor, compareDescriptors };
