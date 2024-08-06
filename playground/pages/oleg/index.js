/**
 *
 * @param {Object} position
 * @param {Number} position.top
 * @param {Number} position.right
 * @param {Number} position.bottom
 * @param {Number} position.left
 * @param {String} title
 * @param {HTMLElement | string} content
 * @param {String} side Откуда будет появлятся кнопка (left|top|right|bottom)
 */
function flyAlert (position, title, content, side = 'right') {
    const component = document.createElement('div');
    const titleBlock = document.createElement('div');
    const body = document.createElement('div');
    const svbWorkspace = document.querySelector('.svbWorkspace');

    component.classList = `fly-alert fly-alert--side-${side}`;

    if (typeof position === 'object') {
        component.style.left = position?.left ? `${position.left}px` : '';
        component.style.top = position?.top ? `${position.top}px` : '';
        component.style.right = position?.right ? `${position.right}px` : '';
        component.style.bottom = position?.bottom ? `${position.bottom}px` : '';
    }

    titleBlock.classList = 'fly-alert__title';

    if (title) {
        titleBlock.classList.add('fly-alert__title--show');
        titleBlock.innerHTML = `
            <span class="fly-alert-title">${title}</span> 
        `;
    }

    body.classList = 'fly-alert__body';

    if (content) {
        if (content instanceof HTMLElement) {
            body.appendChild(content);

            return;
        }

        if (typeof content === 'string') {
            const bodyWrapper = document.createElement('div');

            bodyWrapper.classList = 'fly-alert__body-wrapper';
            bodyWrapper.innerHTML = content;

            body.appendChild(bodyWrapper);
        }
    }

    component.appendChild(titleBlock);
    component.appendChild(body);

    component.titleBlock = titleBlock;
    component.bodyBlock = body;

    component.methods = {
        show: () => {
            component.classList.add('fly-alert--show');
        },
        hide: () => {
            component.classList.remove('fly-alert--show');
        }
    };

    if (svbWorkspace) {
        svbWorkspace.appendChild(component);
    } else {
        document.body.appendChild(component);
    }

    return component;
}

document.addEventListener('DOMContentLoaded', () => {
    const alert = flyAlert({ right: 20, top: 20 }, 'Уведомление', `
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
            <thead>
                <tr>
                    <th style="border: 1px solid #ddd; padding: 8px; 
                    background-color: #f2f2f2; text-align: left;">ID</th>
                    <th style="border: 1px solid #ddd; padding: 8px; 
                    background-color: #f2f2f2; text-align: left;">Имя</th>
                    <th style="border: 1px solid #ddd; padding: 8px; 
                    background-color: #f2f2f2; text-align: left;">Фамилия</th>
                    <th style="border: 1px solid #ddd; padding: 8px; 
                    background-color: #f2f2f2; text-align: left;">Email</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">1</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">Иван</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">Иванов</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">ivan@example.com</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">2</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">Мария</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">Петрова</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">maria@example.com</td>
                </tr>
                <tr>
                    <td style="border: 1px solid #ddd; padding: 8px;">3</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">Петр</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">Сидоров</td>
                    <td style="border: 1px solid #ddd; padding: 8px;">petr@example.com</td>
                </tr>
            </tbody>    
        </table>
    `, 'right');
    const toggleBtn = document.createElement('button');

    toggleBtn.addEventListener('click', () => {
        if (toggleBtn.classList.contains('open')) {
            alert.methods.show();
        } else {
            alert.methods.hide();
        }

        toggleBtn.classList.toggle('open');
    });
    toggleBtn.textContent = 'toggle';
    document.body.appendChild(toggleBtn);

    alert.methods.show();
});
