import axios from 'axios';

export const BaseUrl = '';

const instance = axios.create({
    baseURL: BaseUrl,
    withCredentials: true
});

export const get = (url, params) => instance.get(url, { params });
export const post = (url, data, config) => instance.post(url, data, config);
export const put = (url, data) => instance.put(url, data);
export const delet = (url) => instance.delete(url);
export const patch = (url, data) => instance.patch(url, data);
