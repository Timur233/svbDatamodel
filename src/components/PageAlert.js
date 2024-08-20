import SvbElement from './SvbElement';

class PageAlert extends SvbElement {
    /**
     *
     * @param {String} icon
     * @param {String} title
     * @param {String} desc
     * @param {Array} buttons
     */
    constructor () {
        super();
        this.state = { buttons: [] };

        this.init();
    }

    init () {
        this.component = SvbElement.create('div', null, 'page-alert');
        this.wrapper = SvbElement.create('div', null, 'page-alert__wrapper');
        this.icon = SvbElement.create('div', null, 'page-alert__icon');
        this.title = SvbElement.create('div', null, 'page-alert__title');
        this.desc = SvbElement.create('div', null, 'page-alert__desc');
        this.buttons = SvbElement.create('div', null, 'page-alert__buttons');

        this.render();
        this.publicMethods();
    }

    publicMethods () {
        this.component.showLoader = this.showLoader.bind(this);
        this.component.showMessage = this.showMessage.bind(this);
        this.component.showError = this.showError.bind(this);
        this.component.open = this.showComponent.bind(this);
        this.component.close = this.hideComponent.bind(this);
    }

    showLoader (title, desc, buttons = []) {
        this.icon.innerHTML = `
            <span class="page-alert__loader"></span>
        `;

        this.title.textContent = title;
        this.desc.textContent = desc;
        this.state.buttons = buttons;

        this.renderButtons();
        this.render();
        this.showComponent();
    }

    showMessage (icon, title, desc, buttons) {
        if (icon) {
            this.icon.innerHTML = icon;
        } else {
            this.icon.innerHTML = `
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M79.1282 79.167H79.1678ZM79.1282 79.167C76.5336 81.7399 71.8316 81.099 68.5341 
                    81.099C64.4866 81.099 62.5374 81.8907 59.6486 84.7795C57.1891 87.2395 53.8916 91.667 
                    50.0011 91.667C46.1107 91.667 42.8132 87.2395 40.3535 84.7795C37.4648 81.8907 35.5157 
                    81.099 31.4681 81.099C28.1706 81.099 23.4686 81.7399 20.874 79.167C18.2587 76.5736 
                    18.9023 71.852 18.9023 68.5332C18.9023 64.3395 17.9851 62.4111 14.9986 59.4245C10.5559 
                    54.982 8.33456 52.7603 8.33447 50.0003C8.33451 47.2399 10.5558 45.0186 14.9984 
                    40.576C17.6645 37.91 18.9023 35.2681 18.9023 31.4672C18.9023 28.1697 18.2615 23.4675 
                    20.8345 20.873C23.4279 18.2577 28.1495 18.9014 31.4681 18.9014C35.2689 18.9014 37.9108 
                    17.6636 40.5768 14.9977C45.0195 10.555 47.2407 8.33362 50.0011 8.33362C52.7616 8.33362 
                    54.9828 10.555 59.4253 14.9977C62.0907 17.6631 64.7324 18.9014 68.5341 18.9014C71.8316 
                    18.9014 76.5341 18.2606 79.1286 20.8336C81.7436 23.4271 81.0999 28.1486 81.0999 31.4672C81.0999 
                    35.661 82.0174 37.5893 85.0036 40.576C89.4466 45.0186 91.6678 47.2399 91.6678 50.0003C91.6678 
                    52.7603 89.4466 54.982 85.0036 59.4245C82.017 62.4111 81.0999 64.3395 81.0999 68.5332C81.0999 
                    71.852 81.7436 76.5736 79.1282 79.167Z" fill="url(#paint0_linear_2246_112511)"/>
                    <path d="M79.1282 79.167H79.1678M79.1282 79.167C76.5336 81.7399 71.8316 81.099 68.5341 
                    81.099C64.4866 
                    81.099 62.5374 81.8907 59.6486 84.7795C57.1891 87.2395 53.8916 91.667 50.0011 91.667C46.1107 91.667 
                    42.8132 87.2395 40.3535 84.7795C37.4648 81.8907 35.5157 81.099 31.4681 81.099C28.1706 
                    81.099 23.4686 
                    81.7399 20.874 79.167C18.2587 76.5736 18.9023 71.852 18.9023 68.5332C18.9023 64.3395 
                    17.9851 62.4111 
                    14.9986 59.4245C10.5559 54.982 8.33456 52.7603 8.33447 50.0003C8.33451 47.2399 10.5558 
                    45.0186 14.9984 
                    40.576C17.6645 37.91 18.9023 35.2681 18.9023 31.4672C18.9023 28.1697 18.2615 23.4675 
                    20.8345 20.873C23.4279 
                    18.2577 28.1495 18.9014 31.4681 18.9014C35.2689 18.9014 37.9108 17.6636 40.5768 
                    14.9977C45.0195 10.555 
                    47.2407 8.33362 50.0011 8.33362C52.7616 8.33362 54.9828 10.555 59.4253 14.9977C62.0907 
                    17.6631 64.7324 
                    18.9014 68.5341 18.9014C71.8316 18.9014 76.5341 18.2606 79.1286 20.8336C81.7436 23.4271 
                    81.0999 28.1486 
                    81.0999 31.4672C81.0999 35.661 82.0174 37.5893 85.0036 40.576C89.4466 45.0186 
                    91.6678 47.2399 91.6678 
                    50.0003C91.6678 52.7603 89.4466 54.982 85.0036 59.4245C82.017 62.4111 81.0999 64.3395 
                    81.0999 68.5332C81.0999 
                    71.852 81.7436 76.5736 79.1282 79.167Z" stroke="url(#paint1_linear_2246_112511)" 
                    stroke-width="9.375"/>
                    <path d="M37.5 53.7207C37.5 53.7207 42.5 56.4365 45 60.417C45 60.417 52.5 44.792 62.5 39.5836" 
                    stroke="white" stroke-width="7.40741" stroke-linecap="round" stroke-linejoin="round"/>
                    <defs>
                    <linearGradient id="paint0_linear_2246_112511" x1="75.0335" y1="83.8935" x2="16.1073" 
                    y2="24.9684" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#0078BF"/>
                        <stop offset="1" stop-color="#00A0E3"/>
                    </linearGradient>
                    <linearGradient id="paint1_linear_2246_112511" x1="75.0335" y1="83.8935" x2="16.1073" 
                    y2="24.9684" gradientUnits="userSpaceOnUse">
                        <stop stop-color="#0078BF"/>
                        <stop offset="1" stop-color="#00A0E3"/>
                    </linearGradient>
                    </defs>
                </svg>        
            `;
        }

        this.title.textContent = title;
        this.desc.textContent = desc;
        this.state.buttons = buttons;

        this.renderButtons();
        this.render();
        this.showComponent();
    }

    showError (icon, title, desc, buttons) {
        if (icon) {
            this.icon.innerHTML = icon;
        } else {
            this.icon.innerHTML = `
                <svg width="100" height="100" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M70.8333 62.5V70.8333V62.5ZM70.8708 79.1667H70.8333H70.8708ZM91.6667 70.8333C91.6667 
                    82.3392 82.3392 91.6667 70.8333 91.6667C59.3275 91.6667 50 82.3392 50 70.8333C50 59.3275 59.3275 
                    50 70.8333 50C82.3392 50 91.6667 59.3275 91.6667 70.8333Z" fill="#FF4443"/>
                    <path d="M70.8333 62.5V70.8333M70.8708 79.1667H70.8333M91.6667 70.8333C91.6667 82.3392 82.3392 
                    91.6667 70.8333 91.6667C59.3275 91.6667 50 82.3392 50 70.8333C50 59.3275 59.3275 50 70.8333 
                    50C82.3392 50 91.6667 59.3275 91.6667 70.8333Z" stroke="white" stroke-width="6" 
                    stroke-linecap="round"/>
                    <path d="M59.9322 39.3234C57.3284 36.8998 53.8368 35.4172 49.9989 35.4172C41.9447 35.4172 
                    35.4155 41.9464 35.4155 50.0006C35.4155 53.8385 36.8981 57.3302 39.3217 59.9339" 
                    stroke="#FF4443" stroke-width="6" stroke-linecap="round"/>
                    <path d="M40.7511 85.1494C38.8946 83.2928 38.2863 82.7353 37.1084 82.2448C35.924 81.7511 
                    34.6916 81.7332 32.0499 81.7332C25.767 81.7332 22.1713 81.7332 20.2194 79.7811C18.2676 77.8294 
                    18.2676 74.2336 18.2676 67.9507C18.2676 65.3232 18.2503 64.0898 17.7636 62.9107C17.275 61.7273 
                    16.4163 60.8419 14.5497 58.9749C12.1994 56.6244 8.33447 53.6907 8.33447 49.9994C8.33447 46.3078 
                    12.1993 43.374 14.5497 41.0238C16.4076 39.1659 17.2669 38.2827 17.7568 37.1042C18.2491 35.9202 
                    18.2676 34.688 18.2676 32.0482C18.2676 25.7653 18.2676 22.1696 20.2194 20.2177C22.1713 18.2658 
                    25.767 18.2658 32.0499 18.2658C34.6716 18.2658 35.9037 18.2494 37.0815 17.7652C38.2701 17.2766 
                    39.1548 16.4188 41.0255 14.548C43.3757 12.1976 46.7111 8.33276 50.0011 8.33276C53.2911 8.33276 
                    56.6261 12.1977 58.9766 14.5481C60.8466 16.4176 61.7324 17.276 62.9182 17.7642C64.0957 18.2491 
                    65.3291 18.2658 67.9524 18.2658C74.2353 18.2658 77.8311 18.2658 79.7828 20.2177C81.7349 22.1696 
                    81.7349 25.7653 81.7349 32.0482C81.7349 34.6821 81.752 35.9144 82.242 37.0961C82.7324 38.2784 
                    83.2891 38.8373 85.1511 40.6994" stroke="#FF4443" stroke-width="6" stroke-linecap="round"/>
                </svg>        
            `;
        }

        this.title.textContent = title;
        this.desc.textContent = desc;
        this.state.buttons = buttons;

        this.renderButtons();
        this.render();
        this.showComponent();
    }

    showComponent () {
        const wrapper = document.querySelector('#content-block');

        if (wrapper) {
            wrapper.appendChild(this.component);

            return;
        }

        document.body.appendChild(this.component);
    }

    hideComponent () {
        this.component.remove();
    }

    renderButtons () {
        this.state.buttons.forEach((b) => {
            const button = SvbElement
                .create('button', null, `btn ${b?.classList ? b.classList : 'btn--gray'}`, b.title);

            button.addEventListener('click', b.callback.bind(this.component));
            this.buttons.appendChild(button);
        });
    }

    render () {
        this.clearComponent(this.component);
        this.clearComponent(this.wrapper);

        this.wrapper.appendChild(this.icon);
        this.wrapper.appendChild(this.title);
        this.wrapper.appendChild(this.desc);

        this.component.appendChild(this.wrapper);

        if (this.state.buttons.length > 0) {
            this.component.appendChild(this.buttons);
        }
    }
}

export default PageAlert;
