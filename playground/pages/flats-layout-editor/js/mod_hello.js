function hello (e) {
    document.addEventListener('click', docOnClick);
}

function docOnClick (e) {
    e = e || window.event;
    let showUserMenu = false;
    let node = (e.target || e.srcElement);

    while (node.parentNode) {
        if (node.id === 'helloButton' || node.id === 'helloMenu') {
            showUserMenu = true;
            break;
        }

        node = node.parentNode;
    }
    const helloMenu = document.getElementById('helloMenu');

    if (helloMenu) {
        if (showUserMenu) {
            helloMenu.style.zIndex = getDocumentMaxZIndex();
            helloMenu.classList.remove('hidden');
        } else {
            helloMenu.classList.add('hidden');
        }
    }
}

function getDocumentMaxZIndex () {
    let maxZIndex = 0;
    const elements = document.getElementsByTagName('*');

    for (let i = 0; i < elements.length; i++) {
        const computedStyle = getComputedStyle(elements[i], null);

        if ('zIndex' in computedStyle) {
            var zIndex = parseInt(computedStyle.getPropertyValue('zIndex'));

            if (isNaN(zIndex)) zIndex = 0;

            maxZIndex = Math.max(maxZIndex, zIndex);
        }

        if ('z-index' in computedStyle) {
            var zIndex = parseInt(computedStyle.getPropertyValue('z-index'));

            if (isNaN(zIndex)) zIndex = 0;

            maxZIndex = Math.max(maxZIndex, zIndex);
        }
    }

    return maxZIndex;
}
