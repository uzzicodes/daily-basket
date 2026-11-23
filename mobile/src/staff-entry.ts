import {createContext} from 'react';
// Opens the staff sign-in screen from the shopping app; App.tsx provides it.
export const StaffEntryContext=createContext<()=>void>(()=>{});
