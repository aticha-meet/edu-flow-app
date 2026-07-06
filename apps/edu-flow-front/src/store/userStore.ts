import { getLoginUser } from '@/api/user/controller';
import { ResponeUserType } from '@lib/types/model/user';
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware'

const userStore = (set: any, get: any) => ({
    session: {},
    active: false as true | false,
    logout: () => {
        set({
            session: null,
            active: false
        })
    },
    getUserFromStore: async (email: string) => {
        console.log(email)
        const res = await getLoginUser({ email }) as ResponeUserType
        set({
            session: res.data,
            active: true,
        })
    }
})

const usePersist = {
    name: "userStore",
    storage: createJSONStorage(() => localStorage)
}

const useUserStore = create(persist(userStore, usePersist));

export default useUserStore;

