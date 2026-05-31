import {useTime} from "../provider/pomodoro.tsx";
import {
    ActionIcon,
    Box,
    Button,
    ColorSwatch,
    Divider,
    Group,
    Modal,
    NumberInput,
    SegmentedControl,
    SimpleGrid,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
    Tooltip,
    ColorInput,
    Select,
    useMantineColorScheme
} from "@mantine/core";
import {useDisclosure} from "@mantine/hooks";
import {Fragment, useRef} from "react";
import {IconAdjustments, IconCheck, IconDownload, IconMoon, IconSun, IconUpload, IconPlayerPlay} from "@tabler/icons-react";

const SOUNDS = [
    { value: '/transition.ogg', label: 'Beep' },
    { value: '/clock_ring.ogg', label: 'Clock Ring' },
    { value: '/cartoon_boing.ogg', label: 'Cartoon Boing' },
];

const ACCENT_COLORS = [
    { name: 'Indigo', value: '#6366f1' },
    { name: 'Purple', value: '#8b5cf6' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Yellow', value: '#eab308' },
    { name: 'Green', value: '#22c55e' },
    { name: 'Teal', value: '#14b8a6' },
    { name: 'Cyan', value: '#06b6d4' },
    { name: 'Blue', value: '#3b82f6' },
];

export const Settings = () => {
    const [opened, { open, close }] = useDisclosure(false);
    const {
        workTime, setWorkTime,
        pauseTime, setPauseTime,
        channel, setChannel,
        accentColor, setAccentColor,
        breakText, setBreakText,
        showBreakText, setShowBreakText,
        streaksText, setStreaksText,
        showStreaks, setShowStreaks,
        showTasks, setShowTasks,
        transitionSound, setTransitionSound,
        isTabletMode, setIsTabletMode
    } = useTime();
    const { colorScheme, setColorScheme } = useMantineColorScheme();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const playSound = (soundUrl: string) => {
        const audio = new Audio(soundUrl);
        audio.volume = 0.5;
        audio.play().catch(e => console.error("Error playing sound", e));
    };

    const handleColorSchemeChange = (value: string) => {
        const scheme = value as 'light' | 'dark';
        setColorScheme(scheme);
        localStorage.setItem('colorScheme', scheme);
    };

    const handleAccentColorChange = (color: string) => {
        setAccentColor(color);
        localStorage.setItem('accentColor', color);
        document.documentElement.style.setProperty('--accent-color', color);
    };

    const exportSettings = () => {
        const settings = {
            pauseTime,
            workTime,
            channel,
            accentColor,
            colorScheme,
            breakText,
            showBreakText,
            streaksText,
            showStreaks,
            showTasks,
            transitionSound,
            isTabletMode
        };

        const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'pomodoro-settings.json';
        a.click();
        URL.revokeObjectURL(url);
    };

    const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const settings = JSON.parse(e.target?.result as string);

                if (settings.pauseTime) {
                    setPauseTime(settings.pauseTime);
                    localStorage.setItem('pause', String(settings.pauseTime));
                }
                if (settings.workTime) {
                    setWorkTime(settings.workTime);
                    localStorage.setItem('work', String(settings.workTime));
                }
                if (settings.channel !== undefined) {
                    setChannel(settings.channel);
                    localStorage.setItem('channel', settings.channel);
                }
                if (settings.accentColor) {
                    handleAccentColorChange(settings.accentColor);
                }
                if (settings.colorScheme) {
                    handleColorSchemeChange(settings.colorScheme);
                }
                if (settings.breakText !== undefined) {
                    setBreakText(settings.breakText);
                    localStorage.setItem('breakText', settings.breakText);
                }
                if (settings.showBreakText !== undefined) {
                    setShowBreakText(settings.showBreakText);
                    localStorage.setItem('showBreakText', String(settings.showBreakText));
                }
                if (settings.streaksText !== undefined) {
                    setStreaksText(settings.streaksText);
                    localStorage.setItem('streaksText', settings.streaksText);
                }
                if (settings.showStreaks !== undefined) {
                    setShowStreaks(settings.showStreaks);
                    localStorage.setItem('showStreaks', String(settings.showStreaks));
                }
                if (settings.showTasks !== undefined) {
                    setShowTasks(settings.showTasks);
                    localStorage.setItem('showTasks', String(settings.showTasks));
                }
                if (settings.transitionSound) {
                    setTransitionSound(settings.transitionSound);
                    localStorage.setItem('transitionSound', settings.transitionSound);
                }
                if (settings.isTabletMode !== undefined) {
                    setIsTabletMode(settings.isTabletMode);
                    localStorage.setItem('isTabletMode', String(settings.isTabletMode));
                }
            } catch (err) {
                console.error('Failed to import settings:', err);
            }
        };
        reader.readAsText(file);

        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <Fragment>
            <Box pos={"absolute"} bottom={20} right={20} style={{ zIndex: 100 }}>
                <ActionIcon
                    variant="light"
                    size="xl"
                    radius="xl"
                    aria-label="Settings"
                    onClick={open}
                    style={{
                        backdropFilter: 'blur(10px)',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                    }}
                >
                    <IconAdjustments style={{ width: '60%', height: '60%' }} stroke={1.5} />
                </ActionIcon>
            </Box>

            <Modal
                opened={opened}
                onClose={close}
                title={<Title order={3}>Settings</Title>}
                size="md"
                centered
            >
                <Stack gap="lg">
                    <Box>
                        <Text size="sm" fw={500} mb="xs">Appearance</Text>
                        <SegmentedControl
                            fullWidth
                            value={colorScheme}
                            onChange={handleColorSchemeChange}
                            data={[
                                {
                                    value: 'light',
                                    label: (
                                        <Group gap="xs" justify="center">
                                            <IconSun size={16} />
                                            <span>Light</span>
                                        </Group>
                                    ),
                                },
                                {
                                    value: 'dark',
                                    label: (
                                        <Group gap="xs" justify="center">
                                            <IconMoon size={16} />
                                            <span>Dark</span>
                                        </Group>
                                    ),
                                },
                            ]}
                        />
                    </Box>

                    <Box>
                        <Text size="sm" fw={500} mb="xs">Accent Color</Text>
                        <SimpleGrid cols={5} spacing="xs">
                            {ACCENT_COLORS.map((color) => (
                                <Tooltip key={color.value} label={color.name} withArrow>
                                    <ActionIcon
                                        variant={accentColor === color.value ? 'filled' : 'subtle'}
                                        size="lg"
                                        radius="md"
                                        onClick={() => handleAccentColorChange(color.value)}
                                        style={{
                                            backgroundColor: accentColor === color.value ? color.value : 'transparent',
                                        }}
                                    >
                                        <ColorSwatch
                                            color={color.value}
                                            size={24}
                                            style={{ cursor: 'pointer' }}
                                        >
                                            {accentColor === color.value && (
                                                <IconCheck size={14} color="white" />
                                            )}
                                        </ColorSwatch>
                                    </ActionIcon>
                                </Tooltip>
                            ))}
                        </SimpleGrid>
                        <ColorInput
                            mt="md"
                            placeholder="Pick color"
                            label="Custom accent color"
                            value={accentColor}
                            onChange={handleAccentColorChange}
                        />
                    </Box>

                    <Divider />

                    <Box>
                        <Text size="sm" fw={500} mb="sm">Audio</Text>
                        <Group align="flex-end">
                            <Select
                                style={{ flex: 1 }}
                                label="Transition sound"
                                data={SOUNDS}
                                value={transitionSound}
                                onChange={(val) => {
                                    if (val) {
                                        setTransitionSound(val);
                                        localStorage.setItem('transitionSound', val);
                                    }
                                }}
                            />
                            <ActionIcon 
                                size="input-sm" 
                                variant="light" 
                                color="gray"
                                onClick={() => playSound(transitionSound)}
                                aria-label="Play sound"
                                style={{ width: 36, height: 36 }}
                            >
                                <IconPlayerPlay size={18} />
                            </ActionIcon>
                        </Group>
                    </Box>

                    <Divider />

                    <Box>
                        <Text size="sm" fw={500} mb="sm">Timer Configuration</Text>
                        <Stack gap="md">
                            <NumberInput
                                size="md"
                                label="Break duration"
                                description="Duration in seconds when break is active"
                                placeholder="600"
                                min={1}
                                value={pauseTime}
                                onChange={(value: string | number) => {
                                    setPauseTime(Number(value));
                                    localStorage.setItem("pause", String(value));
                                }}
                            />
                            <NumberInput
                                size="md"
                                label="Focus duration"
                                description="Duration in seconds when focus mode is active"
                                placeholder="3000"
                                min={1}
                                value={workTime}
                                onChange={(value: string | number) => {
                                    setWorkTime(Number(value));
                                    localStorage.setItem("work", String(value));
                                }}
                            />
                        </Stack>
                    </Box>

                    <Divider />

                    <Box>
                        <Text size="sm" fw={500} mb="sm">Display Options</Text>
                        <Stack gap="md">
                            <Group justify="space-between" align="flex-start">
                                <Box style={{ flex: 1 }}>
                                    <TextInput
                                        size="sm"
                                        label="Break text"
                                        placeholder="BREAK"
                                        value={breakText}
                                        disabled={!showBreakText}
                                        onChange={(e) => {
                                            setBreakText(e.currentTarget.value);
                                            localStorage.setItem('breakText', e.currentTarget.value);
                                        }}
                                    />
                                </Box>
                                <Switch
                                    mt={28}
                                    checked={showBreakText}
                                    onChange={(e) => {
                                        setShowBreakText(e.currentTarget.checked);
                                        localStorage.setItem('showBreakText', String(e.currentTarget.checked));
                                    }}
                                    label="Show"
                                />
                            </Group>

                            <Group justify="space-between" align="flex-start">
                                <Box style={{ flex: 1 }}>
                                    <TextInput
                                        size="sm"
                                        label="Streaks label"
                                        placeholder="Streaks"
                                        value={streaksText}
                                        disabled={!showStreaks}
                                        onChange={(e) => {
                                            setStreaksText(e.currentTarget.value);
                                            localStorage.setItem('streaksText', e.currentTarget.value);
                                        }}
                                    />
                                </Box>
                                <Switch
                                    mt={28}
                                    checked={showStreaks}
                                    onChange={(e) => {
                                        setShowStreaks(e.currentTarget.checked);
                                        localStorage.setItem('showStreaks', String(e.currentTarget.checked));
                                    }}
                                    label="Show"
                                />
                            </Group>

                            <Switch
                                checked={showTasks}
                                onChange={(e) => {
                                    setShowTasks(e.currentTarget.checked);
                                    localStorage.setItem('showTasks', String(e.currentTarget.checked));
                                }}
                                label="Show tasks panel"
                                description="Display the task list on the left side"
                            />

                            <Switch
                                checked={isTabletMode}
                                onChange={(e) => {
                                    setIsTabletMode(e.currentTarget.checked);
                                    localStorage.setItem('isTabletMode', String(e.currentTarget.checked));
                                }}
                                label="Tablet Mode"
                                description="Switch layout to Tablet Mode (side-by-side with Twitch chat)"
                            />
                        </Stack>
                    </Box>

                    <Divider />

                    <Box>
                        <Text size="sm" fw={500} mb="sm">Twitch Integration</Text>
                        <TextInput
                            size="md"
                            label="Channel name"
                            description="Your Twitch channel for chat commands"
                            placeholder="your_channel"
                            value={channel}
                            onChange={(value) => {
                                setChannel(value.currentTarget.value);
                                localStorage.setItem("channel", value.currentTarget.value);
                            }}
                        />
                    </Box>

                    <Divider />

                    <Box>
                        <Text size="sm" fw={500} mb="sm">Backup & Restore</Text>
                        <Group grow>
                            <Button
                                variant="light"
                                leftSection={<IconDownload size={18} />}
                                onClick={exportSettings}
                            >
                                Export
                            </Button>
                            <Button
                                variant="light"
                                leftSection={<IconUpload size={18} />}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                Import
                            </Button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={importSettings}
                                accept=".json"
                                style={{ display: 'none' }}
                            />
                        </Group>
                    </Box>
                </Stack>
            </Modal>
        </Fragment>
    );
}
