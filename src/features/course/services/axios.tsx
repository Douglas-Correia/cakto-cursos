import axios, { AxiosError } from "axios";

// https://caktus-members.onrender.com
export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
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