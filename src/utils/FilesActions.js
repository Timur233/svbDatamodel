export class FilesActions {
    static async upload (file) {
        const formData = new FormData();

        formData.append('file', file);

        return fetch('https://cab.qazaqstroy.kz/files/upload', {
            method: 'POST',
            body:   formData
        })
            .then(res => res.json())
            .then(res => ({
                name:  res.name,
                url:   res.url,
                value: res.url
            }));
    };

    static async preview (uuid) {
        const response = await fetch('https://cab.qazaqstroy.kz/files/download', {
            method: 'POST',
            body:   JSON.stringify({ url: uuid })
        });
        const blob = await response.blob();
        const reader = new FileReader();
        const base64data = await new Promise((resolve, reject) => {
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });

        return base64data;
    };

    static async remove () {};
}