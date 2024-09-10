/* global fetch, init */

const APP_URL = 'https://stage.exin.kz/crm';
const APP_PREFIX = 'QSCRM';
const API_URL = APP_URL + '/api';
const SVBAPI_URL = APP_URL + '/svbapi';

function main () {
    // on document ready set greeting module events

}

// Show loader
function showLoader () {
    if (document.getElementById('loader')) {
        const loader = document.getElementById('loader');

        loader.style.display = 'block';
    }
}
// Hide loader
function hideLoader () {
    if (document.getElementById('loader')) {
        const loader = document.getElementById('loader');

        loader.style.display = 'none';
    }
}

// utils
function getCookie (name) {
    const matches = document.cookie.match(new RegExp('(?:^|; )' + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, '\\$1') + '=([^;]*)'));

    return matches ? decodeURIComponent(matches[1]) : undefined;
}

function setCookie (name, value, days) {
    let expires = '';

    if (days) {
        const date = new Date();

        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = '; expires=' + date.toUTCString();
    }

    document.cookie = name + '=' + (value || '') + expires + '; path=/';
}

function removeParam (key, sourceURL) {
    const splitUrl = sourceURL.split('?');
    let rtn = splitUrl[0];
    let param;
    let params_arr = [];
    const queryString = (sourceURL.indexOf('?') !== -1) ? splitUrl[1] : '';

    if (queryString !== '') {
        params_arr = queryString.split('&');
        for (let i = params_arr.length - 1; i >= 0; i -= 1) {
            param = params_arr[i].split('=')[0];

            if (param === key) {
                params_arr.splice(i, 1);
            }
        }
        rtn = rtn + '?' + params_arr.join('&');
    }

    return rtn;
}

async function crEl (tagName, id, classList, inHtml) {
    const elem = document.createElement(tagName);

    if (id) elem.id = id;

    let pnt = '';
    let classStr = '';

    if (classList) {
        for (let i = 0; i < classList.length; i++) {
            classStr += pnt + classList[i];
            pnt = ' ';
        }
        elem.className = classStr;
    }

    if (inHtml) elem.innerHTML = inHtml;

    elem.toggleClass = function (defaultClass, alternativeClass) {
        if (this.classList.contains(defaultClass)) {
            this.classList.remove(defaultClass);
            this.classList.add(alternativeClass);
        } else {
            this.classList.remove(alternativeClass);
            this.classList.add(defaultClass);
        }
    };
    elem.setStyle = function (styleData) {
        clearStyles();
        addStyles(styleData);
    };
    elem.addStyles = function (styleData) {
        for (const cssName in styleData) {
            const cssValue = styleData[cssName];

            this.style[cssName] = cssValue;
        }
    };
    elem.clearStyles = function () {
        this.removeAttribute('style');
        // this.style.cssText = null;
    };
    elem.removeStyle = function (styleName) {
        this.style[styleName] = null;
    };

    return elem;
}

async function crTable (viewData) {
    const table = document.createElement('table');

    if (viewData.id) table.id = viewData.id;

    if (viewData.class) table.className = viewData.class;

    const tbody = await crEl('tbody');

    if (!viewData.head || viewData.head.length < 1) {
        table.append(tbody);
    } else {
        const thead = await crEl('thead');
        const tfoot = await crEl('tfoot');

        const trHead = await crEl('tr');
        const trFoot = await crEl('tr');
        let columnCount = 0;

        for (const rowDataKey in viewData.head.data) {
            const rowData = viewData.head.data[rowDataKey];

            columnCount++;

            const thHead = await crEl('th');

            thHead.dataset.name = rowDataKey;

            if (rowData.id) thHead.id = rowData.id;

            if (rowData.className) thHead.className = rowData.className;

            if (rowData.text) thHead.innerHTML = rowData.text;

            if (rowData.width) thHead.style.width = rowData.width;

            trHead.appendChild(thHead);

            const thFoot = await crEl('th');

            thFoot.dataset.name = rowDataKey;
            trFoot.appendChild(thFoot);
        }
        table.columnCount = columnCount;

        thead.appendChild(trHead);
        tfoot.appendChild(trFoot);

        table.append(thead);
        table.append(tbody);
        table.append(tfoot);
    }

    table.removeAllRows = () => {
        tbody.innerHTML = '';
    };
    table.addRow = (rowData) => {
        const tr = document.createElement('tr');

        if (rowData) {
            if (rowData.id) tr.id = rowData.id;

            if (rowData.className) tr.className = rowData.className;
        }

        tr.addEventListener('click', (e) => {
            tr.setSelected();
        });
        tr.setSelected = () => {
            const rows = table.tBodies[0].getElementsByTagName('tr');

            for (const row of rows) {
                row.classList.remove('selected');
            }
            tr.classList.add('selected');
        };
        tr.addHeadColumns = (columnData) => {
            buildColumns('th', columnData);
        };
        tr.addColumns = (columnData) => {
            buildColumns('td', columnData);
        };
        function buildColumns (colTag, columnData) {
            for (let i = 0; i < columnData.length; i++) {
                const col = document.createElement(colTag);

                if (columnData[i].innerHTML) col.innerHTML = columnData[i].innerHTML;

                if (columnData[i].appendChild) col.appendChild(columnData[i].appendChild);

                if (columnData[i].id) col.id = columnData[i].id;

                if (columnData[i].class) col.classList.add(columnData[i].class);

                tr.appendChild(col);
            }
        }
        tbody.appendChild(tr);

        return tr;
    };

    return table;
}

async function postRequest (requestData) {
    const cookieSession = getCookie(APP_PREFIX + '_session');

    requestData.session = cookieSession;

    let result;

    await fetch(API_URL, {
        method:  'post',
        body:    JSON.stringify(requestData),
        headers: { 'Content-Type': 'application/json' }
    })
        .then(res => res.json())
        .then((json) => {
            result = json;
            result.error = false;
            result.msg = '';
        })
        .catch((err) => {
            result = { error: true, msg: err };
        });

    return result;
}

async function getPagination (paginationClass, total, limit, currentPage, onPageButtonClick) {
    const paginationHtml = await crEl('div');
    const buttonCount = (total - total % limit) / limit + (total % limit > 0 ? 1 : 0);

    for (let i = 0; i < buttonCount; i++) {
        const pageNum = i + 1;
        const pageButton = await crEl('button', '', [paginationClass], pageNum);

        if (pageNum === currentPage) pageButton.classList.add('selected');

        pageButton.dataset.page = pageNum;
        pageButton.addEventListener('click', async (e) => {
            await onPageButtonClick(e.target.dataset.page);
            //            let buttons = document.getElementsByClassName(paginationClass);
            //            for (var i = 0; i < buttons.length; i++) {
            //                buttons[i].classList.remove("selected");
            //            }
            //            e.target.classList.add("selected");
        });
        paginationHtml.appendChild(pageButton);
    }

    return paginationHtml;
}

//
