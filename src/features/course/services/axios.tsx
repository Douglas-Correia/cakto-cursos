import axios, { AxiosError } from "axios";

export const api = axios.create({
    baseURL: 'https://caktus-members.onrender.com',
    headers: {
        'Content-type': 'application/json'
    }
});

api.interceptors.request.use(
    async (config: any) => {
        const dataUser = JSON.parse(localStorage.getItem('@dataCakto') ?? '{}');
        const token = dataUser.token;

        if (token) {
            config.headers.Authorization = `${token}`;
        }
        return config
    },
    (error: AxiosError) => {
        console.log(error);
    }
)