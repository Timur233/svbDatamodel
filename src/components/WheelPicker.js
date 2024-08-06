import SvbElement from './SvbElement';

class WheelPicker extends SvbElement {
    constructor (wheels, heightItem = 34) {
        super();

        this.wheels = wheels;
        this.heightItem = heightItem;

        if (Array.isArray(this.wheels) && this.wheels.length > 0) {
            this.init();
        }
    }

    init () {
        this.component = SvbElement.create('div', null, 'wheel-picker');
        this.highlight = SvbElement.create('div', null, 'wheel-picker__highlight');

        this.component.appendChild(this.highlight);
        this.render();
    }

    addMeta (wheelData) {
        wheelData.itemCount = wheelData.elements.length;
        wheelData.startY = null;
        wheelData.initialTranslateY = 0;
        wheelData.currentTranslateY = 0;
        wheelData.selectedIndex = 0;

        if (wheelData.value) {
            const selectedIndex = wheelData.elements.findIndex(i => i === wheelData.value);
            const selectedElement = wheelData.wrapper.children[selectedIndex + 1];

            wheelData.startY = selectedIndex * -34;
            wheelData.initialTranslateY = selectedIndex * -34;
            wheelData.currentTranslateY = selectedIndex * -34;
            wheelData.selectedIndex = selectedIndex;

            wheelData.wrapper.addStyles({ transform: `translateY(${selectedIndex * -34}px)` });
            wheelData.wrapper.querySelector('.picker-item--active').classList.remove('picker-item--active');
            selectedElement.classList.add('picker-item--active');
        }
    }

    addEvents (wheelData) {
        wheelData.wrapper.addEventListener('touchstart', (e) => {
            e.stopPropagation();
            e.preventDefault();

            wheelData.startY = e.touches[0].clientY;
            wheelData.initialTranslateY = wheelData.currentTranslateY;
            wheelData.wrapper.style.transition = 'none';
        });

        wheelData.wrapper.addEventListener('touchmove', (e) => {
            e.stopPropagation();
            e.preventDefault();

            const touchY = e.touches[0].clientY;
            const diff = touchY - wheelData.startY;

            wheelData.currentTranslateY = wheelData.initialTranslateY + diff;
            wheelData.wrapper.style.transform = `translateY(${wheelData.currentTranslateY}px)`;

            const itemOffset = Math.round(wheelData.currentTranslateY / this.heightItem);
            const clampedOffset = Math.max(Math.min(itemOffset, 0), -wheelData.itemCount + 1);

            wheelData.selectedIndex = -clampedOffset;

            const selected = wheelData.wrapper.children[wheelData.selectedIndex + 1];

            wheelData.wrapper.querySelector('.picker-item--active').classList.remove('picker-item--active');
            wheelData.value = selected.textContent;
            selected.classList.add('picker-item--active');

            const eventChange = new Event('svb:change', {
                bubbles:    true,
                cancelable: true,
                event:      {
                    wheelName: wheelData.name,
                    value:     wheelData.value
                }
            });

            this.component.dispatchEvent(eventChange);
        });

        wheelData.wrapper.addEventListener('touchend', (e) => {
            e.stopPropagation();
            e.preventDefault();

            const itemOffset = Math.round(wheelData.currentTranslateY / this.heightItem);
            const clampedOffset = Math.max(Math.min(itemOffset, 0), -wheelData.itemCount + 1);

            wheelData.currentTranslateY = clampedOffset * this.heightItem;
            wheelData.wrapper.style.transition = 'transform 0.3s ease';
            wheelData.wrapper.style.transform = `translateY(${wheelData.currentTranslateY}px)`;
            wheelData.selectedIndex = -clampedOffset + 1;
        });
    }

    show () {
        this.component.classList.add('wheel-picker--show');
    }

    hide () {
        this.component.classList.remove('wheel-picker--show');
    }

    renderWheels () {
        this.wheels.forEach((wheelData) => {
            const { name, elements } = wheelData;
            const wrapper = SvbElement.create('div', name || null, 'wheel-picker__wheel picker-wrapper');

            wrapper.appendChild(SvbElement.create('div', null, 'picker-wrapper__item picker-item'));
            elements.forEach((element, index) => {
                const item = SvbElement.create('div', null,
                    `picker-wrapper__item picker-item ${index === 0 ? 'picker-item--active' : ''}`,
                    `<span>${element}</span>`);

                wrapper.appendChild(item);
            });
            wrapper.appendChild(SvbElement.create('div', null, 'picker-wrapper__item picker-item'));
            wrapper.appendChild(SvbElement.create('div', null, 'picker-wrapper__item picker-item'));

            wheelData.wrapper = wrapper;
            this.component.appendChild(wrapper);

            this.addMeta(wheelData);
            this.addEvents(wheelData);
        });
    }

    render () {
        this.renderWheels();
    }
}

export default WheelPicker;
