export interface UserType {
    id: string;
    email: string;
    name: string;
    role: 'ADMIN' | 'TEACHER' | 'STUDENT'
}

export interface ResponeUserType {
    message: string;
    data: UserType;
}