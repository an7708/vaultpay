    import { create } from 'zustand';

    const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('vaultpay_user')) || null,
    token: localStorage.getItem('vaultpay_token') || null,

    login: (user, token) => {
        localStorage.setItem('vaultpay_token', token);
        localStorage.setItem('vaultpay_user', JSON.stringify(user));
        set({ user, token });
    },

    logout: () => {
        localStorage.removeItem('vaultpay_token');
        localStorage.removeItem('vaultpay_user');
        set({ user: null, token: null });
    },
    }));

    export default useAuthStore;