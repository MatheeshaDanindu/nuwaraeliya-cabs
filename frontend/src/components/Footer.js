import React from 'react';
import { Box, Typography } from '@mui/material';

function Footer() {
  return (
    <Box component="footer" sx={{ mt: 8, py: 3, background: '#222', color: '#fff', textAlign: 'center' }}>
      <Typography variant="body2">
        &copy; {new Date().getFullYear()} Nuwara Eliya Cabs. All rights reserved.
      </Typography>
      <Typography variant="body2" sx={{ mt: 1 }}>
        Designed & Developed by Matheesha Herath
      </Typography>
    </Box>
  );
}

export default Footer;