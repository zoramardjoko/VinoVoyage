import { useEffect, useState } from 'react';
import { Box, Button, Modal } from '@mui/material';

const config = require('../config.json');

// SongCard is a modal (a common example of a modal is a dialog window).
// Typically, modals will conditionally appear (specified by the Modal's open property)
// but in our implementation whether the Modal is open is handled by the parent component
// (see HomePage.js for example), since it depends on the state (selectedSongId) of the parent
export default function WineCard({ songId, handleClose }) {
  const [songData, setSongData] = useState({});

  // TODO (TASK 20): fetch the song specified in songId and based on the fetched album_id also fetch the album data
  // Hint: you need to both fill in the callback and the dependency array (what variable determines the information you need to fetch?)
  // Hint: since the second fetch depends on the information from the first, try nesting the second fetch within the then block of the first (pseudocode is provided)
  useEffect(() => {
    // Hint: here is some pseudocode to guide you
    fetch(`http://${config.server_host}:${config.server_port}/wine/${songId}`)
      .then(res => res.json())
      .then(resJson => setSongData(resJson)
)
  }, []);



  return (
    <Modal
      open={true}
      onClose={handleClose}
      style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}
    >
      <Box
        p={3}
        style={{ background: 'white', borderRadius: '16px', border: '2px solid #000', width: 600 }}
      >
        <h1>{songData.title}</h1>
        <p>Title: {songData.title}</p>
        <p>Designation: {songData.designation}</p>
        <p>Description: {songData.description}</p>
        <p>Price: ${songData.price}</p>
        <p>Points: {songData.points}</p>
        <p>Variety: {songData.variety}</p>
        <p>Winery: {songData.winery}</p>

        <Button onClick={handleClose} style={{ left: '50%', transform: 'translateX(-50%)' }} >
          Close
        </Button>
      </Box>
    </Modal>
  );
}
