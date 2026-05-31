import {Fragment, useEffect, useState, useRef} from "react";
import { IconPlayerPlayFilled } from "@tabler/icons-react";
import {useTime} from "../provider/pomodoro.tsx";
import confetti from "canvas-confetti";

function formatSecondsAsTime(seconds: number) {
    const mins: number = Math.floor(seconds / 60);
    const secs: number = seconds % 60;

    const formattedMins = mins.toString().padStart(2, '0');
    const formattedSecs = secs.toString().padStart(2, '0');

    return [formattedMins, formattedSecs];
}

function triggerConfetti() {
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#6366f1', '#8b5cf6', '#a78bfa', '#60a5fa', '#f472b6'];

    (function frame() {
        confetti({
            particleCount: 3,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.7 },
            colors: colors
        });
        confetti({
            particleCount: 3,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.7 },
            colors: colors
        });

        if (Date.now() < end) {
            requestAnimationFrame(frame);
        }
    }());
}

// Component to animate individual digits
const AnimatedDigit = ({ digit, digitKey }: { digit: string, digitKey: string }) => {
    const [isChanging, setIsChanging] = useState(false);
    const prevDigit = useRef(digit);

    useEffect(() => {
        if (prevDigit.current !== digit) {
            setIsChanging(true);
            const timer = setTimeout(() => setIsChanging(false), 300);
            prevDigit.current = digit;
            return () => clearTimeout(timer);
        }
    }, [digit]);

    return (
        <span
            key={digitKey}
            className={`digit ${isChanging ? 'changing' : ''}`}
        >
            {digit}
        </span>
    );
};

export const Pomodoro = () => {
    const { workTime, pauseTime, breakText, showBreakText, streaksText, showStreaks, transitionSound } = useTime();
    const [ isRunning, setIsRunning ] = useState(false);
    const [ countDown, setCountDown ] = useState(0);
    const [ isPause, setIsPause ] = useState(false);
    const [ streaks, setStreaks ] = useState(0);
    const [ phaseChange, setPhaseChange ] = useState(false);
    const prevStreaksRef = useRef(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Initialize audio
    useEffect(() => {
        audioRef.current = new Audio(transitionSound);
        audioRef.current.volume = 0.5;
    }, [transitionSound]);

    // Set initial countdown to workTime
    useEffect(() => {
        if (!isRunning && countDown === 0 && workTime > 0) {
            setCountDown(workTime);
        }
    }, [workTime, isRunning, countDown]);

    // Calculate progress for the ring (0 to 1)
    const totalTime = isPause ? pauseTime : workTime;
    const progress = totalTime > 0 ? countDown / totalTime : 0;

    // SVG circle calculations
    const size = 320;
    const strokeWidth = 8;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference * (1 - progress);

    useEffect(() => {
        if (!isRunning) return;

        const timerId = setInterval(() => {
            if ( countDown <= 0 ) {
                if ( !isPause ) {
                    const newStreaks = streaks + 1;
                    setStreaks(newStreaks);

                    // Trigger confetti on milestone streaks (every 5)
                    if (newStreaks > 0 && newStreaks % 5 === 0) {
                        triggerConfetti();
                    }
                }

                // Trigger phase change animation
                setPhaseChange(true);
                setTimeout(() => setPhaseChange(false), 600);

                // Play sound
                if (audioRef.current) {
                    audioRef.current.play().catch(e => console.error("Error playing audio", e));
                }

                const nextIsPause = !isPause;
                setIsPause(nextIsPause);
                setCountDown(nextIsPause ? pauseTime : workTime);

                return;
            }

            setCountDown(countDown - 1);
        }, 1000);

        return () => clearInterval(timerId);
    }, [countDown, isRunning, isPause, streaks, pauseTime, workTime]);

    // Track streak changes for confetti
    useEffect(() => {
        prevStreaksRef.current = streaks;
    }, [streaks]);

    const [mins, secs] = formatSecondsAsTime(countDown);

    return (
        <Fragment>
            {isPause && showBreakText && <div className="pause-container">{breakText}</div>}

            <div className="countdown-ring-container">
                <div className={`countdown-ring ${isPause ? 'break-active' : ''} ${phaseChange ? 'phase-change' : ''}`}>
                    <svg viewBox={`0 0 ${size} ${size}`}>
                        <circle
                            className="ring-bg"
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                        />
                        <circle
                            className="ring-progress"
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            strokeDasharray={circumference}
                            strokeDashoffset={strokeDashoffset}
                        />
                    </svg>
                    <div className="ring-content">
                        <div className={`time-display ${mins === '00' ? 'seconds-focus' : ''}`}>
                            <AnimatedDigit digit={mins[0]} digitKey="m1" />
                            <AnimatedDigit digit={mins[1]} digitKey="m2" />
                            <span className="seconds">
                                :
                                <AnimatedDigit digit={secs[0]} digitKey="s1" />
                                <AnimatedDigit digit={secs[1]} digitKey="s2" />
                            </span>
                        </div>
                        {showStreaks && (
                            <div className="streaks-display">
                                {streaksText}: {streaks}
                            </div>
                        )}
                        {!isRunning && (
                            <button 
                                onClick={() => setIsRunning(true)}
                                style={{
                                    background: 'var(--task-header-bg)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '50px',
                                    height: '50px',
                                    cursor: 'pointer',
                                    color: 'white',
                                    display: 'flex',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    marginTop: '20px',
                                    marginLeft: 'auto',
                                    marginRight: 'auto',
                                    boxShadow: 'var(--card-shadow)',
                                    transition: 'transform 0.2s ease',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <IconPlayerPlayFilled size={24} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
