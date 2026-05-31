
import { Pomodoro } from "./pomodoro.tsx";
import { useTime } from "../provider/pomodoro.tsx";
import { Settings } from "./settings.tsx";
import { ActionIcon } from "@mantine/core";
import { IconMaximize } from "@tabler/icons-react";

export const TabletView = () => {
    const { channel } = useTime();

    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.error(`Error attempting to enable full-screen mode: ${err.message} (${err.name})`);
            });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    };

    return (
        <div className="tablet-layout">
            <Settings />
            <ActionIcon
                variant="light"
                size="xl"
                radius="xl"
                onClick={toggleFullScreen}
                style={{
                    position: 'absolute',
                    bottom: 80,
                    right: 20,
                    zIndex: 100,
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
            >
                <IconMaximize style={{ width: '60%', height: '60%' }} stroke={1.5} />
            </ActionIcon>
            <div className="tablet-left">
                <Pomodoro isTablet={true} />
            </div>
            <div className="tablet-right">
                {channel ? (
                    <iframe
                        src={`https://www.twitch.tv/embed/${channel}/chat?parent=${window.location.hostname}&darkpopout`}
                        height="100%"
                        width="100%"
                        style={{ border: 'none', borderRadius: '16px' }}
                    ></iframe>
                ) : (
                    <div className="tablet-no-channel">
                        <h2>Veuillez configurer votre chaîne dans les paramètres de l'overlay classique d'abord.</h2>
                    </div>
                )}
            </div>
        </div>
    );
};
