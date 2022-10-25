import create from 'zustand';

export const useStore = create<Store>((set, get) => ({
    token: localStorage.getItem('token'),
    setToken: (token: string) => {
        localStorage.setItem('token', token);
        set({ token });
    },

    messages: [],
    readMessages: async () => {
        const messages = (await get().getRest('/messages')) as Message[];
        set({ messages });
    },
    sendMessage: async (content) => {
        await get().postRest('/messages', { content });
    },
    messageCreated: async (message) => {
        set(({ messages }) => ({ messages: [message, ...messages] }));
    },

    getRest: async (url) => {
        const response = await fetch('http://localhost:3000' + url, {
            headers: {
                Authorization: 'Bearer ' + get().token,
            },
        });
        if (!response.ok) {
            throw Error(`${response.statusText} ${await response.text()}`);
        }
        return await response.json();
    },
    postRest: async (url, body) => {
        const response = await fetch('http://localhost:3000' + url, {
            method: 'post',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + get().token,
            },
        });
        if (!response.ok) {
            throw Error(`${response.statusText} ${await response.text()}`);
        }
        return await response.json();
    },
}));

export interface Store {
    token: string | null;
    setToken(token: string): void;

    messages: Message[];
    readMessages(): void;
    sendMessage(content: string): Promise<void>;
    messageCreated(message: Message): Promise<void>;

    getRest(url: string): Promise<unknown>;
    postRest(url: string, body: unknown): Promise<unknown>;
}

export interface Message {
    id: string;
    content: string;
}