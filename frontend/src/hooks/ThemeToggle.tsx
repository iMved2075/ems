import {useState, useEffect, type JSX} from "react";
import { Sunny } from "@mui/icons-material";

export default function ThemeToggle(): JSX.Element {

    const [theme, setTheme] = useState<string>(()=>{
        const storedTheme = localStorage.getItem('theme');
        return storedTheme ? storedTheme : 'light';
    });

    useEffect(() => {
        const root = document.documentElement;
        root.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
    };


    return(
        <>
            <button onClick={toggleTheme} className="theme-toggle-button text-md pb-0.5 px-0.5 cursor-pointer rounded-full bg--[color:var(--text-color)] text--[color:var(--background-color)] ">
                <Sunny />
            </button>
        </>
    )
}