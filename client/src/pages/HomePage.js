import { useEffect, useState } from 'react';
import { Container, Link,Paper, Grid, Typography } from '@mui/material';

import WineCard from '../components/WineCard';
const config = require('../config.json');

export default function HomePage() {
  // We use the setState hook to persist information across renders (such as the result of our API calls)
  const [wineOfTheDay, setWineOfTheDay] = useState({});
  // TODO (TASK 13): add a state variable to store the app author (default to '')

const [wines, setWines] = useState([]);
 const [selectedWineTitle, setSelectedWineTitle] = useState(null);


  useEffect(() => {
    // Fetch request to get the song of the day. Fetch runs asynchronously.
    // The .then() method is called when the fetch request is complete
    // and proceeds to convert the result to a JSON which is finally placed in state.
    fetch(`http://${config.server_host}:${config.server_port}/random`)
      .then(res => res.json())
      .then(resJson => setWineOfTheDay(resJson));

  }, []);

  useEffect(() => {
    fetch(`http://${config.server_host}:${config.server_port}/top_wines`)
      .then(res => res.json())
      .then(resJson => {
        setWines(resJson);
      });
        }, []);




  return (
    <Container>
      {selectedWineTitle && <WineCard songId={selectedWineTitle} handleClose={() => setSelectedWineTitle(null)} />}
      <h2>Check out your wine of the day:&nbsp;
        <Link onClick={() => setSelectedWineTitle(wineOfTheDay.title)}>{wineOfTheDay.title}</Link>
      </h2>
      <Grid container spacing={2}>
        {wines.map((wine) => (
          <Grid item xs={12} sm={6} md={4} key={wine.title} onClick={() => setSelectedWineTitle(wine.title)}>
            <Paper elevation={3} style={{ padding: 16, cursor: 'pointer' }}>
              <Typography variant="h6">{wine.title}</Typography>
              <Typography variant="body1">Price: ${wine.price}</Typography>
              <Typography variant="body1">Points: {wine.points}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
