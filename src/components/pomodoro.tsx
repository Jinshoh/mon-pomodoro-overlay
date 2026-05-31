import {Fragment, useEffect, useState, useRef} from "react";
import { IconPlayerPlayFilled, IconPlayerPauseFilled } from "@tabler/icons-react";
import {useTime} from "../provider/pomodoro.tsx";
import confetti from "canvas-confetti";
import Peer, { DataConnection } from "peerjs";

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

export const Pomodoro = ({ isTablet = false }: { isTablet?: boolean }) => {
    const { workTime, pauseTime, breakText, showBreakText, streaksText, showStreaks, transitionSound, channel } = useTime();
    const [ isRunning, setIsRunning ] = useState(false);
    const [ countDown, setCountDown ] = useState(0);
    const [ isPause, setIsPause ] = useState(false);
    const [ streaks, setStreaks ] = useState(0);
    const [ phaseChange, setPhaseChange ] = useState(false);
    const prevStreaksRef = useRef(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [conn, setConn] = useState<DataConnection | null>(null);

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

    // PeerJS Synchronization (OBS is Master, Tablet is Slave)
    useEffect(() => {
        if (!channel) return;

        // Tablet needs a unique ID so it doesn't clash if multiple tablets connect
        const peerId = isTablet 
            ? `unfloned-pomodoro-tablet-${channel.toLowerCase()}-${Math.random().toString(36).substring(2, 7)}` 
            : `unfloned-pomodoro-obs-${channel.toLowerCase()}`;
            
        const newPeer = new Peer(peerId);
        let retryTimeout: ReturnType<typeof setTimeout>;

        newPeer.on('open', (id) => {
            console.log('Peer connected with ID: ' + id);
            
            if (isTablet) {
                const connectToOBS = () => {
                    console.log("Attempting to connect to OBS...");
                    const connection = newPeer.connect(`unfloned-pomodoro-obs-${channel.toLowerCase()}`);
                    
                    connection.on('open', () => {
                        console.log("Tablet connected to OBS!");
                        setConn(connection);
                    });

                    connection.on('data', (data: any) => {
                        if (data.type === 'SYNC') {
                            setCountDown(data.countDown);
                            setIsPause(data.isPause);
                            setIsRunning(data.isRunning);
                        }
                    });

                    connection.on('close', () => {
                        console.log("Connection closed, retrying...");
                        setConn(null);
                        retryTimeout = setTimeout(connectToOBS, 3000);
                    });
                };
                connectToOBS();
            }
        });

        if (!isTablet) {
            // OBS Mode: Listen for incoming tablet connections
            newPeer.on('connection', (connection) => {
                console.log("OBS received connection from Tablet!");
                setConn(connection);
                
                connection.on('data', (data: any) => {
                    if (data.type === 'START') {
                        setIsRunning(true);
                    } else if (data.type === 'PAUSE') {
                        setIsRunning(false);
                    }
                });
            });
        }

        newPeer.on('error', (err) => {
            console.error('Peer error:', err);
            if (isTablet && err.type === 'peer-unavailable') {
                // OBS not ready yet, retry in 3s
                retryTimeout = setTimeout(() => {
                    const connection = newPeer.connect(`unfloned-pomodoro-obs-${channel.toLowerCase()}`);
                    connection.on('open', () => setConn(connection));
                    connection.on('data', (data: any) => {
                        if (data.type === 'SYNC') {
                            setCountDown(data.countDown);
                            setIsPause(data.isPause);
                            setIsRunning(data.isRunning);
                        }
                    });
                }, 3000);
            }
        });

        return () => {
            clearTimeout(retryTimeout);
            newPeer.destroy();
        };
    }, [channel, isTablet]);

    // Send periodic syncs from OBS (Master) to Tablet (Slave)
    useEffect(() => {
        if (!isTablet && conn) {
            // Send immediately when state changes
            conn.send({ type: 'SYNC', countDown, isPause, isRunning });
            
            // And periodically to prevent drift
            const syncInterval = setInterval(() => {
                conn.send({ type: 'SYNC', countDown, isPause, isRunning });
            }, 2000);
            
            return () => clearInterval(syncInterval);
        }
    }, [isTablet, conn, isRunning, countDown, isPause]);

    const handleStart = () => {
        setIsRunning(true);
        if (conn) conn.send({ type: 'START' });
    };

    const handlePause = () => {
        setIsRunning(false);
        if (conn) conn.send({ type: 'PAUSE' });
    };

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
                        {!isRunning ? (
                            <button 
                                onClick={handleStart}
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
                        ) : isTablet && (
                            <button 
                                onClick={handlePause}
                                style={{
                                    background: 'rgba(255, 255, 255, 0.2)',
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
                                    backdropFilter: 'blur(10px)',
                                }}
                                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                            >
                                <IconPlayerPauseFilled size={24} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </Fragment>
    );
}
