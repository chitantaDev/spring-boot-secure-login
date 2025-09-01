import * as React from 'react';
import {useColorScheme} from '@mui/joy/styles';
import Button from '@mui/joy/Button';
import Select from '@mui/joy/Select';
import Option from '@mui/joy/Option';

export default function ModeToggle() {
    const { mode, setMode } = useColorScheme();
    const [mounted, setMounted] = React.useState(false);

    // copy pasta from my nextjs project, idk if thats needed here but it works so leaving it for now
    // FIXME: also this darkmode approach is kinda lame and doesnt work on all pages, just here for now, delete later or change
    // necessary for server-side rendering
    // because mode is undefined on the server
    React.useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) {
        return <Button variant="soft">Change mode</Button>;
    }

    return (
        <Select
            variant="soft"
            value={mode}
            onChange={(event, newMode) => {
                setMode(newMode);
            }}
            sx={{ width: 'max-content' }}
        >
            <Option value="system">System</Option>
            <Option value="light">Light</Option>
            <Option value="dark">Dark</Option>
        </Select>
    );
}
