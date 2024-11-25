import { Box, Container, Link, Paper, Stack, Typography } from "@mui/material";

import React from "react";

function Index() {
  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        {/* Header Section */}
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography variant="h2" component="h1" gutterBottom>
            NucBot
          </Typography>

          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Link href="https://www.apache.org/licenses/LICENSE-2.0">
              <img
                src="https://img.shields.io/badge/Apache-2.0-yellow?style=for-the-badge&logo=apache"
                alt="License"
              />
            </Link>
            <Link href="https://www.npmjs.com/package/nucleoidjs">
              <img
                src="https://img.shields.io/badge/NPM-red?style=for-the-badge&logo=npm"
                alt="NPM"
              />
            </Link>
            <Link href="https://discord.com/invite/eWXFCCuU5y">
              <img
                src="https://img.shields.io/badge/Discord-lightgrey?style=for-the-badge&logo=discord"
                alt="Discord"
              />
            </Link>
          </Stack>

          <Box sx={{ my: 4 }}>
            <img
              src={
                "https://github.com/NucleoidAI/NucBot/blob/main/.github/media/banner.gif?raw=true"
              }
              alt="Banner"
              style={{ maxWidth: "100%", height: "auto" }}
            />
          </Box>

          <Typography variant="body1" sx={{ fontFamily: "monospace", mb: 4 }}>
            01010111 01101101 01011001 00111110
          </Typography>
        </Box>

        {/* Installation Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 } }>
          <Typography variant="h4" gutterBottom>
            Installation
          </Typography>
          <Box
            component="pre"
            sx={{
              backgroundColor: theme => theme.palette.grey[700],
              p: 2,
              borderRadius: 1,
              overflow: "auto",
            }}
          >
            npm install -g nucbot
          </Box>
        </Paper>

        {/* Usage Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Usage
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
            Initialize a New Project
          </Typography>

          <Typography variant="body1" paragraph>
            The init command helps you create a new NucBot project. There are
            two ways to use it:
          </Typography>

          <Typography variant="h6" gutterBottom>
            1. Interactive Mode:
          </Typography>
          <Box
            component="pre"
            sx={{
              backgroundColor: theme => theme.palette.grey[700],
              p: 2,
              borderRadius: 1,
              overflow: "auto",
            }}
          >
            nucbot init
          </Box>
          <Typography variant="body1" paragraph>
            This will start an interactive prompt to guide you through project
            creation.
          </Typography>

          <Typography variant="h6" gutterBottom>
            2. Direct Mode:
          </Typography>
          <Box
            component="pre"
            sx={{
              backgroundColor: theme => theme.palette.grey[700],
              p: 2,
              borderRadius: 1,
              overflow: "auto",
            }}
          >
            nucbot init --patform &lt;platform&gt; --name &lt;project-name&gt;
          </Box>

          <Typography variant="subtitle1" sx={{ mt: 2, fontWeight: "bold" }}>
            Options:
          </Typography>
          <Box component="ul">
            <li>
              <Typography component="span" sx={{ fontFamily: "monospace" }}>
                -p, --platform
              </Typography>
              : Choose a project type. (platform, platform-express)
            </li>
            <li>
              <Typography component="span" sx={{ fontFamily: "monospace" }}>
                -n, --name
              </Typography>
              : Set your project name
            </li>
          </Box>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Update Project Configurations
          </Typography>

          <Box
            component="pre"
            sx={{
              backgroundColor: theme => theme.palette.grey[700],
              p: 2,
              borderRadius: 1,
              overflow: "auto",
            }}
          >
            nucbot update
          </Box>

          <Typography variant="body1" sx={{ mt: 2 }}>
            This command will:
          </Typography>
          <Box component="ul">
            <li>Update all project components to their latest versions</li>
            <li>Maintain compatibility with your current configuration</li>
          </Box>

          <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
            Note: Make sure you're in your project's root directory when running
            the update command.
          </Typography>
        </Paper>

        {/* License Section */}
        <Paper elevation={3} sx={{ p: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            License
          </Typography>
          <Typography variant="body1">
            This project is licensed under the Apache License 2.0 - see the{" "}
            <Link href="LICENSE">LICENSE</Link> file for details.
          </Typography>
        </Paper>
      </Box>
    </Container>
  );
}

export default Index;
