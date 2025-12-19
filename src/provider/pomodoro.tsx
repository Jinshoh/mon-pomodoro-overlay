import { createContext, useContext, useState, ReactNode, FunctionComponent } from 'react';

interface TimeContextType {
    pauseTime: number;
    setPauseTime: (value: number) => void;
    workTime: number;
    channel: string;
    setWorkTime: (value: number) => void;
    setChannel: (value: string) => void;
    accentColor: string;
    setAccentColor: (value: string) => void;
    breakText: string;
    setBreakText: (value: string) => void;
    showBreakText: boolean;
    setShowBreakText: (value: boolean) => void;
    streaksText: string;
    setStreaksText: (value: string) => void;
    showStreaks: boolean;
    setShowStreaks: (value: boolean) => void;
    showTasks: boolean;
    setShowTasks: (value: boolean) => void;
}

const TimeContext = createContext<TimeContextType | undefined>(undefined);

const parseNumberCookie = (cookieName: string): number => {
    return Number(localStorage.getItem(cookieName));
};

const parseBooleanCookie = (cookieName: string, defaultValue: boolean): boolean => {
    const value = localStorage.getItem(cookieName);
    if (value === null) return defaultValue;
    return value === 'true';
};

const TimeProvider: FunctionComponent<{children: ReactNode}> = ({ children }) => {
    const [pauseTime, setPauseTime] = useState<number>(parseNumberCookie('pause') || 600);
    const [workTime, setWorkTime] = useState<number>(parseNumberCookie('work') || 3000);
    const [channel, setChannel] = useState(localStorage.getItem('channel') || "");
    const [accentColor, setAccentColor] = useState(localStorage.getItem('accentColor') || "#6366f1");
    const [breakText, setBreakText] = useState(localStorage.getItem('breakText') || "BREAK");
    const [showBreakText, setShowBreakText] = useState(parseBooleanCookie('showBreakText', true));
    const [streaksText, setStreaksText] = useState(localStorage.getItem('streaksText') || "Streaks");
    const [showStreaks, setShowStreaks] = useState(parseBooleanCookie('showStreaks', true));
    const [showTasks, setShowTasks] = useState(parseBooleanCookie('showTasks', true));

    return (
        <TimeContext.Provider value={{
            pauseTime,
            setPauseTime,
            workTime,
            setWorkTime,
            channel,
            setChannel,
            accentColor,
            setAccentColor,
            breakText,
            setBreakText,
            showBreakText,
            setShowBreakText,
            streaksText,
            setStreaksText,
            showStreaks,
            setShowStreaks,
            showTasks,
            setShowTasks
        }}>
            {children}
        </TimeContext.Provider>
    );
};

const useTime = () => {
    const context = useContext(TimeContext);
    if (context === undefined) {
        throw new Error('useTime muss innerhalb eines TimeProvider verwendet werden');
    }
    return context;
};

export { TimeProvider, useTime };
