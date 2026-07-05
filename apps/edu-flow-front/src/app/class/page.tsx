'use client';
import { getListUsers } from '@/api/user/controller';
import { Navbar } from '@/components/navbar';
import { useEffect, useState } from 'react';

export default function Index() {
    const [users, setUsers] = useState([]);

    const fetchUsers = async () => {
        try {
            const users = await getListUsers('/users')
            setUsers(users.data)
            console.log(users)
        } catch (err) {
            console.error('Error fetching users:', err);
        }
    }

    useEffect(() => {

        if (users.length === 0) fetchUsers();
        // checkRoleUser();
    }, [users]);
    /*
     * Replace the elements below with your own.
     *
     * Note: The corresponding styles are in the ./index.css file.
     */
    return (
        <div>
            <Navbar />
            <h1 >Welcome to Edu-Flow!</h1>
        </div>
    );
};
