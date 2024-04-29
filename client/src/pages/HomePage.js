import { useEffect, useState } from 'react';
import { Container, Divider, Link } from '@mui/material';
import { NavLink } from 'react-router-dom';

import LazyTable from '../components/LazyTable';
import SongCard from '../components/SongCard';
const config = require('../config.json');

export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [wineOfTheDay, setWineOfTheDay] = useState({});
  // TODO (TASK 13): add a state variable to store the app author (default to '')

  const [selectedWineTitle, setSelectedWineTitle] = useState(null);

  // The useEffect hook by default runs the provided callback after every render
  // The second (optional) argument, [], is the dependency array which signals
  // to the hook to only run the provided callback if the value of the dependency array
  // changes from the previous render. In this case, an empty array means the callback
  // will only run on the very first render.
  useEffect(() => {
    // Fetch request to get the song of the day. Fetch runs asynchronously.
    // The .then() method is called when the fetch request is complete
    // and proceeds to convert the result to a JSON which is finally placed in state.
    fetch(`http://${config.server_host}:${config.server_port}/random`)
      .then(res => res.json())
      .then(resJson => setWineOfTheDay(resJson));

  }, []);

  // Here, we define the columns of the "Top Songs" table. The songColumns variable is an array (in order)
  // of objects with each object representing a column. Each object has a "field" property representing
  // what data field to display from the raw data, "headerName" property representing the column label,
  // and an optional renderCell property which given a row returns a custom JSX element to display in the cell.
  const wineColumns = [
    {
      field: 'title',
      headerName: 'Song Title',
      renderCell: (row) => <Link onClick={() => setSelectedWineTitle(row.title)}>{row.title}</Link> // A Link component is used just for formatting purposes
    },
    {
      field: 'points',
      headerName: 'Points',
      renderCell: (row) => <Link onClick={() => setSelectedSongId(row.song_id)}>{row.points}</Link>
    },
    {
      field: 'plays',
      headerName: 'Plays'
    },
  ];

  // TODO (TASK 15): define the columns for the top albums (schema is Album Title, Plays), where Album Title is a link to the album page
  // Hint: this should be very similar to songColumns defined above, but has 2 columns instead of 3
  // Hint: recall the schema for an album is different from that of a song (see the API docs for /top_albums). How does that impact the "field" parameter and the "renderCell" function for the album title column?
  // const albumColumns = [

  // ]

  return (
    <Container>
      
      {selectedWineTitle && <SongCard songId={selectedWineTitle} handleClose={() => setSelectedWineTitle(null)} />}
      <h2>Check out your wine of the day:&nbsp;
        <Link onClick={() => setSelectedWineTitle(wineOfTheDay.title)}>{wineOfTheDay.title}</Link>
      </h2>
      <Divider />
      <h2>Top Wines</h2>
      <LazyTable route={`http://${config.server_host}:${config.server_port}/top_songs`} columns={wineColumns} />
      <Divider />
      
    </Container>
  );
};