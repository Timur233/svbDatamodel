import SvbElement from './SvbElement';

class FileUploader extends SvbElement {
    constructor (title, options, viewSetting) {
        super();

        this.state = {
            files:          [],
            maxFilesLenght: 20,
            maxFileSize:    20,
            componentTitle: title || null,
            isMultiple:     options?.multiple || false,
            formatsAccept:  `.jpg, .jpeg, .png, .gif, .pdf, .xls, .xlsx, .doc, .docx, .ppt, 
                .pptx, image/*, application/pdf, application/msword, 
                application/vnd.openxmlformats-officedocument.wordprocessingml.document, 
                application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, 
                application/vnd.ms-powerpoint, 
                application/vnd.openxmlformats-officedocument.presentationml.presentation`,
            settings: {
                readOnly: false
            }
        };

        this.init();

        if (viewSetting) this.setSvbOptions(viewSetting);

        return this.render();
    }

    init () {
        this.component = SvbElement.create('div', null, 'svbUploader', null);
        this.input = SvbElement.create('input', null, 'svbUploader__input', null);
        this.fileList = SvbElement.create('div', null, 'svbUploader__list uploaderList', null);
        this.componentTitle = SvbElement.create('span', null, 'uploaderList__title', this.state.componentTitle);
        this.fileListLabel = SvbElement.create('div', null, 'uploaderList__buttons');
        this.uploadButton = SvbElement.create('button', null, 'btn btn--outline btn--size-m', `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18.1766 12L19.7208 10.4558C21.4264 8.75022 21.4264 5.98485 19.7208 
                4.27922C18.0151 2.57359 15.2498 2.57359 13.5442 4.27922L4.2792 13.5442C2.5736 
                15.2498 2.5736 18.0152 4.2792 19.7208C5.9848 21.4264 8.7502 21.4264 10.4558 
                19.7208L13.9302 16.2464C14.9962 15.1804 14.9962 13.4521 13.9302 12.386C12.8642 
                11.32 11.1358 11.32 10.0698 12.386L8.1396 14.3162" stroke="#00a0e3" 
                stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>                
            Прикрепить
        `);
        this.photoButton = SvbElement.create('button', null, 'btn btn--primary btn--size-m', `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M17 6C19.3456 6 20.0184 6 20.8263 6.61994C21.0343 6.77954 21.2205 6.96572 21.3801 
                7.17372C22 7.98164 22 9.15442 22 11.5V16C22 18.8284 22 20.2426 21.1213 21.1213C20.2426 22 
                18.8284 22 16 22H8C5.17157 22 3.75736 22 2.87868 21.1213C2 20.2426 2 18.8284 2 16V11.5C2 
                9.15442 2 7.98164 2.61994 7.17372C2.77954 6.96572 2.96572 6.77954 3.17372 6.61994C3.98164 
                6 4.65442 6 7 6" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/>
                <path d="M17 7L16.1142 4.78543C15.732 3.82996 15.3994 2.7461 14.4166 2.25955C13.8924 
                2 13.2616 2 12 2C10.7384 2 10.1076 2 9.58335 2.25955C8.6006 2.7461 8.26801 3.82996 
                7.88583 4.78543L7 7" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M15.5 14C15.5 15.933 13.933 17.5 12 17.5C10.067 17.5 8.5 15.933 8.5 14C8.5 12.067 
                10.067 10.5 12 10.5C13.933 10.5 15.5 12.067 15.5 14Z" stroke="#fff" stroke-width="1.5"/>
                <path d="M12 6H12.009" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>  
            Сделать фото
        `);
        this.fileListGrid = SvbElement.create('div', null, 'uploaderList__grid', null);
        this.errorMessage = SvbElement.create('span', null, 'uploaderList__err-msg', null);

        this.fileListLabel.appendChild(this.uploadButton);
        this.fileListLabel.appendChild(this.photoButton);

        this.input.accept = this.state.formatsAccept;
        this.input.type = 'file';
        this.input.addEventListener('change', () => {
            this.loadFile(this.input.files[0]);
        });

        this.eventChange = val => new Promise(resolve => resolve(val));
        this.loadMethod = val => new Promise(resolve => resolve(val));
        this.tumbMethod = val => new Promise(resolve => resolve(val));
        this.downloadMethod = val => new Promise(resolve => resolve(val));
        this.previewMethod = val => new Promise(resolve => resolve(val));
        this.removeMethod = val => new Promise(resolve => resolve(val));

        this.defaultEvents();
        this.publicMethods();
    }

    defaultEvents () {
        this.event('click', this.uploadButton, () => {
            if (this.component.classList.contains('svbUploader--hide-controll')) return;

            if (this.state.settings.readOnly === false) { this.input.click(); }
        });

        this.event('click', this.photoButton, () => {
            if (this.component.classList.contains('svbUploader--hide-controll')) return;

            if (this.state.settings.readOnly === false) {
                // this.input.setAttribute('capture', 'camera');
                // this.input.click();
                // this.input.removeAttribute('capture');
                this.cameraButtonClick();
            }
        });

        this.event('change', this.input, () => {
            const customEvent = new CustomEvent('svb:change', {
                bubbles:    true,
                cancelable: true,
                event
            });

            this.setValue(this.input.value);

            return this.component.dispatchEvent(customEvent);
        });
    }

    publicMethods () {
        this.component.setValue = this.setValue.bind(this);
        this.component.getValue = this.getValue.bind(this);
        this.component.appendItems = this.appendItems.bind(this);
        this.component.appendItem = this.appendItem.bind(this);
        this.component.removeItem = this.removeItem.bind(this);
        this.component.deleteFile = this.deleteFile.bind(this);
        this.component.getInstance = this.getInstance.bind(this);

        this.component.hideControll = this.toggleControllButtons.bind(this, false);
        this.component.showControll = this.toggleControllButtons.bind(this, true);
    }

    download (id) {
        this.downloadMethod(id)
            .then((res) => {
                console.log(res);
            })
            .catch();
    }

    loadFile (file) {
        this.eventChange()
            .then((res) => {})
            .catch();

        this.loadMethod(file)
            .then((res) => {
                this.appendItems([{ file, svbFormat: res }]);
            })
            .catch();
    }

    getValue () {
        return this.state.files.map(i => i.svbFormat);
    }

    /**
     *
     * @param {{value: String, represent: String, url: String}[]} files
     */
    setValue (files) {
        if (Array.isArray(files) && files) {
            this.state.files = files.map(file => ({
                id:   Math.random() * 2345235345,
                file: {
                    name:  file.represent || file.name || '',
                    url:   file.url,
                    value: file.value || file.url
                },
                svbFormat: {
                    name:  file.represent || file.name || '',
                    url:   file.url,
                    value: file.value || file.url
                }
            }));

            this.renderList();
        }
    }

    appendItems (items) {
        if (items?.length === 0) return;

        Array.from(items).forEach(item => this.appendItem(item));
    }

    appendItem (item) {
        if (!item) return;

        if ((this.state.files.length + 1) === this.state.maxFilesLenght) {
            this.showError(`Максимальное количество файлов ${this.state.maxFilesLenght}`);

            return;
        }

        if (item.size > (this.state.maxFileSize * 1000000)) {
            this.showError(`Максимальный размер файла ${this.state.maxFileSize} мб.`);

            return;
        }

        this.state.files.push({
            id:        Math.random() * 2345235345,
            file:      item.file,
            svbFormat: item.svbFormat
        });

        this.renderList();
    }

    /**
     *
     * @param {`Number`} id
     */
    removeItem (id) {
        const item = this.state.files.find(file => file.id === id);

        console.log(id, item);

        this.removeMethod(item);
    }

    /**
     *
     * @param {`Number`} id
     */
    deleteFile (id) {
        if (!id) return;

        this.state.files = this.state.files.filter(item => item.id !== id);
        this.renderList();
    }

    toggleControllButtons (isShow) {
        if (!isShow) {
            this.component.classList.add('svbUploader--hide-controll');

            return;
        }

        this.component.classList.remove('svbUploader--hide-controll');
    }

    enable () {
        this.readOnlyToggle(false);
    }

    disable () {
        this.readOnlyToggle(true);
    }

    readOnlyToggle (readOnly) {
        this.state.settings.readOnly = readOnly;

        this.component.classList.toggle('svbUploader--hide-controll');
        this.fileListLabel.style.display = readOnly ? 'none' : '';
        this.fileListGrid.style.paddingTop = readOnly ? '12px' : '';
    }

    /**
     *
     * @param {String} message
     */
    showError (message) {
        this.errorMessage.textContent = message;
        this.fileList.classList.add('uploaderList--error');
        this.component.appendChild(this.errorMessage);

        setTimeout(() => {
            this.fileList.classList.remove('uploaderList--error');

            this.errorMessage.remove();
        }, 4000);
    }

    renderInput () {
        this.input.addStyles({ display: 'none' });
    }

    renderList () {
        this.clearComponent(this.fileListGrid);

        if (this.state.files.length > 0) {
            this.state.files.forEach((item) => {
                const fileItem = SvbElement.create('div', null, 'uploaderList__item', null);
                const imageBlock = FileUploader.getPreview(item.file, 'uploaderList__image');
                const fileName = SvbElement.create('span', null, 'uploaderList__file-name', null);
                const removeBtn = SvbElement.create(
                    'button',
                    null,
                    'uploaderList__remove-btn',
                    `
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.5 5.5L18.8803 15.5251C18.7219 18.0864 18.6428 19.3671 18.0008 20.2879C17.6833 
                            20.7431 17.2747 21.1273 16.8007 21.416C15.8421 22 14.559 22 11.9927 22C9.42312 22 8.1383 
                            22 7.17905 21.4149C6.7048 21.1257 6.296 20.7408 5.97868 20.2848C5.33688 19.3626 5.25945 
                            18.0801 5.10461 15.5152L4.5 5.5" stroke="rgba(255, 68, 67, 1)" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M3 5.5H21M16.0557 5.5L15.3731 4.09173C14.9196 3.15626 14.6928 2.68852 14.3017 
                            2.39681C14.215 2.3321 14.1231 2.27454 14.027 2.2247C13.5939 2 13.0741 2 12.0345 2C10.9688 
                            2 10.436 2 9.99568 2.23412C9.8981 2.28601 9.80498 2.3459 9.71729 2.41317C9.32164 2.7167 
                            9.10063 3.20155 8.65861 4.17126L8.05292 5.5" stroke="rgba(255, 68, 67, 1)" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M9.5 16.5V10.5" stroke="rgba(255, 68, 67, 1)" stroke-width="1.5" stroke-linecap="round"/>
                            <path d="M14.5 16.5V10.5" stroke="rgba(255, 68, 67, 1)" stroke-width="1.5" stroke-linecap="round"/>
                        </svg>
                    `
                );
                const zoomBtn = SvbElement.create(
                    'button',
                    null,
                    'uploaderList__zoom-btn',
                    `
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.5 17.5L22 22" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M20 11C20 6.02944 15.9706 2 11 2C6.02944 2 2 6.02944 2 11C2 15.9706 6.02944 20 11 
                            20C15.9706 20 20 15.9706 20 11Z" stroke="black" stroke-width="1.5" stroke-linejoin="round"/>
                            <path d="M7.5 11H14.5M11 7.5V14.5" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>                    
                    `
                );

                fileName.textContent = item.file.name;
                fileName.title = item.file.name;

                zoomBtn.addAttributes({ fileId: item.id });
                zoomBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    this.showImage(item.id);
                });

                removeBtn.addAttributes({ fileId: item.id });
                removeBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    this.deleteFile(item.id);
                });

                imageBlock.addEventListener('click', (e) => {
                    e.stopPropagation();
                    e.preventDefault();

                    this.previewMethod(item.file.url);
                });

                fileItem.appendChild(imageBlock);

                // fileItem.appendChild(fileName);
                if (item?.file?.type === 'image/svg+xml' || item?.file?.type === 'image/jpeg' || item?.file?.type === 'image/png') {
                    fileItem.appendChild(zoomBtn);
                }

                fileItem.appendChild(removeBtn);

                this.fileListGrid.append(fileItem);
            });

            this.fileListGrid.addStyles({ display: '' });
        } else {
            this.fileListGrid.addStyles({ display: 'none' });
        }

        this.fileList.appendChild(this.componentTitle);
        this.fileList.appendChild(this.fileListLabel);
        this.fileList.appendChild(this.fileListGrid);
    }

    render () {
        this.renderInput();
        this.renderList();

        this.component.appendChild(this.input);
        this.component.appendChild(this.fileList);

        return this.component;
    }

    static getPreview (file, className) {
        const ext = (name) => {
            const m = name?.match(/\.([^.]+)$/);

            return m && m[1];
        };
        const imageBlock = SvbElement.create('div', null, className, null);
        let image = null;
        let icon = null;

        switch (ext(file.name)) {
            case 'pdf':
                icon = SvbElement.create('svg', null, 'svg-icon', `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.5 13V12.1963C3.5 9.22892 3.5 7.74523 3.96894 6.56024C4.72281 4.65521 6.31714 
                        3.15255 8.33836 2.44201C9.59563 2.00003 11.1698 2.00003 14.3182 2.00003C16.1173 2.00003 
                        17.0168 2.00003 17.7352 2.25259C18.8902 2.65861 19.8012 3.51728 20.232 4.60587C20.5 5.283 
                        20.5 6.13082 20.5 7.82646V12.0142V13" stroke="black" stroke-width="1.3" 
                        stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3.5 12C3.5 10.1591 4.99238 8.66667 6.83333 8.66667C7.49912 8.66667 8.28404 8.78333 
                        8.93137 8.60988C9.50652 8.45576 9.95576 8.00652 10.1099 7.43136C10.2833 6.78404 10.1667 5.99912 
                        10.1667 5.33333C10.1667 3.49238 11.6591 2 13.5 2" stroke="black" stroke-width="1.3" 
                        stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3.5 22V19M3.5 19V17.2C3.5 16.6343 3.5 16.3515 3.67574 16.1757C3.85147 16 4.13431 16 
                        4.7 16H5.5C6.32843 16 7 16.6716 7 17.5C7 18.3284 6.32843 19 5.5 19H3.5ZM20.5 16H19C18.0572 16 
                        17.5858 16 17.2929 16.2929C17 16.5858 17 17.0572 17 18V19M17 19V22M17 19H19.5M14 19C14 20.6569 
                        12.6569 22 11 22C10.6262 22 10.4392 22 10.3 21.9196C9.96665 21.7272 10 21.3376 10 21V17C10 
                        16.6624 9.96665 16.2728 10.3 16.0804C10.4392 16 10.6262 16 11 16C12.6569 16 14 17.3431 14 19Z" 
                        stroke="black" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>                
                `);
                imageBlock.classList.add('uploaderList__image--pdf');

                break;

            case 'doc':
            case 'docx':
            case 'rtf':
                icon = SvbElement.create('svg', null, 'svg-icon', `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 14.0163C20.9544 13.0244 20.2766 13 19.3571 13C17.9407 13 17.7059 13.3384 
                        17.7059 14.6667V16.3333C17.7059 17.6616 17.9407 18 19.3571 18C20.2766 18 20.9544 17.9756 
                        21 16.9837M10.2949 15.5C10.2949 16.8807 9.18876 18 7.82429 18C7.51642 18 7.36248 18 
                        7.24782 17.933C6.9733 17.7726 7.00076 17.448 7.00076 17.1667V13.8333C7.00076 13.552 
                        6.9733 13.2274 7.24782 13.067C7.36248 13 7.51642 13 7.82429 13C9.18876 13 10.2949 
                        14.1193 10.2949 15.5ZM14 18C13.2236 18 12.8354 18 12.5941 17.7559C12.3529 17.5118 
                        12.3529 17.119 12.3529 16.3333V14.6667C12.3529 13.881 12.3529 13.4882 12.5941 13.2441C12.8354 
                        13 13.2236 13 14 13C14.7764 13 15.1646 13 15.4059 13.2441C15.6471 13.4882 15.6471 13.881 
                        15.6471 14.6667V16.3333C15.6471 17.119 15.6471 17.5118 15.4059 17.7559C15.1646 18 14.7764 
                        18 14 18Z" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M15 22H10.7273C7.46607 22 5.83546 22 4.70307 21.2022C4.37862 20.9736 4.09058 
                        20.7025 3.8477 20.3971C3 19.3313 3 17.7966 3 14.7273V12.1818C3 9.21865 3 7.73706 3.46894 
                        6.55375C4.22281 4.65142 5.81714 3.15088 7.83836 2.44135C9.09563 2 10.6698 2 13.8182 2C15.6173 
                        2 16.5168 2 17.2352 2.2522C18.3902 2.65765 19.3012 3.5151 19.732 4.60214C20 5.27832 20 6.12494 
                        20 7.81818V10" stroke="black" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M3 12C3 10.1591 4.49238 8.66667 6.33333 8.66667C6.99912 8.66667 7.78404 8.78333 8.43137 
                        8.60988C9.00652 8.45576 9.45576 8.00652 9.60988 7.43136C9.78333 6.78404 9.66667 5.99912 9.66667 
                        5.33333C9.66667 3.49238 11.1591 2 13 2" stroke="black" stroke-width="1.5" stroke-linecap="round" 
                        stroke-linejoin="round"/>
                    </svg>                               
                `);
                imageBlock.classList.add('uploaderList__image--word');

                break;

            case 'xls':
            case 'xlsx':
            case 'csv':
                icon = SvbElement.create('svg', null, 'svg-icon', `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11V10C21 6.22876 21 4.34315 19.7595 3.17157C18.519 2 16.5225 2 12.5294 2H11.4706C7.47752 
                        2 5.48098 2 4.24049 3.17157C3 4.34315 3 6.22876 3 10V14C3 17.7712 3 19.6569 4.24049 20.8284C5.48098 
                        22 7.47751 22 11.4706 22H12" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 7H16" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 12H13" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M21 20.6471V17C21 15.5706 19.6569 14 18 14C16.3431 14 15 15.5706 15 17V20.5C15 21.2797 
                        15.7326 22 16.6364 22C17.5401 22 18.2727 21.2797 18.2727 20.5V17.7647" stroke="black" stroke-width="1.5" 
                        stroke-linecap="round"/>
                    </svg>                                            
                `);
                imageBlock.classList.add('uploaderList__image--excel');

                break;

            case 'ppt':
            case 'pptx':
            case 'pps':
                icon = SvbElement.create('svg', null, 'svg-icon', `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11V10C21 6.22876 21 4.34315 19.7595 3.17157C18.519 2 16.5225 2 12.5294 2H11.4706C7.47752 
                        2 5.48098 2 4.24049 3.17157C3 4.34315 3 6.22876 3 10V14C3 17.7712 3 19.6569 4.24049 20.8284C5.48098 
                        22 7.47751 22 11.4706 22H12" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 7H16" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 12H13" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M21 20.6471V17C21 15.5706 19.6569 14 18 14C16.3431 14 15 15.5706 15 17V20.5C15 21.2797 
                        15.7326 22 16.6364 22C17.5401 22 18.2727 21.2797 18.2727 20.5V17.7647" stroke="black" stroke-width="1.5" 
                        stroke-linecap="round"/>
                    </svg>                                            
                `);
                imageBlock.classList.add('uploaderList__image--powerpoint');

                break;

            case 'tif':
            case 'tiff':
            case 'jif':
                icon = SvbElement.create('svg', null, 'svg-icon', `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11V10C21 6.22876 21 4.34315 19.7595 3.17157C18.519 2 16.5225 
                        2 12.5294 2H11.4706C7.47752 2 5.48098 2 4.24049 3.17157C3 4.34315 3 6.22876 
                        3 10V14C3 17.7712 3 19.6569 4.24049 20.8284C5.48098 
                        22 7.47751 22 11.4706 22H12" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 7H16" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 12H13" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M21 20.6471V17C21 15.5706 19.6569 14 18 14C16.3431 14 15 15.5706 15 17V20.5C15 21.2797 
                        15.7326 22 16.6364 22C17.5401 22 18.2727 21.2797 18.2727 20.5V17.7647" 
                        stroke="black" stroke-width="1.5" 
                        stroke-linecap="round"/>
                    </svg>                                            
                `);
                imageBlock.classList.add('uploaderList__image--file-image');

                break;

            case 'html':
            case 'htm':
            case 'js':
            case 'css':
            case 'scss':
            case 'vue':
            case 'jsx':
                icon = SvbElement.create('svg', null, 'svg-icon', `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11V10C21 6.22876 21 4.34315 19.7595 3.17157C18.519 2 16.5225 2 12.5294 
                        2H11.4706C7.47752 2 5.48098 2 4.24049 3.17157C3 4.34315 3 6.22876 3 10V14C3 17.7712 
                        3 19.6569 4.24049 20.8284C5.48098 22 7.47751 22 11.4706 22H12" stroke="black" 
                        stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 7H16" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 12H13" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M21 20.6471V17C21 15.5706 19.6569 14 18 14C16.3431 14 15 15.5706 15 17V20.5C15 21.2797 
                        15.7326 22 16.6364 22C17.5401 22 18.2727 21.2797 18.2727 20.5V17.7647" stroke="black" 
                        stroke-width="1.5" stroke-linecap="round"/>
                    </svg>                                            
                `);
                imageBlock.classList.add('uploaderList__image--code');

                break;

            case 'aiff':
            case 'au':
            case 'mp3':
            case 'mpe':
            case 'ra':
            case 'rm':
            case 'wav':
            case 'wma':
                icon = SvbElement.create('svg', null, 'svg-icon', `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11V10C21 6.22876 21 4.34315 19.7595 3.17157C18.519 2 16.5225 2 12.5294 2H11.4706C7.47752 
                        2 5.48098 2 4.24049 3.17157C3 4.34315 3 6.22876 3 10V14C3 17.7712 3 19.6569 4.24049 20.8284C5.48098 
                        22 7.47751 22 11.4706 22H12" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 7H16" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 12H13" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M21 20.6471V17C21 15.5706 19.6569 14 18 14C16.3431 14 15 15.5706 15 17V20.5C15 21.2797 
                        15.7326 22 16.6364 22C17.5401 22 18.2727 21.2797 18.2727 20.5V17.7647" stroke="black" stroke-width="1.5" 
                        stroke-linecap="round"/>
                    </svg>                                            
                `);
                imageBlock.classList.add('uploaderList__image--audio');

                break;

            case 'avi':
            case 'mpg':
            case 'mpeg':
            case 'mov':
            case 'ram':
            case 'mp4':
                icon = SvbElement.create('svg', null, 'svg-icon', `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11V10C21 6.22876 21 4.34315 19.7595 3.17157C18.519 2 16.5225 2 12.5294 2H11.4706C7.47752 
                        2 5.48098 2 4.24049 3.17157C3 4.34315 3 6.22876 3 10V14C3 17.7712 3 19.6569 4.24049 20.8284C5.48098 
                        22 7.47751 22 11.4706 22H12" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 7H16" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 12H13" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M21 20.6471V17C21 15.5706 19.6569 14 18 14C16.3431 14 15 15.5706 15 17V20.5C15 21.2797 
                        15.7326 22 16.6364 22C17.5401 22 18.2727 21.2797 18.2727 20.5V17.7647" stroke="black" stroke-width="1.5" 
                        stroke-linecap="round"/>
                    </svg>                                            
                `);
                imageBlock.classList.add('uploaderList__image--video');

                break;

            case 'zip':
            case 'rar':
            case 'gz':
                icon = SvbElement.create('svg', null, 'svg-icon', `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11V10C21 6.22876 21 4.34315 19.7595 3.17157C18.519 2 16.5225 2 12.5294 2H11.4706C7.47752 
                        2 5.48098 2 4.24049 3.17157C3 4.34315 3 6.22876 3 10V14C3 17.7712 3 19.6569 4.24049 20.8284C5.48098 
                        22 7.47751 22 11.4706 22H12" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 7H16" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 12H13" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M21 20.6471V17C21 15.5706 19.6569 14 18 14C16.3431 14 15 15.5706 15 17V20.5C15 21.2797 
                        15.7326 22 16.6364 22C17.5401 22 18.2727 21.2797 18.2727 20.5V17.7647" stroke="black" stroke-width="1.5" 
                        stroke-linecap="round"/>
                    </svg>                                            
                `);
                imageBlock.classList.add('uploaderList__image--zip');

                break;

            case 'jpg':
            case 'jpeg':
            case 'png':
            case 'ico':
            case 'svg':
            case 'webp':
            case 'gif':
                image = SvbElement.create('img', null, null, null);
                file.image = FileUploader.imagePreview(file, image);

                imageBlock.classList.add('uploaderList__image--image');

                break;

            default:
                icon = SvbElement.create('svg', null, 'svg-icon', `
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M21 11V10C21 6.22876 21 4.34315 19.7595 3.17157C18.519 2 16.5225 2 12.5294 2H11.4706C7.47752 
                        2 5.48098 2 4.24049 3.17157C3 4.34315 3 6.22876 3 10V14C3 17.7712 3 19.6569 4.24049 20.8284C5.48098 
                        22 7.47751 22 11.4706 22H12" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 7H16" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M8 12H13" stroke="black" stroke-width="1.5" stroke-linecap="round"/>
                        <path d="M21 20.6471V17C21 15.5706 19.6569 14 18 14C16.3431 14 15 15.5706 15 17V20.5C15 21.2797 
                        15.7326 22 16.6364 22C17.5401 22 18.2727 21.2797 18.2727 20.5V17.7647" stroke="black" stroke-width="1.5" 
                        stroke-linecap="round"/>
                    </svg>                                            
                `);
                imageBlock.classList.add('uploaderList__image--file');

                break;
        }

        imageBlock.appendChild(icon || image);

        return imageBlock;
    }

    static imagePreview (file, img) {
        const reader = new FileReader();

        try {
            if (file.image) {
                img.src = file.image;

                return file.image;
            }

            reader.onload = (e) => {
                file.image = e.target.result;
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);

            return img.src;
        } catch (error) {

        }
    }
}

export default FileUploader;
