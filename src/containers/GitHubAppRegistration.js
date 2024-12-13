import React from 'react';
import { Button, Typography, Container, Box } from '@mui/material';
import { useHistory } from 'react-router-dom';

const GitHubAppRegistration = () => {
    const history = useHistory();

    const manifest = {
        name: "amitoo73",
        url: "http://localhost:3000",
        hook_attributes: {
            url: "https://d83a-122-161-243-162.ngrok-free.app/api/user/github/ws",
            active: true
        },
        redirect_url: "https://d83a-122-161-243-162.ngrok-free.app/api/user/github-setup",
        callback_urls: ["http://localhost:3000"],
        public: false,
        request_oauth_on_install: false,
        setup_url: "http://localhost:3000/github-source",
        setup_on_update: true,
        default_permissions: {
            contents: "read",
            metadata: "read",
            emails: "read",
            administration: "read",
            pull_requests: "write"
        },
        default_events: ["pull_request", "push"]
    };

    const handleFormSubmit = (e) => {
        e.preventDefault();

        const form = document.createElement('form');
        form.method = 'POST';
        form.action = 'https://github.com/settings/apps/new?state=r4c8804';

        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'manifest';
        input.value = JSON.stringify(manifest);

        form.appendChild(input);
        document.body.appendChild(form);
        form.submit();
    };

    return (
        <Container maxWidth="sm">
            <Box my={4}>
                <Typography variant="h4" gutterBottom>
                    Create GitHub App
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Click the button below to set up your GitHub App with the specified manifest.
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleFormSubmit}
                    className="App-link"
                >
                    Set up GitHub App
                </Button>
            </Box>
        </Container>
    );
};

export default GitHubAppRegistration;
